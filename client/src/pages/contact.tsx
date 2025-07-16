import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Download,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Building2,
  ExternalLink,
  Copy,
} from "lucide-react";

interface Contact {
  id: number;
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
}

export default function ContactPage() {
  const { toast } = useToast();

  const { data: contact, isLoading } = useQuery<Contact>({
    queryKey: ["/api/contact"],
  });

  const handleSaveContact = async () => {
    try {
      const response = await fetch("/api/contact/vcard");
      if (!response.ok) throw new Error("Failed to generate vCard");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contacto.vcf";
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

  const handleShareContact = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mi Tarjeta de Contacto",
          text: "Aquí tienes mi información de contacto",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo compartir el contacto",
        variant: "destructive",
      });
    }
  };

  const handleCopyMercadoPago = async () => {
    const bankData = `MERCADO PAGO
Número de cuenta: 1054307950
RUT: 14.142.023-2
Tipo de cuenta: Vista
Titular: Cristian Antonio Alfaro Sepúlveda`;

    try {
      await navigator.clipboard.writeText(bankData);
      toast({
        title: "¡Datos copiados!",
        description: "Los datos de Mercado Pago han sido copiados al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron copiar los datos de Mercado Pago.",
        variant: "destructive",
      });
    }
  };

  const handleCopyBCI = async () => {
    const bankData = `BCI (Banco Crédito e Inversiones)
Cuenta Vista: 777014142023
RUT: 14.142.023-2
Titular: Cristian Antonio Alfaro Sepúlveda
Correo: crt.alfaros@gmail.com`;

    try {
      await navigator.clipboard.writeText(bankData);
      toast({
        title: "¡Datos copiados!",
        description: "Los datos del BCI han sido copiados al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron copiar los datos del BCI.",
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
    const cleanUsername = username.replace("@", "");
    return `https://instagram.com/${cleanUsername}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Development Banner */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 p-3">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-amber-200 text-sm font-medium">
              ⚠️ Esta página está en desarrollo, estos datos podrían no ser
              correctos
            </p>
          </div>
        </div>

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
        {/* Development Banner */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 p-3">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-amber-200 text-sm font-medium">
              ⚠️ Esta página está en desarrollo, estos datos podrían no ser
              correctos
            </p>
          </div>
        </div>

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Development Banner */}
      <div className="bg-amber-500/20 border-b border-amber-500/30 p-3">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-200 text-sm font-medium">
            ⚠️ Esta página está en desarrollo, estos datos podrían no ser
            correctos
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            {/* Header with Profile */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <img 
                  src="/cas.jpg" 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                {contact.name}
              </h1>
              <p className="text-slate-400 font-medium">{contact.title}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button
                onClick={handleSaveContact}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Guardar Contacto
              </Button>
              <Button
                onClick={handleShareContact}
                className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              {/* WhatsApp */}
              <a
                href={getWhatsAppUrl(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <MessageCircle className="text-white w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-100 font-semibold">WhatsApp</h3>
                  <p className="text-slate-400 text-sm">{contact.phone}</p>
                </div>
                <ExternalLink className="text-slate-500 w-4 h-4" />
              </a>

              {/* Phone */}
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
                  <p className="text-slate-400 text-sm">{contact.instagram}</p>
                </div>
                <ExternalLink className="text-slate-500 w-4 h-4" />
              </a>


            </div>

            {/* Bank Transfer Information */}
            <div className="mt-8 space-y-4">
              <h3 className="text-slate-100 font-semibold flex items-center">
                <Building2 className="text-emerald-500 mr-2 w-5 h-5" />
                Datos de Transferencia
              </h3>

              {/* Mercado Pago */}
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-slate-100 font-medium text-blue-400 flex items-center">
                    <img 
                      src="/mp.svg" 
                      alt="Mercado Pago" 
                      className="w-8 h-8 mr-2 bg-white rounded-md p-1 shadow-sm"
                    />
                    MERCADO PAGO
                  </h4>
                  <Button
                    onClick={handleCopyMercadoPago}
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
                      1054307950
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RUT:</span>
                    <span className="text-slate-100 font-medium">
                      14.142.023-2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo de cuenta:</span>
                    <span className="text-slate-100 font-medium">Vista</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Titular:</span>
                    <span className="text-slate-100 font-medium">
                      Cristian Antonio Alfaro Sepúlveda
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correo:</span>
                    <span className="text-slate-100 font-medium">
                      crt.cas@gmail.com
                    </span>
                  </div>
                </div>
              </div>

              {/* BCI */}
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-slate-100 font-medium text-red-400 flex items-center">
                    <img 
                      src="/bci.svg" 
                      alt="BCI" 
                      className="w-8 h-8 mr-2 bg-white rounded-md p-1 shadow-sm"
                    />
                    BCI (Banco Crédito e Inversiones)
                  </h4>
                  <Button
                    onClick={handleCopyBCI}
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
                      777014142023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RUT:</span>
                    <span className="text-slate-100 font-medium">
                      14.142.023-2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo de cuenta:</span>
                    <span className="text-slate-100 font-medium">Vista</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Titular:</span>
                    <span className="text-slate-100 font-medium">
                      Cristian Antonio Alfaro Sepúlveda
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correo:</span>
                    <span className="text-slate-100 font-medium">
                      crt.alfaros@gmail.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-xs">
                Todos los Derechos Reservados - 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
