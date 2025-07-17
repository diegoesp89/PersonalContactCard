import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  instagram: text("instagram").notNull(),
  tiktok: text("tiktok").notNull().default(""),
  linkedin: text("linkedin").notNull().default(""),
  telegram: text("telegram").notNull().default(""),
  website: text("website").notNull(),
  profileImage: text("profile_image").notNull().default(""),
  bankName: text("bank_name").notNull(),
  bankAccount: text("bank_account").notNull(),
  accType: text("accType").notNull(),
  bankHolder: text("bank_holder").notNull(),
  inDev: text("inDev").notNull().default("false"),
  ruta: text("ruta").notNull().unique(),
  backgroundColor: text("background_color").notNull().default("#1e293b"), // Default slate-800

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
