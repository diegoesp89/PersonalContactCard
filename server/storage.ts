import {
  users,
  contacts,
  menus,
  menuItems,
  type User,
  type InsertUser,
  type Contact,
  type InsertContact,
  type Menu,
  type InsertMenu,
  type MenuItem,
  type InsertMenuItem,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getContact(): Promise<Contact | undefined>;
  getContactByRuta(ruta: string): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // Menu methods
  getAllMenus(): Promise<Menu[]>;
  getMenuBySlug(slug: string): Promise<Menu | undefined>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu>;
  deleteMenu(id: number): Promise<void>;
  
  // Menu item methods
  getMenuItems(menuId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private currentContactId: number;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;

    // Initialize with default contact data
    const defaultContact: Contact = {
      id: 1,
      name: "Cristian Alfaro Sepúlveda",
      title: "ℂ𝕒𝕤.ℂ𝕣𝕥",
      phone: "+569 8230 6759",
      email: "crt.cas@gmail.com",
      whatsapp: "+56982306759",
      instagram: "cashirts_camisas_a_medida",
      tiktok: "",
      linkedin: "",
      telegram: "",
      website: "https://www.cashirts.cl",
      profileImage: "",
      bankName: "Mercado Pago y BCI",
      bankAccount: "MP: 1054307950 / BCI: 777014142023",
      accType: "Vista",
      bankHolder: "Cristian Antonio Alfaro Sepúlveda",
      inDev: "false",
      ruta: "cristian",
      backgroundColor: "#1e293b", // Default slate-800

      banks: JSON.stringify([
        {
          id: "mp",
          name: "Mercado Pago",
          account: "1054307950",
          accountType: "Digital",
          holder: "Cristian Antonio Alfaro Sepúlveda",
          rut: "14.142.023-2",
          email: "crt.alfaros@gmail.com",
          logo: "/mp.svg"
        },
        {
          id: "bci",
          name: "BCI (Banco Crédito e Inversiones)",
          account: "777014142023",
          accountType: "Vista",
          holder: "Cristian Antonio Alfaro Sepúlveda",
          rut: "14.142.023-2",
          email: "crt.alfaros@gmail.com",
          logo: "/bci.svg"
        }
      ])
    };
    this.contacts.set(1, defaultContact);
    this.currentContactId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getContact(): Promise<Contact | undefined> {
    // Return the first contact for backward compatibility
    return this.contacts.get(1);
  }

  async getContactByRuta(ruta: string): Promise<Contact | undefined> {
    for (const contact of this.contacts.values()) {
      if (contact.ruta === ruta) {
        return contact;
      }
    }
    return undefined;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, updateData: Partial<InsertContact>): Promise<Contact> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    const updatedContact: Contact = { ...existingContact, ...updateData };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }
}

// New DatabaseStorage class
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getContact(): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).limit(1);
    return contact || undefined;
  }

  async getContactByRuta(ruta: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.ruta, ruta));
    return contact || undefined;
  }

  async getAllContacts(): Promise<Contact[]> {
    const allContacts = await db.select().from(contacts);
    return allContacts;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: number, updateData: Partial<InsertContact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Menu methods implementation
  async getAllMenus(): Promise<Menu[]> {
    return db.select().from(menus);
  }

  async getMenuBySlug(slug: string): Promise<Menu | undefined> {
    const result = await db.select().from(menus).where(eq(menus.slug, slug));
    return result[0];
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [created] = await db.insert(menus).values(menu).returning();
    return created;
  }

  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu> {
    // Filter out timestamp fields and other fields that shouldn't be updated manually
    const { createdAt, updatedAt, ...updateData } = menu as any;
    
    // Add current timestamp for updatedAt
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const [updated] = await db.update(menus).set(dataWithTimestamp).where(eq(menus.id, id)).returning();
    return updated;
  }

  async deleteMenu(id: number): Promise<void> {
    await db.delete(menus).where(eq(menus.id, id));
  }

  // Menu item methods implementation
  async getMenuItems(menuId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.menuId, menuId));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [created] = await db.insert(menuItems).values(item).returning();
    return created;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    // Filter out timestamp fields and other fields that shouldn't be updated manually
    const { createdAt, updatedAt, ...updateData } = item as any;
    
    // Add current timestamp for updatedAt
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const [updated] = await db.update(menuItems).set(dataWithTimestamp).where(eq(menuItems.id, id)).returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
}

export const storage = new DatabaseStorage();
