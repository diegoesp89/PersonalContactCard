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
  // Initialize Replit Object Storage client (only in production or if configured)
  let objectStorage: Client | null = null;
  
  // Temporarily disable Object Storage until properly configured
  console.log('Using local file storage (Object Storage will be configured for production)');
  
  // TODO: Enable Object Storage for production deployments:
  // 1. Create bucket in Replit Object Storage
  // 2. Uncomment the following code
  /*
  if (process.env.NODE_ENV === 'production') {
    try {
      objectStorage = new Client();
      console.log('Object Storage initialized successfully');
    } catch (error) {
      console.log('Object Storage not available, falling back to local storage:', error.message);
    }
  }
  */

  // Ensure uploads directory exists (fallback for dev)
  const uploadsDir = path.join(process.cwd(), "client", "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for memory storage (we'll handle file storage ourselves)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      console.log('File filter check:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
      });
      
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
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
      logger.log('CONTACT_VIEW_ERROR', { ruta, error: error.message }, req);
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
    upload.single('profileImage')(req, res, async (err) => {
      if (err) {
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
      console.log('Upload request received:', {
        file: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });
      
      if (!req.file) {
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
      
      console.log('Processing file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        generatedFilename: filename
      });
      
      // Try Object Storage first, fallback to local
      let imageUrl = `/uploads/${filename}`;
      
      if (objectStorage) {
        try {
          await objectStorage.uploadFromBytes(filename, req.file.buffer);
          console.log('Uploaded to Object Storage:', filename);
          imageUrl = `/api/image/${filename}`;
        } catch (storageError) {
          console.log('Object Storage upload failed, using local:', storageError.message);
        }
      }
      
      // Always save locally as backup/fallback
      const localPath = path.join(uploadsDir, filename);
      
      try {
        fs.writeFileSync(localPath, req.file.buffer);
        console.log('File saved locally:', localPath);
        
        // Verify the file was written correctly
        const stats = fs.statSync(localPath);
        console.log('File verification:', {
          exists: fs.existsSync(localPath),
          size: stats.size,
          expectedSize: req.file.buffer.length
        });
        
        if (stats.size !== req.file.buffer.length) {
          throw new Error(`File size mismatch: expected ${req.file.buffer.length}, got ${stats.size}`);
        }
      } catch (writeError) {
        console.error('Error writing file locally:', writeError);
        throw writeError;
      }
      
      console.log('Upload successful:', { filename, imageUrl });
      logger.log('IMAGE_UPLOADED', { 
        filename, 
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        imageUrl 
      }, req);
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload image", 
        details: error.message,
        stack: error.stack 
      });
    }
  }

  // Serve images from Object Storage or local fallback
  app.get("/api/image/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (objectStorage) {
        try {
          // Try to get from Object Storage first
          const imageBuffer = await objectStorage.downloadAsBytes(filename);
          
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
          res.send(imageBuffer);
          return;
        } catch (objectStorageError) {
          console.log('Object Storage download failed, trying local:', objectStorageError.message);
        }
      }
      
      // Fallback to local file
      const localPath = path.join(uploadsDir, filename);
      if (fs.existsSync(localPath)) {
        res.sendFile(localPath);
      } else {
        res.status(404).json({ error: "Image not found" });
      }
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  // Get gallery images from Object Storage
  app.get("/api/gallery", async (req, res) => {
    try {
      let imageFiles = [];
      
      if (objectStorage) {
        try {
          // Get from Object Storage
          const objects = await objectStorage.list();
          imageFiles = objects
            .filter(obj => {
              const ext = path.extname(obj.name).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            })
            .map(obj => ({
              filename: obj.name,
              url: `/api/image/${obj.name}`,
              uploadDate: new Date(obj.createdAt)
            }))
            .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        } catch (objectStorageError) {
          console.log('Object Storage list failed, using local files:', objectStorageError.message);
        }
      }
      
      // If Object Storage failed or not available, use local files
      if (imageFiles.length === 0 && fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        imageFiles = files
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          })
          .map(file => ({
            filename: file,
            url: `/uploads/${file}`,
            uploadDate: fs.statSync(path.join(uploadsDir, file)).mtime
          }))
          .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
      }
      
      res.json(imageFiles);
    } catch (error) {
      console.error('Gallery error:', error);
      res.status(500).json({ error: "Failed to get gallery images" });
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
          await objectStorage.delete(filename);
          console.log('Image deleted from Object Storage:', filename);
        } catch (objectStorageError) {
          console.log('Failed to delete from Object Storage:', objectStorageError.message);
        }
      }
      
      // Also delete local file if it exists
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Local image deleted:', filename);
      }
      
      logger.log('IMAGE_DELETED', { 
        filename,
        adminAction: true 
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

      const contactUrl = `https://cashirts.replit.app/${foundContact.ruta}`;
      
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
      const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
        (req.connection.socket ? req.connection.socket.remoteAddress : null) || 'unknown';
      
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
      logger.log('LOGS_ACCESS_ERROR', { error: error.message }, req);
      res.status(500).send('Error loading logs: ' + error.message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}