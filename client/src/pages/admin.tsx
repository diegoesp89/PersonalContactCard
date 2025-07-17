import { useState } from "react";
import AdminLogin from "./admin-login";
import AdminDashboard from "./admin-dashboard";
import ContactEditor from "./contact-editor";

interface Contact {
  id?: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  website: string;
  bankName: string;
  bankAccount: string;
  accType: string;
  bankHolder: string;
  inDev: string;
  ruta: string;

  banks: string;
}

type AdminView = "login" | "dashboard" | "editor";

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("login");
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [password, setPassword] = useState("");

  const handleLogin = (inputPassword: string) => {
    setPassword(inputPassword);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentView("login");
    setPassword("");
    setSelectedContact(undefined);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView("editor");
  };

  const handleBackToDashboard = () => {
    setSelectedContact(undefined);
    setCurrentView("dashboard");
  };

  if (currentView === "login") {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (currentView === "editor") {
    return (
      <ContactEditor 
        contact={selectedContact}
        onBack={handleBackToDashboard}
        password={password}
      />
    );
  }

  return (
    <AdminDashboard 
      onLogout={handleLogout}
      onEditContact={handleEditContact}
      password={password}
    />
  );
}