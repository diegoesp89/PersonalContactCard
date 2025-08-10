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
  textColor: text("text_color").notNull().default("#ffffff"), // Default white text
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

// Menu configuration table
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // e.g., "menu", "pizza-menu", "drinks"
  name: text("name").notNull(), // e.g., "Menú Principal", "Pizzas", "Bebidas"
  description: text("description").notNull().default(""),
  
  // Color scheme
  primaryColor: text("primary_color").notNull().default("#d97706"), // amber-600
  secondaryColor: text("secondary_color").notNull().default("#92400e"), // amber-700
  accentColor: text("accent_color").notNull().default("#fbbf24"), // yellow-400
  backgroundColor: text("background_color").notNull().default("#451a03"), // amber-950
  textColor: text("text_color").notNull().default("#fef3c7"), // amber-100
  
  // Feature toggles
  showChefRecommendation: integer("show_chef_recommendation").notNull().default(1), // 1 = true, 0 = false
  showSpicyIndicator: integer("show_spicy_indicator").notNull().default(1),
  showVegetarianIndicator: integer("show_vegetarian_indicator").notNull().default(1),
  showExtraLabels: integer("show_extra_labels").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull().references(() => menus.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  category: text("category").notNull(), // e.g., "entradas", "principales", "postres"
  image: text("image").notNull().default(""),
  
  // Special properties
  isVegetarian: integer("is_vegetarian").notNull().default(0),
  isSpicy: integer("is_spicy").notNull().default(0),
  specialLabel: text("special_label").notNull().default(""), // e.g., "Recomendación del Chef"
  
  // Order for display
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menus.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

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
