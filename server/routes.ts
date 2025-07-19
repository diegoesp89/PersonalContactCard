import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";

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

  const httpServer = createServer(app);
  return httpServer;
}