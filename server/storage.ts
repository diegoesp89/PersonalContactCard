import {
  users,
  contacts,
  type User,
  type InsertUser,
  type Contact,
  type InsertContact,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getContact(): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(contact: InsertContact): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contact: Contact | undefined;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.currentUserId = 1;

    // Initialize with default contact data
    this.contact = {
      id: 1,
      name: "Cristian Alfaro Sepúlveda",
      title: "ℂ𝕒𝕤.ℂ𝕣𝕥",
      phone: "+569 8230 6759",
      email: "crt.cas@gmail.com",
      whatsapp: "+56982306759",
      instagram: "cashirts_camisas_a_medida",
      website: "https://www.cashirts.cl",
      bankName: "Mercado Pago y BCI",
      bankAccount: "MP: 1054307950 / BCI: 777014142023",
      accType: "Vista",
      bankHolder: "Cristian Antonio Alfaro Sepúlveda",
      inDev: "false",
    };
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
    return this.contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = { ...insertContact, id: 1 };
    this.contact = contact;
    return contact;
  }

  async updateContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = { ...insertContact, id: 1 };
    this.contact = contact;
    return contact;
  }
}

export const storage = new MemStorage();
