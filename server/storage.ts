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
      name: "Cristian Alfaro",
      title: "CAShirts / Crt",
      phone: "+52 123 456 7890",
      email: "cashirts@gmail.com",
      whatsapp: "+521234567890",
      instagram: "@cashirts",
      website: "https://www.cashirts.cl",
      bankName: "BCI",
      bankAccount: "1234 5678 9012 3456",
      accType: "Cuenta Corriente",
      bankHolder: "Cristian Alfaro Sepulveda",
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
