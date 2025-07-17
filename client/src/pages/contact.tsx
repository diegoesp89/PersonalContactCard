import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  Instagram,
  Building2,
  Share2,
  Download,
  ExternalLink,
  Copy,
  Globe,
  QrCode,
  X,
} from "lucide-react";
import { FaTiktok, FaLinkedin, FaTelegram } from "react-icons/fa";

interface Contact {
  id: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  telegram: string;
  website: string;
  profileImage: string;
  officeAddress: string;
  bankName: string;
  bankAccount: string;
  accType: string;
  bankHolder: string;
  inDev: string;
  ruta: string;
  backgroundColor: string;

  banks: string; // JSON string of Bank[]
}

interface Bank {
  id: string;
  name: string;
  account: string;
  accountType: string;
  holder: string;
  rut: string;
  email: string;
  logo?: string;
}

export default function ContactPage() {
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQRView, setShowQRView] = useState(false);

  // Try to get route parameter from URL
  const path = window.location.pathname;
  const routeParam = path === "/" || path === "" ? null : path.substring(1);
  
  const { data: contact, isLoading } = useQuery<Contact>({
    queryKey: routeParam ? ["/api/contact", routeParam] : ["/api/contact"],
    queryFn: routeParam 
      ? () => fetch(`/api/contact/${routeParam}`).then(res => {
          if (!res.ok) throw new Error('Contact not found');
          return res.json();
        })
      : () => fetch("/api/contact").then(res => {
          if (!res.ok) throw new Error('Contact not found');
          return res.json();
        })
  });

  const handleSaveContact = async () => {
    try {
      if (!contact) {
        throw new Error("No contact data available");
      }

      const endpoint = routeParam 
        ? `/api/contact/${routeParam}/vcard` 
        : "/api/contact/vcard";
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to generate vCard");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Contacto guardado",
        description: "El archivo de contacto se ha descargado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleShareContact = () => {
    setShowShareModal(true);
    setShowQRView(false);
  };

  const handleShowQR = async () => {
    if (!contact) return;
    
    setLoadingQR(true);
    setShowQRView(true);
    
    try {
      // Generate QR code
      const response = await fetch(`/api/contact/${contact.id}/qr`);
      if (response.ok) {
        const blob = await response.blob();
        const qrUrl = URL.createObjectURL(blob);
        setQrCodeUrl(qrUrl);
      } else {
        throw new Error("Failed to generate QR code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      });
      setShowQRView(false);
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace se ha copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Contacto de ${contact?.name}`,
          text: "Aquí tienes mi información de contacto",
          url: window.location.href,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      // User cancelled share or error occurred
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl && contact) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `QR_${contact.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR descargado",
        description: "El código QR se ha descargado exitosamente",
      });
    }
  };

  const handleCopyBank = async (bank: Bank) => {
    const bankData = `${bank.name}
Cuenta ${bank.accountType}: ${bank.account}
RUT: ${bank.rut}
Titular: ${bank.holder}
Correo: ${bank.email}`;

    try {
      await navigator.clipboard.writeText(bankData);
      toast({
        title: "¡Datos copiados!",
        description: `Los datos de ${bank.name} han sido copiados al portapapeles.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron copiar los datos de ${bank.name}.`,
        variant: "destructive",
      });
    }
  };

  const getWhatsAppUrl = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  const getTelUrl = (phone: string) => {
    return `tel:${phone}`;
  };

  const getEmailUrl = (email: string) => {
    return `mailto:${email}`;
  };

  const getInstagramUrl = (username: string) => {
    const cleanUsername = username.replace(/^@+/, "");
    return `https://instagram.com/${cleanUsername}`;
  };

  const getTikTokUrl = (username: string) => {
    const cleanUsername = username.replace(/^@+/, "");
    return `https://tiktok.com/@${cleanUsername}`;
  };

  const getLinkedInUrl = (username: string) => {
    const cleanUsername = username.replace(/^@+/, "");
    return `https://linkedin.com/in/${cleanUsername}`;
  };

  const getTelegramUrl = (username: string) => {
    const cleanUsername = username.replace(/^@+/, "");
    return `https://t.me/${cleanUsername}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 w-full max-w-md">
            <div className="animate-pulse space-y-4">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 w-full max-w-md text-center">
            <p className="text-slate-400">
              No se pudo cargar la información de contacto
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Parse banks from JSON
  const banks: Bank[] = contact?.banks ? JSON.parse(contact.banks) : [];



  return (
    <div className="min-h-screen flex flex-col">
      {/* Development Banner - Solo se muestra si inDev es "true" */}
      {contact?.inDev === "true" && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 p-3">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-amber-200 text-sm font-medium">
              ⚠️ Esta página está en desarrollo, estos datos podrían no ser
              correctos
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4" style={{ backgroundColor: contact.backgroundColor || '#1e293b' }}>
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: `${contact.backgroundColor || '#1e293b'}e6` }}>
            {/* Header with Profile */}
            <div className="text-center mb-8 relative">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg overflow-hidden relative">
                {contact.profileImage ? (
                  <img
                    src={contact.profileImage}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* DEMO Ribbon - Solo se muestra si inDev es "true" */}
              {contact?.inDev === "true" && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 shadow-lg border border-red-600 z-20 whitespace-nowrap rounded">
                  DEMO
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                {contact.name}
              </h1>
              <p className="text-slate-400 font-medium">{contact.title}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={handleSaveContact}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Guardar Contacto
              </Button>
              
              <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleShareContact}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-slate-100 text-center flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5 text-violet-400" />
                      Compartir Contacto
                    </DialogTitle>
                  </DialogHeader>
                  
                  {!showQRView ? (
                    <div className="flex flex-col space-y-4 py-4">
                      {/* Contact Info */}
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-slate-100">{contact?.name}</h3>
                        <p className="text-sm text-slate-400">{contact?.title}</p>
                      </div>

                      {/* Share Options */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleShowQR}
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-300 hover:scale-105"
                        >
                          <QrCode className="w-5 h-5 mr-3" />
                          Mostrar Código QR
                        </Button>
                        
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="w-full bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 py-3 rounded-xl"
                        >
                          <Copy className="w-5 h-5 mr-3" />
                          Copiar Enlace
                        </Button>
                        
                        <Button
                          onClick={handleNativeShare}
                          variant="outline"
                          className="w-full bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 py-3 rounded-xl"
                        >
                          <Share2 className="w-5 h-5 mr-3" />
                          Compartir Enlace
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-6 py-4">
                      {/* Back Button */}
                      <Button
                        onClick={() => setShowQRView(false)}
                        variant="ghost"
                        className="self-start text-slate-400 hover:text-slate-100 p-2"
                      >
                        ← Volver
                      </Button>

                      {/* QR Code Display */}
                      <div className="bg-white p-4 rounded-xl shadow-lg">
                        {loadingQR ? (
                          <div className="w-48 h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                          </div>
                        ) : qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="Código QR del contacto"
                            className="w-48 h-48 object-contain"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                            Error al cargar QR
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-slate-100">{contact?.name}</h3>
                        <p className="text-sm text-slate-400">{contact?.title}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Escanea el código para acceder al contacto
                        </p>
                      </div>

                      {/* QR Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                          onClick={handleDownloadQR}
                          variant="outline"
                          className="flex-1 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                          disabled={!qrCodeUrl}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar QR
                        </Button>
                        
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="flex-1 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Enlace
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              {/* WhatsApp */}
              {contact.whatsapp && (
                <a
                  href={getWhatsAppUrl(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-green-500/10 hover:border-green-500/30"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Phone className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">WhatsApp</h3>
                    <p className="text-slate-400 text-sm">{contact.whatsapp}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* Phone */}
              {contact.phone && (
                <a
                  href={getTelUrl(contact.phone)}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Phone className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">Teléfono</h3>
                    <p className="text-slate-400 text-sm">{contact.phone}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* Email */}
              <a
                href={getEmailUrl(contact.email)}
                className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
              >
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <Mail className="text-white w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-100 font-semibold">Correo</h3>
                  <p className="text-slate-400 text-sm">{contact.email}</p>
                </div>
                <ExternalLink className="text-slate-500 w-4 h-4" />
              </a>

              {/* Instagram */}
              {contact.instagram && (
                <a
                  href={getInstagramUrl(contact.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Instagram className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">Instagram</h3>
                    <p className="text-slate-400 text-sm">@{contact.instagram.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* TikTok */}
              {contact.tiktok && (
                <a
                  href={getTikTokUrl(contact.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaTiktok className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">TikTok</h3>
                    <p className="text-slate-400 text-sm">@{contact.tiktok.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* LinkedIn */}
              {contact.linkedin && (
                <a
                  href={getLinkedInUrl(contact.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaLinkedin className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">LinkedIn</h3>
                    <p className="text-slate-400 text-sm">{contact.linkedin}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* Telegram */}
              {contact.telegram && (
                <a
                  href={getTelegramUrl(contact.telegram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaTelegram className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">Telegram</h3>
                    <p className="text-slate-400 text-sm">@{contact.telegram.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* Website */}
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Globe className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">Sitio Web</h3>
                    <p className="text-slate-400 text-sm">{contact.website}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              )}

              {/* Office Address */}
              {contact.officeAddress && (
                <div className="contact-item flex items-center p-4 rounded-xl border border-slate-700">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Building2 className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-semibold">Oficina</h3>
                    <p className="text-slate-400 text-sm">{contact.officeAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer Information */}
            {banks.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-slate-100 font-semibold flex items-center">
                  <Building2 className="text-emerald-500 mr-2 w-5 h-5" />
                  Datos de Transferencia
                </h3>

                {banks.map((bank) => (
                  <div key={bank.id} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-slate-100 font-medium text-blue-400 flex items-center">
                        {bank.logo && (
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            className="w-8 h-8 mr-2 bg-white rounded-md p-1 shadow-sm"
                          />
                        )}
                        {bank.name.toUpperCase()}
                      </h4>
                      <Button
                        onClick={() => handleCopyBank(bank)}
                        variant="outline"
                        size="sm"
                        className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cuenta:</span>
                        <span className="text-slate-100 font-medium font-mono">
                          {bank.account}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RUT:</span>
                        <span className="text-slate-100 font-medium">
                          {bank.rut}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipo de cuenta:</span>
                        <span className="text-slate-100 font-medium">{bank.accountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Titular:</span>
                        <span className="text-slate-100 font-medium">
                          {bank.holder}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Correo:</span>
                        <span className="text-slate-100 font-medium">
                          {bank.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-xs">
                CAS - Todos los Derechos Reservados - 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}