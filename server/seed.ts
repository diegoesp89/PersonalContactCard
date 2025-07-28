import { db } from "./db";
import { contacts } from "@shared/schema";

export async function seedDatabase() {
  // Check if we already have data
  const existingContacts = await db.select().from(contacts).limit(1);
  
  if (existingContacts.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  // Insert default contact
  await db.insert(contacts).values({
    name: "Cristian Alfaro Sepúlveda",
    title: "ℂ𝕒𝕤.ℂ𝕣𝕥",
    phone: JSON.stringify([
      { id: "1", url: "+569 8230 6759", label: "Celular Principal" }
    ]),
    email: JSON.stringify([
      { id: "1", url: "crt.cas@gmail.com", label: "Email Principal" }
    ]),
    whatsapp: JSON.stringify([
      { id: "1", url: "+56982306759", label: "WhatsApp Principal" }
    ]),
    instagram: JSON.stringify([
      { id: "1", url: "cashirts_camisas_a_medida", label: "" }
    ]),
    tiktok: JSON.stringify([]),
    linkedin: JSON.stringify([]),
    telegram: JSON.stringify([]),
    youtube: JSON.stringify([]),
    facebook: JSON.stringify([]),
    website: JSON.stringify([
      { id: "1", url: "https://www.cashirts.cl", label: "Sitio Web CAS" }
    ]),
    profileImage: "",
    officeAddress: "Av. Las Condes 123, Las Condes, Santiago",
    bankName: "Mercado Pago y BCI",
    bankAccount: "MP: 1054307950 / BCI: 777014142023",
    accType: "Vista",
    bankHolder: "Cristian Antonio Alfaro Sepúlveda",
    inDev: "false",
    ruta: "cristian",
    backgroundColor: "#1e293b",
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
  });

  console.log("Database seeded successfully");
}