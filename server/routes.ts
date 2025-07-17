import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const result = insertContactSchema.safeParse(contactData);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
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

  // Generate and download vCard
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
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.website}
NOTE:WhatsApp: ${contact.whatsapp}\\nInstagram: ${contact.instagram}\\nBank: ${contact.bankName}\\nAccount: ${contact.bankAccount}\\nType: ${contact.accType}\\nHolder: ${contact.bankHolder}
END:VCARD`;

      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${contact.name.replace(/\s+/g, '_')}.vcf"`);
      res.send(vcard);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate vCard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}