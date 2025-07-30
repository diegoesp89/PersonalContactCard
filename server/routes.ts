import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, analytics, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { Client } from "@replit/object-storage";
import { db } from "./db";
import { eq, desc, sql, count, and, gte, lte } from "drizzle-orm";
import { logger } from "./logger";

export async function registerRoutes(app: Express): Promise<Server> {
  // Determine environment and storage configuration
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
  let objectStorage: Client | null = null;
  
  // Initialize Object Storage for both production and development with enhanced error handling
  try {
    // Add startup delay to allow Object Storage services to be available
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    objectStorage = new Client();
    console.log(`${isProduction ? 'Production' : 'Development'} mode: Object Storage initialized successfully with bucket "casbucket"`);
    
    // Test Object Storage connectivity with enhanced retry
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      try {
        await objectStorage.list();
        console.log('Object Storage connectivity verified');
        break;
      } catch (testError) {
        retryCount++;
        console.warn(`Object Storage test failed (attempt ${retryCount}/${maxRetries}):`, testError instanceof Error ? testError.message : 'Unknown error');
        
        if (retryCount < maxRetries) {
          // Exponential backoff: wait 1s, 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }
    
    if (retryCount === maxRetries) {
      console.warn('Object Storage connectivity could not be verified after all retries, but client is initialized');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
    console.warn(`${isProduction ? 'Production' : 'Development'} mode: Object Storage initialization failed, falling back to local storage:`, errorMessage);
    objectStorage = null; // Ensure it's explicitly null on failure
  }

  // Configure uploads directory based on environment
  const uploadsDir = isProduction 
    ? path.join(process.cwd(), "uploads") // Production: isolated directory
    : path.join(process.cwd(), "client", "public", "uploads"); // Development: accessible via Vite
    
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log(`File storage configuration:
  - Environment: ${isProduction ? 'Production' : 'Development'}
  - Object Storage: ${objectStorage ? 'Available (PRIMARY)' : 'Not available'}
  - Local directory: ${uploadsDir} (backup only)
  - Serving via: /api/image/ (Object Storage first, local fallback)`);

  // Automatic migration of existing local images to Object Storage on startup
  if (objectStorage && fs.existsSync(uploadsDir)) {
    console.log('Running automatic image migration to Object Storage...');
    
    try {
      const localFiles = fs.readdirSync(uploadsDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
      });
      
      if (localFiles.length > 0) {
        console.log(`Found ${localFiles.length} local images to migrate`);
        
        // Check what's already in Object Storage
        let existingFiles: string[] = [];
        try {
          const listResult = await objectStorage.list();
          existingFiles = listResult.error ? [] : (listResult.value || []).map(f => f.name);
        } catch (error) {
          console.warn('Could not check existing Object Storage files:', error instanceof Error ? error.message : 'Unknown error');
        }
        
        let migrated = 0;
        let skipped = 0;
        
        for (const file of localFiles) {
          if (existingFiles.includes(file)) {
            skipped++;
            continue;
          }
          
          try {
            const filePath = path.join(uploadsDir, file);
            const fileData = fs.readFileSync(filePath);
            
            const uploadResult = await objectStorage.uploadFromBytes(file, fileData);
            
            if (uploadResult.error) {
              console.warn(`Failed to migrate ${file}:`, uploadResult.error.message);
            } else {
              migrated++;
              console.log(`Migrated: ${file}`);
            }
          } catch (error) {
            console.warn(`Error migrating ${file}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
        console.log(`Migration completed: ${migrated} migrated, ${skipped} already existed`);
      } else {
        console.log('No local images found to migrate');
      }
    } catch (error) {
      console.warn('Migration process failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Setup automatic backup monitoring if Object Storage is available
  if (objectStorage) {
    // Schedule periodic backup checks every 30 minutes
    setInterval(async () => {
      try {
        console.log('Running automatic backup check...');
        
        if (!fs.existsSync(uploadsDir)) {
          return;
        }
        
        const localFiles = fs.readdirSync(uploadsDir).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
        });
        
        if (localFiles.length === 0) {
          return;
        }
        
        // Check Object Storage status
        let objectStorageFiles: string[] = [];
        try {
          const listResult = await objectStorage.list();
          objectStorageFiles = listResult.error ? [] : (listResult.value || []).map(f => f.name);
        } catch (error) {
          console.warn('Automatic backup check: Object Storage not accessible');
          return;
        }
        
        const missingFiles = localFiles.filter(file => !objectStorageFiles.includes(file));
        
        if (missingFiles.length > 0) {
          console.warn(`BACKUP WARNING: ${missingFiles.length} local images not backed up to Object Storage:`);
          missingFiles.slice(0, 5).forEach(file => console.warn(`  - ${file}`));
          if (missingFiles.length > 5) {
            console.warn(`  ... and ${missingFiles.length - 5} more files`);
          }
          console.warn('Use /api/gallery/backup-local endpoint to backup these files.');
        } else {
          console.log(`Backup check: All ${localFiles.length} local images are backed up to Object Storage`);
        }
      } catch (error) {
        console.error('Automatic backup check failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    console.log('Automatic backup monitoring enabled (30-minute intervals)');
  }

  // Auto-migration: Ensure all local images are backed up to Object Storage in production
  if (isProduction && objectStorage && fs.existsSync(uploadsDir)) {
    console.log('Starting auto-migration of local images to Object Storage...');
    try {
      const localFiles = fs.readdirSync(uploadsDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
      });
      
      for (const file of localFiles) {
        try {
          const filePath = path.join(uploadsDir, file);
          const fileBuffer = fs.readFileSync(filePath);
          
          // Check if file already exists in Object Storage
          const listResult = await objectStorage.list();
          const existingFiles = listResult.error ? [] : listResult.value || [];
          
          if (!existingFiles.some(existing => existing.name === file)) {
            const uploadResult = await objectStorage.uploadFromBytes(file, fileBuffer);
            if (uploadResult.error) {
              console.warn(`Failed to migrate ${file}:`, uploadResult.error.message);
            } else {
              console.log(`Successfully migrated ${file} to Object Storage`);
            }
          }
        } catch (migrationError) {
          console.warn(`Error migrating ${file}:`, migrationError instanceof Error ? migrationError.message : 'Unknown error');
        }
      }
      
      console.log(`Auto-migration completed. Processed ${localFiles.length} files.`);
      
      // Set up periodic backup verification
      if (localFiles.length > 0) {
        console.log('IMPORTANT: Enable automatic backups by using /api/gallery/backup-local endpoint periodically');
      }
    } catch (migrationError) {
      console.warn('Auto-migration failed:', migrationError instanceof Error ? migrationError.message : 'Unknown error');
    }
  }

  // Serve static files from uploads directory BEFORE other routes
  app.use('/uploads', (req, res, next) => {
    const filename = req.path.substring(1); // Remove leading slash
    const filePath = path.join(uploadsDir, filename);
    
    logger.log('STATIC_FILE_REQUEST', {
      requestPath: req.path,
      filename,
      filePath,
      exists: fs.existsSync(filePath)
    }, req);
    
    if (fs.existsSync(filePath)) {
      logger.log('STATIC_FILE_SERVED', { filePath }, req);
      res.sendFile(filePath);
    } else {
      logger.log('STATIC_FILE_NOT_FOUND', { 
        filePath,
        uploadsDir,
        availableFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []
      }, req);
      res.status(404).send('File not found');
    }
  });

  // Configure multer for memory storage (we'll handle file storage ourselves)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      const filterData = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
        encoding: file.encoding
      };

      console.log('File filter check:', filterData);
      logger.log('FILE_FILTER_CHECK', filterData);
      
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        logger.log('FILE_FILTER_ACCEPTED', { mimetype: file.mimetype });
        cb(null, true);
      } else {
        logger.log('FILE_FILTER_REJECTED', { 
          mimetype: file.mimetype, 
          allowedTypes: allowedMimes 
        });
        console.log('File rejected, mimetype not allowed:', file.mimetype);
        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedMimes.join(', ')}`));
      }
    }
  });

  // Middleware for admin authentication
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const { password } = req.body;
    // Accept both admin and superadmin passwords
    if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
      return res.status(401).json({ error: "Invalid password" });
    }
    next();
  };

  // Get contact by route (for dynamic routes)
  app.get("/api/contact/:ruta", async (req, res) => {
    try {
      const { ruta } = req.params;
      const contact = await storage.getContactByRuta(ruta);
      if (!contact) {
        logger.log('CONTACT_NOT_FOUND', { ruta }, req);
        return res.status(404).json({ error: "Contact not found" });
      }
      logger.log('CONTACT_VIEW', { 
        ruta, 
        contactName: contact.name,
        contactId: contact.id 
      }, req);
      res.json(contact);
    } catch (error) {
      const { ruta } = req.params;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.log('CONTACT_VIEW_ERROR', { ruta, error: errorMessage }, req);
      res.status(500).json({ error: "Failed to get contact" });
    }
  });

  // Get contact (backward compatibility)
  app.get("/api/contact", async (req, res) => {
    try {
      const contact = await storage.getContact();
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to get contact" });
    }
  });

  // Admin login
  app.post("/api/admin/login", authenticateAdmin, (req, res) => {
    res.json({ success: true, message: "Authentication successful" });
  });

  // Get all contacts (admin only)
  app.post("/api/admin/contacts", authenticateAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get contacts" });
    }
  });

  // Create new contact (admin only)
  app.post("/api/admin/contacts/create", authenticateAdmin, async (req, res) => {
    try {
      const { password, ...contactData } = req.body;
      const isSuperAdmin = password === "Mafatanga2025";
      
      // Ensure ruta is always lowercase and sanitized
      if (contactData.ruta) {
        contactData.ruta = contactData.ruta.toLowerCase().replace(/[^a-z-]/g, '');
      }
      
      const result = insertContactSchema.safeParse(contactData);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      // Set default value for inDev - always true for new contacts
      if (!result.data.inDev) {
        result.data.inDev = "true";
      }
      
      const contact = await storage.createContact(result.data);
      logger.log('CONTACT_CREATED', { 
        contactId: contact.id,
        contactName: contact.name,
        ruta: contact.ruta,
        adminAction: true 
      }, req);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  // Update contact (admin only)
  app.post("/api/admin/contacts/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { password, ...updateData } = req.body;
      
      // Only superadmin can modify inDev field
      if ("inDev" in updateData && password !== "Mafatanga2025") {
        delete updateData.inDev; // Remove inDev from update if not superadmin
      }
      
      // Ensure ruta is always lowercase and sanitized
      if ("ruta" in updateData && updateData.ruta) {
        updateData.ruta = updateData.ruta.toLowerCase().replace(/[^a-z-]/g, '');
      }
      
      const contact = await storage.updateContact(parseInt(id), updateData);
      logger.log('CONTACT_UPDATED', { 
        contactId: parseInt(id),
        contactName: contact.name,
        updatedFields: Object.keys(updateData),
        adminAction: true 
      }, req);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // Delete contact (admin only)
  app.delete("/api/admin/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (password !== "CamisasWenas.!") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      await storage.deleteContact(parseInt(id));
      logger.log('CONTACT_DELETED', { 
        contactId: parseInt(id),
        adminAction: true 
      }, req);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Upload profile image with Object Storage
  app.post("/api/upload", (req, res) => {
    logger.log('UPLOAD_ENDPOINT_HIT', {
      contentType: req.get('content-type'),
      contentLength: req.get('content-length'),
      userAgent: req.get('user-agent'),
      isMobile: /Mobile|Android|iPhone|iPad/i.test(req.get('user-agent') || ''),
      hasFiles: !!req.files,
      bodySize: JSON.stringify(req.body || {}).length,
      rawHeaders: req.rawHeaders
    }, req);

    // Handle mobile upload issues
    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      logger.log('UPLOAD_CONTENT_TYPE_ISSUE', {
        contentType: req.get('content-type'),
        userAgent: req.get('user-agent'),
        bodyKeys: Object.keys(req.body || {}),
        hasRawBody: !!req.body
      }, req);
    }

    upload.single('profileImage')(req, res, async (err) => {
      if (err) {
        logger.log('MULTER_ERROR', {
          error: err.message,
          code: err.code,
          field: err.field,
          stack: err.stack,
          isMobile: /Mobile|Android|iPhone|iPad/i.test(req.get('user-agent') || '')
        }, req);
        console.error('Multer error:', err);
        return res.status(400).json({ 
          error: err.message,
          details: 'File upload failed at multer level'
        });
      }
      
      await handleImageUpload(req, res);
    });
  });
  
  async function handleImageUpload(req: any, res: any) {
    try {
      logger.log('UPLOAD_REQUEST_START', {
        hasFile: !!req.file,
        headers: {
          'content-type': req.get('content-type'),
          'content-length': req.get('content-length')
        },
        bodyKeys: Object.keys(req.body || {})
      }, req);

      console.log('Upload request received:', {
        file: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });
      
      if (!req.file) {
        logger.log('UPLOAD_ERROR', { reason: 'No file in request' }, req);
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Generate unique filename with proper extension handling
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      // Handle JPG vs JPEG extension consistency
      if (req.file.mimetype === 'image/jpeg' && !fileExtension) {
        fileExtension = '.jpg';
      } else if (req.file.mimetype === 'image/jpeg' && fileExtension === '.jpeg') {
        fileExtension = '.jpg'; // Normalize to .jpg for consistency
      }
      
      const filename = 'profile-' + uniqueSuffix + fileExtension;
      
      logger.log('FILE_PROCESSING', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer?.length,
        generatedFilename: filename,
        fileExtension,
        uploadsDir
      }, req);

      console.log('Processing file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        generatedFilename: filename
      });
      
      // ALWAYS try Object Storage first (both dev and production) with enhanced retry logic
      let imageUrl = `/api/image/${filename}`;
      let objectStorageSuccess = false;
      
      if (objectStorage) {
        // Enhanced retry logic for Object Storage upload
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries && !objectStorageSuccess) {
          try {
            const uploadResult = await objectStorage.uploadFromBytes(filename, req.file.buffer);
            
            // Handle the Result type from Object Storage
            if (uploadResult.error) {
              throw new Error(`Object Storage upload failed: ${uploadResult.error.message}`);
            }
            
            console.log(`Uploaded to Object Storage (attempt ${retryCount + 1}):`, filename);
            imageUrl = `/api/image/${filename}`;
            objectStorageSuccess = true;
            break;
          } catch (storageError) {
            retryCount++;
            const errorMessage = storageError instanceof Error ? storageError.message : 'Unknown Object Storage error';
            console.warn(`Object Storage upload attempt ${retryCount}/${maxRetries} failed:`, errorMessage);
            
            if (retryCount < maxRetries) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
            }
          }
        }
        
        if (!objectStorageSuccess) {
          logger.log('OBJECT_STORAGE_UPLOAD_FAILED_ALL_RETRIES', {
            filename,
            retryCount: maxRetries,
            fallbackMode: 'Object Storage upload failed - using local storage as backup'
          }, req);
          console.warn(`Object Storage upload failed after ${maxRetries} retries. Using local storage as backup.`);
        }
      }
      
      // Always save locally as backup/fallback (both dev and prod)
      const localPath = path.join(uploadsDir, filename);
      
      try {
        logger.log('FILE_SAVE_ATTEMPT', {
          localPath,
          bufferSize: req.file.buffer.length,
          uploadsDir,
          dirExists: fs.existsSync(uploadsDir)
        }, req);

        fs.writeFileSync(localPath, req.file.buffer);
        console.log('File saved locally:', localPath);
        
        // Verify the file was written correctly
        const stats = fs.statSync(localPath);
        const verification = {
          exists: fs.existsSync(localPath),
          size: stats.size,
          expectedSize: req.file.buffer.length,
          path: localPath
        };
        
        logger.log('FILE_SAVE_SUCCESS', verification, req);
        console.log('File verification:', verification);
        
        if (stats.size !== req.file.buffer.length) {
          throw new Error(`File size mismatch: expected ${req.file.buffer.length}, got ${stats.size}`);
        }
      } catch (writeError) {
        const errorMessage = writeError instanceof Error ? writeError.message : 'Unknown file write error';
        const errorStack = writeError instanceof Error ? writeError.stack : undefined;
        logger.log('FILE_SAVE_ERROR', {
          error: errorMessage,
          stack: errorStack,
          localPath,
          uploadsDir,
          dirExists: fs.existsSync(uploadsDir)
        }, req);
        console.error('Error writing file locally:', writeError);
        throw writeError;
      }
      
      // Invalidate gallery cache after successful upload
      galleryCache = [];
      galleryCacheTime = 0;
      
      logger.log('GALLERY_CACHE_INVALIDATED_UPLOAD', { 
        reason: 'image_uploaded',
        filename 
      }, req);
      
      console.log('Upload successful:', { filename, imageUrl });
      logger.log('IMAGE_UPLOADED', { 
        filename, 
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        imageUrl,
        cacheInvalidated: true,
        environment: isProduction ? 'production' : 'development'
      }, req);
      res.json({ imageUrl });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload image", 
        details: errorMessage,
        stack: errorStack 
      });
    }
  }

  // Serve images from Object Storage or local fallback
  app.get("/api/image/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      logger.log('IMAGE_REQUEST', {
        filename,
        objectStorageAvailable: !!objectStorage,
        uploadsDir
      }, req);
      
      if (objectStorage) {
        try {
          // Try to get from Object Storage first
          const downloadResult = await objectStorage.downloadAsBytes(filename);
          
          // Handle the Result type from Object Storage
          if (downloadResult.error) {
            throw new Error(`Object Storage download failed: ${downloadResult.error.message}`);
          }
          
          let imageBuffer: Buffer;
          const rawData = downloadResult.value as any;
          
          // Convert Array to Buffer if necessary (Object Storage returns Array sometimes)
          if (Array.isArray(rawData) && rawData.length === 1 && Buffer.isBuffer(rawData[0])) {
            // Handle [Buffer] case
            imageBuffer = rawData[0];
          } else if (Array.isArray(rawData)) {
            // Handle Array of bytes case
            imageBuffer = Buffer.from(rawData);
          } else if (rawData instanceof Uint8Array) {
            imageBuffer = Buffer.from(rawData);
          } else if (Buffer.isBuffer(rawData)) {
            imageBuffer = rawData;
          } else {
            throw new Error(`Unexpected data type from Object Storage: ${typeof rawData}, constructor: ${rawData?.constructor?.name}`);
          }
          
          // Set appropriate headers with better MIME type detection
          const ext = path.extname(filename).toLowerCase();
          const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', 
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
          }[ext] || 'image/jpeg';
          
          console.log('Serving image from Object Storage:', {
            filename,
            extension: ext,
            contentType,
            size: imageBuffer.length
          });
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
          res.setHeader('Content-Length', imageBuffer.length.toString());
          res.end(imageBuffer, 'binary');
          return;
        } catch (objectStorageError) {
          const errorMessage = objectStorageError instanceof Error ? objectStorageError.message : 'Unknown Object Storage error';
          console.log('Object Storage download failed, trying local:', errorMessage);
        }
      }
      
      // Fallback to local file
      const localPath = path.join(uploadsDir, filename);
      
      logger.log('IMAGE_LOCAL_FALLBACK', {
        filename,
        localPath,
        exists: fs.existsSync(localPath),
        uploadsDir
      }, req);
      
      if (fs.existsSync(localPath)) {
        logger.log('IMAGE_SERVED_LOCAL', { filename, localPath }, req);
        res.sendFile(localPath);
      } else {
        logger.log('IMAGE_NOT_FOUND', { 
          filename, 
          localPath,
          uploadsDir,
          uploadsContents: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : 'Directory does not exist'
        }, req);
        res.status(404).json({ error: "Image not found" });
      }
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  // Gallery images cache to prevent random clearing
  let galleryCache: Array<{filename: string, url: string, uploadDate: Date}> = [];
  let galleryCacheTime: number = 0;
  const GALLERY_CACHE_TTL = 30000; // 30 seconds cache
  
  // Object Storage health monitoring
  let lastObjectStorageSuccess: number = 0;
  let objectStorageFailCount: number = 0;

  // Helper function to retry Object Storage operations
  async function retryObjectStorageOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`Object Storage operation attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Get gallery images from Object Storage with enhanced reliability
  app.get("/api/gallery", async (req, res) => {
    try {
      const now = Date.now();
      
      // Return cached data if fresh and available
      if (galleryCache.length > 0 && (now - galleryCacheTime) < GALLERY_CACHE_TTL) {
        logger.log('GALLERY_CACHE_HIT', {
          imageCount: galleryCache.length,
          cacheAge: now - galleryCacheTime
        }, req);
        return res.json(galleryCache);
      }
      
      // Safety check: if cache is empty but physical files exist, force rebuild
      if (galleryCache.length === 0 && fs.existsSync(uploadsDir)) {
        const physicalFiles = fs.readdirSync(uploadsDir).filter(file => 
          /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file)
        );
        
        if (physicalFiles.length > 0) {
          logger.log('GALLERY_SAFETY_REBUILD', { 
            physicalFilesFound: physicalFiles.length,
            cacheWasEmpty: true,
            forcingRebuild: true
          }, req);
        }
      }
      
      let imageFiles: Array<{filename: string, url: string, uploadDate: Date}> = [];
      let objectStorageSuccess = false;
      
      logger.log('GALLERY_REQUEST', {
        objectStorageAvailable: !!objectStorage,
        uploadsDir,
        uploadsDirExists: fs.existsSync(uploadsDir),
        cacheAge: now - galleryCacheTime,
        cachedCount: galleryCache.length
      }, req);
      
      if (objectStorage) {
        try {
          // Get from Object Storage with retry logic
          const listResult = await retryObjectStorageOperation(async () => {
            const result = await objectStorage.list();
            if (result.error) {
              throw new Error(`Object Storage list failed: ${result.error.message}`);
            }
            return result;
          });
          
          const objects = listResult.value;
          imageFiles = objects
            .filter((obj: any) => {
              const isImage = obj.name && typeof obj.name === 'string';
              if (!isImage) return false;
              
              const ext = path.extname(obj.name).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
            })
            .map((obj: any) => ({
              filename: obj.name,
              url: `/api/image/${obj.name}`,
              uploadDate: obj.createdAt ? new Date(obj.createdAt) : new Date()
            }))
            .sort((a: any, b: any) => b.uploadDate.getTime() - a.uploadDate.getTime());
          
          objectStorageSuccess = true;
          lastObjectStorageSuccess = now;
          objectStorageFailCount = 0;
          
          logger.log('GALLERY_OBJECT_STORAGE_SUCCESS', {
            objectCount: objects.length,
            imageCount: imageFiles.length,
            images: imageFiles.slice(0, 5).map(f => ({ filename: f.filename, url: f.url }))
          }, req);
          
        } catch (objectStorageError) {
          const errorMessage = objectStorageError instanceof Error ? objectStorageError.message : 'Unknown Object Storage error';
          objectStorageFailCount++;
          
          logger.log('GALLERY_OBJECT_STORAGE_FAILED', { 
            error: errorMessage,
            failCount: objectStorageFailCount,
            lastSuccess: lastObjectStorageSuccess ? new Date(lastObjectStorageSuccess).toISOString() : 'never',
            fallbackToCache: galleryCache.length > 0
          }, req);
          console.error('Object Storage list failed:', errorMessage);
        }
      }
      
      // If Object Storage failed and we have cache, use cache
      if (!objectStorageSuccess && galleryCache.length > 0) {
        logger.log('GALLERY_FALLBACK_TO_CACHE', {
          imageCount: galleryCache.length,
          cacheAge: now - galleryCacheTime
        }, req);
        return res.json(galleryCache);
      }
      
      // If Object Storage failed or not available, try local files (development fallback)
      if (!objectStorageSuccess && fs.existsSync(uploadsDir)) {
        try {
          const files = fs.readdirSync(uploadsDir);
          
          logger.log('GALLERY_LOCAL_FILES', {
            uploadsDir,
            allFiles: files,
            imageCount: files.length
          }, req);
          
          imageFiles = files
            .filter(file => {
              const ext = path.extname(file).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext);
            })
            .map(file => ({
              filename: file,
              url: `/api/image/${file}`, // Always use API endpoint
              uploadDate: fs.statSync(path.join(uploadsDir, file)).mtime
            }))
            .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        } catch (localError) {
          logger.log('GALLERY_LOCAL_FAILED', { error: localError }, req);
        }
      }
      
      // Update cache only if we got results
      if (imageFiles.length > 0 || objectStorageSuccess) {
        // Only update cache if we have actual images
        if (imageFiles.length > 0) {
          galleryCache = imageFiles;
          galleryCacheTime = now;
          
          logger.log('GALLERY_CACHE_UPDATED', { 
            imageCount: imageFiles.length, 
            objectStorageSuccess,
            source: objectStorageSuccess ? 'object-storage' : 'local-files'
          }, req);
        } else {
          logger.log('GALLERY_CACHE_NOT_UPDATED', { 
            reason: 'no_images_found',
            objectStorageSuccess
          }, req);
        }

      }
      
      logger.log('GALLERY_RESPONSE', {
        imageCount: imageFiles.length,
        source: objectStorageSuccess ? 'object-storage' : 'local-or-cache',
        images: imageFiles.slice(0, 5).map(f => ({ filename: f.filename, url: f.url }))
      }, req);
      
      res.json(imageFiles);
    } catch (error) {
      console.error('Gallery error:', error);
      logger.log('GALLERY_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' }, req);
      
      // As last resort, return cache if available
      if (galleryCache.length > 0) {
        logger.log('GALLERY_EMERGENCY_CACHE', { imageCount: galleryCache.length }, req);
        return res.json(galleryCache);
      }
      
      res.status(500).json({ error: "Failed to get gallery images" });
    }
  });

  // Check image storage health and migrate local images to Object Storage (admin only)
  app.post("/api/gallery/backup-local", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Authenticate admin
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      if (!isProduction || !objectStorage) {
        return res.json({
          success: false,
          message: "Backup only available in production with Object Storage",
          environment: isProduction ? "production" : "development",
          objectStorage: !!objectStorage
        });
      }
      
      // Find all local images
      const localImages = [];
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext)) {
            localImages.push(file);
          }
        }
      }
      
      const results = {
        total: localImages.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Check what's already in Object Storage
      let existingFiles: string[] = [];
      try {
        const listResult = await objectStorage.list();
        existingFiles = listResult.error ? [] : (listResult.value || []).map(f => f.name);
      } catch (error) {
        results.errors.push(`Failed to list Object Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Upload missing files
      for (const file of localImages) {
        if (!existingFiles.includes(file)) {
          try {
            const filePath = path.join(uploadsDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            
            const uploadResult = await objectStorage.uploadFromBytes(file, fileBuffer);
            if (uploadResult.error) {
              throw new Error(uploadResult.error.message);
            }
            
            results.success++;
            console.log(`Backed up to Object Storage: ${file}`);
          } catch (error) {
            results.failed++;
            const errorMsg = `Failed to backup ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            results.errors.push(errorMsg);
            console.warn(errorMsg);
          }
        }
      }
      
      logger.log('GALLERY_BACKUP_COMPLETED', {
        ...results,
        adminAction: true,
        uploadsDir,
        existingInObjectStorage: existingFiles.length
      }, req);
      
      res.json({
        success: true,
        message: "Backup operation completed",
        results: {
          ...results,
          existingInObjectStorage: existingFiles.length
        }
      });
    } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({ error: "Failed to backup images" });
    }
  });

  // Gallery status endpoint for debugging (admin only)
  app.get("/api/gallery/status", async (req, res) => {
    try {
      const { password } = req.query;
      
      // Authenticate admin
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      const physicalFiles = fs.existsSync(uploadsDir) 
        ? fs.readdirSync(uploadsDir).filter(file => 
            /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file)
          )
        : [];
      
      const now = Date.now();
      
      res.json({
        cache: {
          size: galleryCache.length,
          lastUpdate: galleryCacheTime ? new Date(galleryCacheTime).toISOString() : 'never',
          age: galleryCacheTime ? now - galleryCacheTime : 'n/a',
          ttl: GALLERY_CACHE_TTL,
          isExpired: galleryCacheTime ? (now - galleryCacheTime) >= GALLERY_CACHE_TTL : true
        },
        storage: {
          objectStorageAvailable: !!objectStorage,
          lastObjectStorageSuccess: lastObjectStorageSuccess ? new Date(lastObjectStorageSuccess).toISOString() : 'never',
          objectStorageFailCount,
          uploadsDir,
          physicalFilesCount: physicalFiles.length,
          physicalFiles: physicalFiles.slice(0, 10) // Show first 10 files
        },
        environment: {
          isProduction,
          nodeEnv: process.env.NODE_ENV,
          replitDeployment: process.env.REPLIT_DEPLOYMENT
        }
      });
    } catch (error) {
      console.error('Gallery status error:', error);
      res.status(500).json({ error: "Failed to get gallery status" });
    }
  });

  // Clear gallery cache manually (admin only)
  app.post("/api/gallery/clear-cache", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Authenticate admin
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      const oldCacheSize = galleryCache.length;
      const oldCacheTime = galleryCacheTime;
      
      galleryCache = [];
      galleryCacheTime = 0;
      
      logger.log('GALLERY_CACHE_CLEARED', {
        oldCacheSize,
        oldCacheTime: oldCacheTime ? new Date(oldCacheTime).toISOString() : 'never',
        objectStorageFailCount,
        lastObjectStorageSuccess: lastObjectStorageSuccess ? new Date(lastObjectStorageSuccess).toISOString() : 'never',
        adminAction: true
      }, req);
      
      res.json({ 
        success: true, 
        message: "Gallery cache cleared successfully",
        oldCacheSize,
        objectStorageHealth: {
          failCount: objectStorageFailCount,
          lastSuccess: lastObjectStorageSuccess ? new Date(lastObjectStorageSuccess).toISOString() : 'never'
        }
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  // Delete image from gallery (admin only)
  app.delete("/api/gallery/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const { password } = req.body;
      
      // Authenticate admin
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      // Delete from Object Storage if available
      if (objectStorage) {
        try {
          const deleteResult = await objectStorage.delete(filename);
          
          // Handle the Result type from Object Storage
          if (deleteResult.error) {
            throw new Error(`Object Storage delete failed: ${deleteResult.error.message}`);
          }
          
          console.log('Image deleted from Object Storage:', filename);
        } catch (objectStorageError) {
          const errorMessage = objectStorageError instanceof Error ? objectStorageError.message : 'Unknown Object Storage error';
          console.log('Failed to delete from Object Storage:', errorMessage);
        }
      }
      
      // Also delete local file if it exists
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Local image deleted:', filename);
      }
      
      // Invalidate gallery cache after deletion
      galleryCache = [];
      galleryCacheTime = 0;
      
      logger.log('GALLERY_CACHE_INVALIDATED_DELETE', { 
        reason: 'image_deleted',
        filename 
      }, req);
      
      logger.log('IMAGE_DELETED', { 
        filename,
        adminAction: true,
        cacheInvalidated: true
      }, req);
      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Generate and download vCard by route
  app.get("/api/contact/:ruta/vcard", async (req, res) => {
    try {
      const { ruta } = req.params;
      const contact = await storage.getContactByRuta(ruta);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TITLE:${contact.title}
TEL:${contact.phone || ''}
EMAIL:${contact.email}
URL:${contact.website || ''}
NOTE:WhatsApp: ${contact.whatsapp || ''}\\nInstagram: ${contact.instagram || ''}\\nTikTok: ${contact.tiktok || ''}\\nLinkedIn: ${contact.linkedin || ''}\\nTelegram: ${contact.telegram || ''}\\nOficina: ${contact.officeAddress || ''}
END:VCARD`;

      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${contact.name.replace(/\s+/g, '_')}.vcf"`);
      res.send(vcard);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  // Generate and download vCard (default contact)
  app.get("/api/contact/vcard", async (req, res) => {
    try {
      const contact = await storage.getContact();
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TITLE:${contact.title}
TEL:${contact.phone || ''}
EMAIL:${contact.email}
URL:${contact.website || ''}
NOTE:WhatsApp: ${contact.whatsapp || ''}\\nInstagram: ${contact.instagram || ''}\\nTikTok: ${contact.tiktok || ''}\\nLinkedIn: ${contact.linkedin || ''}\\nTelegram: ${contact.telegram || ''}\\nOficina: ${contact.officeAddress || ''}
END:VCARD`;

      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${contact.name.replace(/\s+/g, '_')}.vcf"`);
      res.send(vcard);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  // Generate QR Code for contact
  app.get("/api/contact/:id/qr", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contacts = await storage.getAllContacts();
      const foundContact = contacts.find(c => c.id === contactId);
      
      if (!foundContact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const contactUrl = `https://cashirts.cl/${foundContact.ruta}`;
      
      // Generate QR code as PNG buffer
      const qrCodeBuffer = await QRCode.toBuffer(contactUrl, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="QR_${foundContact.name.replace(/\s+/g, '_')}.png"`);
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Error generating QR code" });
    }
  });

  // Analytics endpoints
  
  // Track event (used by frontend to log interactions)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { contactId, event, userAgent, referrer } = req.body;
      
      // Get IP address from request
      const ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
      
      const analyticsData = {
        contactId: parseInt(contactId),
        event,
        userAgent: userAgent || req.get('User-Agent') || null,
        ipAddress,
        referrer: referrer || req.get('Referer') || null,
      };
      
      console.log('Tracking event:', analyticsData);
      
      await db.insert(analytics).values(analyticsData);
      res.json({ success: true });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // Get analytics stats for a contact (admin or contact password)
  app.post("/api/analytics/:ruta", async (req, res) => {
    try {
      const { password } = req.body;
      const { ruta } = req.params;
      const { days = 30 } = req.query; // Default to last 30 days
      
      // First get the contact to find its ID
      const contact = await storage.getContactByRuta(ruta);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      // Check if password is correct - admin passwords OR contact-specific password
      const isAdmin = password === "CamisasWenas.!" || password === "Mafatanga2025";
      const isContactPassword = contact.statsPassword && password === contact.statsPassword;
      
      if (!isAdmin && !isContactPassword) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      // Get total counts by event type
      const eventCounts = await db
        .select({
          event: analytics.event,
          count: count(analytics.id)
        })
        .from(analytics)
        .where(
          and(
            eq(analytics.contactId, contact.id),
            gte(analytics.timestamp, startDate)
          )
        )
        .groupBy(analytics.event);
      
      // Get daily visits for the last 30 days
      const dailyVisits = await db
        .select({
          date: sql<string>`DATE(${analytics.timestamp})`,
          views: count(analytics.id)
        })
        .from(analytics)
        .where(
          and(
            eq(analytics.contactId, contact.id),
            eq(analytics.event, 'view'),
            gte(analytics.timestamp, startDate)
          )
        )
        .groupBy(sql`DATE(${analytics.timestamp})`)
        .orderBy(sql`DATE(${analytics.timestamp})`);
      
      // Get hourly distribution (last 7 days)
      const hourlyDistribution = await db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${analytics.timestamp})`,
          views: count(analytics.id)
        })
        .from(analytics)
        .where(
          and(
            eq(analytics.contactId, contact.id),
            eq(analytics.event, 'view'),
            gte(analytics.timestamp, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        )
        .groupBy(sql`EXTRACT(HOUR FROM ${analytics.timestamp})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${analytics.timestamp})`);
      
      // Get recent events (last 100)
      const recentEvents = await db
        .select()
        .from(analytics)
        .where(eq(analytics.contactId, contact.id))
        .orderBy(desc(analytics.timestamp))
        .limit(100);
      
      const stats = {
        contact,
        eventCounts,
        dailyVisits,
        hourlyDistribution,
        recentEvents,
        period: `Last ${days} days`
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // Logs endpoint (admin only)
  app.get("/logs", async (req, res) => {
    try {
      // Simple password check in query parameter
      const { password } = req.query;
      
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>System Logs - Access Required</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              .form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
              input[type="password"], input[type="submit"] { padding: 10px; margin: 5px; }
              input[type="submit"] { background: #007cba; color: white; border: none; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>🔐 System Logs Access</h1>
            <div class="form">
              <form method="GET">
                <label>Password: </label>
                <input type="password" name="password" required>
                <input type="submit" value="Access Logs">
              </form>
            </div>
          </body>
          </html>
        `);
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logs = logger.getLogs(limit);
      
      logger.log('LOGS_ACCESSED', { 
        logCount: logs.length,
        limit,
        adminAction: true 
      }, req);

      // Return HTML formatted logs
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>System Logs</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 20px; 
              background: #1a1a1a; 
              color: #00ff00; 
            }
            h1 { color: #ffffff; text-align: center; }
            .log-entry { 
              background: #2a2a2a; 
              margin: 10px 0; 
              padding: 10px; 
              border-radius: 4px; 
              border-left: 4px solid #00ff00; 
            }
            .timestamp { color: #888; }
            .action { color: #00ccff; font-weight: bold; }
            .details { color: #ffff88; }
            .ip { color: #ff8888; }
            .controls { 
              text-align: center; 
              margin: 20px 0; 
              background: #333; 
              padding: 15px; 
              border-radius: 8px; 
            }
            .controls a { 
              color: #00ccff; 
              text-decoration: none; 
              margin: 0 10px; 
              padding: 8px 15px; 
              background: #555; 
              border-radius: 4px; 
            }
            .controls a:hover { background: #777; }
          </style>
          <script>
            function refreshLogs() {
              window.location.reload();
            }
            setInterval(refreshLogs, 30000); // Auto refresh every 30 seconds
          </script>
        </head>
        <body>
          <h1>📋 System Logs - Last ${logs.length} entries</h1>
          
          <div class="controls">
            <a href="?password=${encodeURIComponent(password as string)}&limit=50">Show 50</a>
            <a href="?password=${encodeURIComponent(password as string)}&limit=100">Show 100</a>
            <a href="?password=${encodeURIComponent(password as string)}&limit=500">Show 500</a>
            <a href="javascript:refreshLogs()">🔄 Refresh</a>
          </div>

          ${logs.reverse().map(log => `
            <div class="log-entry">
              <div>
                <span class="timestamp">[${new Date(log.timestamp).toLocaleString()}]</span>
                <span class="action">${log.action}</span>
                ${log.ipAddress ? `<span class="ip">(${log.ipAddress})</span>` : ''}
              </div>
              <div class="details">${JSON.stringify(log.details, null, 2)}</div>
            </div>
          `).join('')}
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.log('LOGS_ACCESS_ERROR', { error: errorMessage }, req);
      res.status(500).send('Error loading logs: ' + errorMessage);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}