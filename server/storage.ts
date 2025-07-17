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
  getContactByRuta(ruta: string): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
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
      website: "https://www.cashirts.cl",
      bankName: "Mercado Pago y BCI",
      bankAccount: "MP: 1054307950 / BCI: 777014142023",
      accType: "Vista",
      bankHolder: "Cristian Antonio Alfaro Sepúlveda",
      inDev: "false",
      ruta: "cristian",
      approved: "true",
      visible: "true",
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

export const storage = new MemStorage();
