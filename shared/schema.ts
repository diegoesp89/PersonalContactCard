import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  phone: text("phone").notNull().default("[]"), // JSON string of SocialLink[]
  email: text("email").notNull().default("[]"), // JSON string of SocialLink[]
  whatsapp: text("whatsapp").notNull().default("[]"), // JSON string of SocialLink[]
  instagram: text("instagram").notNull().default("[]"), // JSON string of SocialLink[]
  tiktok: text("tiktok").notNull().default("[]"), // JSON string of SocialLink[]
  linkedin: text("linkedin").notNull().default("[]"), // JSON string of SocialLink[]
  telegram: text("telegram").notNull().default("[]"), // JSON string of SocialLink[]
  youtube: text("youtube").notNull().default("[]"), // JSON string of SocialLink[]
  facebook: text("facebook").notNull().default("[]"), // JSON string of SocialLink[]
  website: text("website").notNull().default("[]"), // JSON string of SocialLink[]
  profileImage: text("profile_image").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  officeAddress: text("office_address").notNull().default(""),
  bankName: text("bank_name").notNull(),
  bankAccount: text("bank_account").notNull(),
  accType: text("accType").notNull(),
  bankHolder: text("bank_holder").notNull(),
  inDev: text("inDev").notNull().default("false"),
  ruta: text("ruta").notNull().unique(),
  backgroundColor: text("background_color").notNull().default("#1e293b"), // Default slate-800
  statsPassword: text("stats_password"),
  defaultLanguage: text("default_language").notNull().default("es"), // es, en, pt

  banks: text("banks").notNull().default("[]"), // JSON array of bank objects
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Bank interface for JSON storage
export interface Bank {
  id: string;
  name: string;
  account: string;
  accountType: string;
  holder: string;
  rut: string;
  email: string;
  logo?: string;
}

// Social media link interface for JSON storage
export interface SocialLink {
  id: string;
  url: string;
  label?: string;
}

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Analytics table for tracking user interactions
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  event: text("event").notNull(), // 'view', 'whatsapp_click', 'instagram_click', 'vcard_download', etc.
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  timestamp: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
