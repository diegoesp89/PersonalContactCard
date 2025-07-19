import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, analytics, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { db } from "./db";
import { eq, desc, sql, count, and, gte, lte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "client", "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
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
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
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
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Upload profile image
  app.post("/api/upload", upload.single('profileImage'), (req, res) => {
    try {
      console.log('Upload request received:', {
        file: req.file ? {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const filename = req.file.filename;
      const imageUrl = `/uploads/${filename}`;
      
      console.log('Upload successful:', { filename, imageUrl });
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Upload profile image (admin alternative endpoint)
  app.post("/api/admin/upload-image", upload.single('profileImage'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const filename = req.file.filename;
      const imageUrl = `/uploads/${filename}`;
      
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Get gallery images
  app.get("/api/gallery", (req, res) => {
    try {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        })
        .map(file => ({
          filename: file,
          url: `/uploads/${file}`,
          uploadDate: fs.statSync(path.join(uploadsDir, file)).mtime
        }))
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()); // Most recent first
      
      res.json(imageFiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to get gallery images" });
    }
  });

  // Delete image from gallery (admin only)
  app.delete("/api/gallery/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const { password } = req.body;
      
      // Authenticate admin
      if (password !== "CamisasWenas.!" && password !== "Mafatanga2025") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      const filePath = path.join(uploadsDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      // Delete the file
      fs.unlinkSync(filePath);
      console.log('Image deleted:', filename);
      
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

  const httpServer = createServer(app);
  return httpServer;
}