import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get contact information
  app.get("/api/contact", async (req, res) => {
    try {
      const contact = await storage.getContact();
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contact" });
    }
  });

  // Update contact information
  app.put("/api/contact", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const updatedContact = await storage.updateContact(contact);
      res.json(updatedContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Generate vCard
  app.get("/api/contact/vcard", async (req, res) => {
    try {
      const contact = await storage.getContact();
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:${contact.title}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.website}
NOTE:WhatsApp: https://wa.me/${contact.whatsapp.replace(/\D/g, '')}
Instagram: ${contact.instagram}
Banco: ${contact.bankName}
Cuenta: ${contact.bankAccount}
CLABE: ${contact.bankClabe}
Titular: ${contact.bankHolder}
END:VCARD`;

      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', 'attachment; filename="contacto.vcf"');
      res.send(vCardContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate vCard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
