import { useState, useEffect, useRef } from "react";
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
import { FaTiktok, FaLinkedin, FaTelegram, FaYoutube, FaFacebook } from "react-icons/fa";
import ImageModal from "@/components/ImageModal";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { Language, getLanguageName } from "@/utils/translations";

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
  youtube: string; // JSON string of SocialLink[]
  facebook: string; // JSON string of SocialLink[]
  website: string;
  profileImage: string;
  coverImage: string;
  officeAddress: string;
  bankName: string;
  bankAccount: string;
  accType: string;
  bankHolder: string;
  inDev: string;
  ruta: string;
  backgroundColor: string;
  defaultLanguage: string;

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

interface SocialLink {
  id: string;
  url: string;
  label?: string;
}

// Internal component that uses translations
function ContactPageContent() {
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQRView, setShowQRView] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCASModal, setShowCASModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get route parameter from URL
  const path = window.location.pathname;
  const routeParam = path === "/" || path === "" ? null : path.substring(1);

  // Mouse movement and gyroscope effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        
        setTilt({
          x: 0, // No vertical tilt
          y: deltaX * -20 // Only horizontal tilt
        });
      }
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    // Global mouse movement for container area
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        const isHovering = e.clientX >= rect.left && e.clientX <= rect.right && 
                          e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isHovering) {
          handleMouseMove(e);
        }
      }
    };

    // Gyroscope effect for mobile
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setTilt({
          x: 0, // No vertical tilt
          y: Math.max(-25, Math.min(25, e.gamma * 0.8)) // Only horizontal tilt
        });
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    const profileElement = profileRef.current;
    if (profileElement) {
      profileElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
      
      if (profileElement) {
        profileElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);
  
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

  // Track page view when contact loads and reset image error states
  useEffect(() => {
    if (contact) {
      // Reset image error states when contact changes
      setProfileImageError(false);
      setCoverImageError(false);
      setImageLoaded(false);
      
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact.id,
          event: 'view',
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch(error => console.error('Analytics tracking failed:', error));
    }
  }, [contact]);

  const trackEvent = (event: string) => {
    if (contact) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact.id,
          event,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch(error => console.error('Analytics tracking failed:', error));
    }
  };

  const handleSaveContact = async () => {
    try {
      if (!contact) {
        throw new Error("No contact data available");
      }

      const endpoint = routeParam 
        ? `/api/contact/${routeParam}/vcard` 
        : "/api/contact/vcard";
      
      trackEvent('vcard_download');
      
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
    trackEvent('share_click');
    setShowShareModal(true);
    setShowQRView(false);
  };

  const handleShowQR = async () => {
    if (!contact) return;
    
    trackEvent('qr_view');
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
      const correctUrl = contact ? `https://cashirts.cl/${contact.ruta}` : window.location.href;
      await navigator.clipboard.writeText(correctUrl);
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
        const correctUrl = contact ? `https://cashirts.cl/${contact.ruta}` : window.location.href;
        await navigator.share({
          title: `Contacto de ${contact?.name}`,
          text: "Aquí tienes mi información de contacto",
          url: correctUrl,
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

  // Helper function to parse JSON fields safely
  const parseJSONField = (field: string | undefined | null): SocialLink[] => {
    if (!field) return [];
    
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If it's not valid JSON, treat as legacy string format
      if (field && field.trim()) {
        return [{ id: '1', url: field, label: '' }];
      }
      return [];
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

  const getYoutubeUrl = (url: string) => {
    // If it's already a full URL, return as is, otherwise construct it
    if (url.startsWith('http')) return url;
    return `https://youtube.com/${url.startsWith('@') ? url : '@' + url}`;
  };

  const getFacebookUrl = (url: string) => {
    // If it's already a full URL, return as is, otherwise construct it
    if (url.startsWith('http')) return url;
    return `https://facebook.com/${url}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 w-full max-w-md">
            <div className="animate-pulse space-y-4">
              <div className="w-48 h-48 bg-slate-700 rounded-full mx-auto"></div>
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

  // Parse banks and social links from JSON using helper function
  const banks: Bank[] = contact?.banks ? JSON.parse(contact.banks) : [];
  
  const phoneLinks: SocialLink[] = parseJSONField(contact?.phone);
  const emailLinks: SocialLink[] = parseJSONField(contact?.email);
  const whatsappLinks: SocialLink[] = parseJSONField(contact?.whatsapp);
  const websiteLinks: SocialLink[] = parseJSONField(contact?.website);
  const instagramLinks: SocialLink[] = parseJSONField(contact?.instagram);
  const tiktokLinks: SocialLink[] = parseJSONField(contact?.tiktok);
  const linkedinLinks: SocialLink[] = parseJSONField(contact?.linkedin);
  const telegramLinks: SocialLink[] = parseJSONField(contact?.telegram);
  const youtubeLinks: SocialLink[] = parseJSONField(contact?.youtube);
  const facebookLinks: SocialLink[] = parseJSONField(contact?.facebook);



  return (
    <div className="min-h-screen flex flex-col">
      {/* Translate Button */}
      <div className="fixed top-4 right-4 z-50">
        <Dialog open={showTranslateModal} onOpenChange={setShowTranslateModal}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-100 hover:bg-slate-700/80"
            >
              <Globe className="w-4 h-4 mr-2" />
              {t('translate')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">
                {t('translate')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                onClick={() => {
                  setLanguage('es');
                  setShowTranslateModal(false);
                }}
                className="w-full justify-start"
              >
                🇪🇸 {getLanguageName('es', language)}
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => {
                  setLanguage('en');
                  setShowTranslateModal(false);
                }}
                className="w-full justify-start"
              >
                🇺🇸 {getLanguageName('en', language)}
              </Button>
              <Button
                variant={language === 'pt' ? 'default' : 'outline'}
                onClick={() => {
                  setLanguage('pt');
                  setShowTranslateModal(false);
                }}
                className="w-full justify-start"
              >
                🇧🇷 {getLanguageName('pt', language)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="flex-1 p-4" style={{ backgroundColor: contact.backgroundColor || '#1e293b' }}>
        <div className="w-full max-w-md mx-auto">
          {/* Cover Image */}
          {contact.coverImage && !coverImageError && (
            <div className="w-full h-80 rounded-t-3xl overflow-hidden shadow-lg mb-0">
              <img
                src={contact.coverImage}
                alt={`Portada de ${contact.name}`}
                className="w-full h-full object-cover"
                onError={() => setCoverImageError(true)}
              />
            </div>
          )}
          
          <div 
            className={`glass-effect ${contact.coverImage && !coverImageError ? 'rounded-b-3xl' : 'rounded-3xl'} p-8 shadow-2xl`} 
            style={{ backgroundColor: `${contact.backgroundColor || '#1e293b'}e6` }}
          >
            {/* Header with Profile */}
            <div className="text-center mb-8 relative">
              <div 
                ref={profileRef}
                className={`w-48 h-48 rounded-full mx-auto ${contact.coverImage && !coverImageError ? '-mt-44' : 'mb-4'} shadow-lg overflow-hidden relative transition-transform duration-300 ease-out cursor-pointer border-4 border-white`}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
                onClick={() => contact.profileImage && !profileImageError && setShowImageModal(true)}
              >
                {contact.profileImage && !profileImageError ? (
                  <>
                    {!imageLoaded && (
                      <div className="w-full h-full bg-slate-700/50 animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 bg-slate-600/50 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <img
                      src={contact.profileImage}
                      alt={contact.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setImageLoaded(true);
                        setProfileImageError(true);
                      }}
                    />
                  </>
                ) : (
                  <img
                    src="/default-avatar.svg"
                    alt="Avatar por defecto"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* DEMO Ribbon - Solo se muestra si inDev es "true" */}
              {contact?.inDev === "true" && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 shadow-lg border border-red-600 z-20 whitespace-nowrap rounded">
                  DEMO
                </div>
              )}
              <h1 className={`text-2xl font-bold mb-2 ${contact.coverImage && !coverImageError ? 'mt-4' : ''}`} style={{ color: contact.textColor || '#ffffff' }}>
                {contact.name}
              </h1>
              <p className="font-medium opacity-90" style={{ color: contact.textColor || '#ffffff' }}>{contact.title}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={handleSaveContact}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('saveContact')}
              </Button>
              
              <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleShareContact}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] shadow-lg hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('shareContact')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-slate-100 text-center flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5 text-violet-400" />
                      {t('shareOptions')}
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
                          {t('qrCode')}
                        </Button>
                        
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="w-full bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 py-3 rounded-xl"
                        >
                          <Copy className="w-5 h-5 mr-3" />
                          {t('copyLink')}
                        </Button>
                        
                        <Button
                          onClick={handleNativeShare}
                          variant="outline"
                          className="w-full bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 py-3 rounded-xl"
                        >
                          <Share2 className="w-5 h-5 mr-3" />
                          {t('shareNative')}
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
                        ← {t('back')}
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
                            {t('qrError')}
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-slate-100">{contact?.name}</h3>
                        <p className="text-sm text-slate-400">{contact?.title}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {t('scanQR')}
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
                          {t('downloadQR')}
                        </Button>
                        
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="flex-1 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {t('copyLink')}
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
              {whatsappLinks.map((whatsappLink, index) => (
                <a
                  key={`whatsapp-${whatsappLink.id}`}
                  href={getWhatsAppUrl(whatsappLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-green-500/10 hover:border-green-500/30"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Phone className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {whatsappLink.label || `${t('whatsapp')}${whatsappLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{whatsappLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Phone */}
              {phoneLinks.map((phoneLink, index) => (
                <a
                  key={`phone-${phoneLink.id}`}
                  href={getTelUrl(phoneLink.url)}
                  onClick={() => trackEvent('phone_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Phone className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {phoneLink.label || `${t('phone')}${phoneLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{phoneLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Email */}
              {emailLinks.map((emailLink, index) => (
                <a
                  key={`email-${emailLink.id}`}
                  href={getEmailUrl(emailLink.url)}
                  onClick={() => trackEvent('email_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Mail className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {emailLink.label || `${t('email')}${emailLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{emailLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Instagram */}
              {instagramLinks.map((instagramLink, index) => (
                <a
                  key={`instagram-${instagramLink.id}`}
                  href={getInstagramUrl(instagramLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('instagram_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-pink-500/10 hover:border-pink-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Instagram className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {instagramLink.label || `${t('instagram')}${instagramLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>@{instagramLink.url.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* TikTok */}
              {tiktokLinks.map((tiktokLink, index) => (
                <a
                  key={`tiktok-${tiktokLink.id}`}
                  href={getTikTokUrl(tiktokLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('tiktok_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-pink-500/10 hover:border-pink-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaTiktok className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {tiktokLink.label || `${t('tiktok')}${tiktokLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>@{tiktokLink.url.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* LinkedIn */}
              {linkedinLinks.map((linkedinLink, index) => (
                <a
                  key={`linkedin-${linkedinLink.id}`}
                  href={getLinkedInUrl(linkedinLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('linkedin_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaLinkedin className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {linkedinLink.label || `${t('linkedin')}${linkedinLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{linkedinLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Telegram */}
              {telegramLinks.map((telegramLink, index) => (
                <a
                  key={`telegram-${telegramLink.id}`}
                  href={getTelegramUrl(telegramLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('telegram_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaTelegram className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {telegramLink.label || `${t('telegram')}${telegramLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>@{telegramLink.url.replace(/^@+/, "")}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* YouTube */}
              {youtubeLinks.map((youtubeLink, index) => (
                <a
                  key={`youtube-${youtubeLink.id}`}
                  href={getYoutubeUrl(youtubeLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('youtube_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaYoutube className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {youtubeLink.label || `${t('youtube')}${youtubeLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{youtubeLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Facebook */}
              {facebookLinks.map((facebookLink, index) => (
                <a
                  key={`facebook-${facebookLink.id}`}
                  href={getFacebookUrl(facebookLink.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('facebook_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-blue-600/10 hover:border-blue-600/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <FaFacebook className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {facebookLink.label || `${t('facebook')}${facebookLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{facebookLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Website */}
              {websiteLinks.map((websiteLink, index) => (
                <a
                  key={`website-${websiteLink.id}`}
                  href={websiteLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('website_click')}
                  className="contact-item flex items-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] block transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Globe className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>
                      {websiteLink.label || `${t('website')}${websiteLinks.length > 1 ? ` ${index + 1}` : ''}`}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{websiteLink.url}</p>
                  </div>
                  <ExternalLink className="text-slate-500 w-4 h-4" />
                </a>
              ))}

              {/* Office Address */}
              {contact.officeAddress && (
                <div className="contact-item flex items-center p-4 rounded-xl border border-slate-700">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                    <Building2 className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: contact.textColor || '#ffffff' }}>{t('officeAddress')}</h3>
                    <p className="text-sm opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{contact.officeAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer Information */}
            {banks.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold flex items-center" style={{ color: contact.textColor || '#ffffff' }}>
                  <Building2 className="text-emerald-500 mr-2 w-5 h-5" />
                  {t('bankingInfo')}
                </h3>

                {banks.map((bank) => (
                  <div key={bank.id} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center" style={{ color: contact.textColor || '#ffffff' }}>
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
                        {t('copy')}
                      </Button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{t('bankAccount')}:</span>
                        <span className="font-medium font-mono" style={{ color: contact.textColor || '#ffffff' }}>
                          {bank.account}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{t('rut')}:</span>
                        <span className="font-medium" style={{ color: contact.textColor || '#ffffff' }}>
                          {bank.rut}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{t('accountType')}:</span>
                        <span className="font-medium" style={{ color: contact.textColor || '#ffffff' }}>{bank.accountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{t('holder')}:</span>
                        <span className="font-medium" style={{ color: contact.textColor || '#ffffff' }}>
                          {bank.holder}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70" style={{ color: contact.textColor || '#ffffff' }}>{t('email')}:</span>
                        <span className="font-medium" style={{ color: contact.textColor || '#ffffff' }}>
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
                <button 
                  onClick={() => setShowCASModal(true)}
                  className="hover:text-slate-300 underline transition-colors cursor-pointer"
                >
                  CAS - Contactáctanos si quieres tu propia tarjeta
                </button> - Todos los Derechos Reservados - 2025.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal && !profileImageError}
        imageUrl={contact.profileImage || ''}
        altText={contact.name}
        onClose={() => setShowImageModal(false)}
      />

      {/* CAS Contact Modal */}
      <Dialog open={showCASModal} onOpenChange={setShowCASModal}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100 text-center flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Contacto CAS - Sistema
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* WhatsApp */}
            <a
              href="https://wa.me/56982306759"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Phone className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">WhatsApp</h3>
                <p className="text-slate-400 text-sm">+56982306759</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-green-400 transition-colors" />
            </a>

            {/* Phone */}
            <a
              href="tel:+56982306759"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Phone className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Teléfono</h3>
                <p className="text-slate-400 text-sm">+569 8230 6759</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-blue-400 transition-colors" />
            </a>

            {/* Email */}
            <a
              href="mailto:crt.cas@gmail.com"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <Mail className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Email</h3>
                <p className="text-slate-400 text-sm">crt.cas@gmail.com</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-red-400 transition-colors" />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/cashirts_camisas_a_medida"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Instagram className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Instagram</h3>
                <p className="text-slate-400 text-sm">@cashirts_camisas_a_medida</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-pink-400 transition-colors" />
            </a>
          </div>

          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">
              Sistema de Contactos Digitales CAS
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main component that provides translation context
export default function ContactPage() {
  // Try to get route parameter from URL
  const path = window.location.pathname;
  const routeParam = path === "/" || path === "" ? null : path.substring(1);

  // Fetch contact data to get default language
  const { data: contact } = useQuery<Contact>({
    queryKey: ["/api/contact", routeParam],
    queryFn: async () => {
      const response = await fetch(`/api/contact/${routeParam}`);
      if (!response.ok) {
        throw new Error("Contact not found");
      }
      return response.json();
    },
    enabled: !!routeParam,
  });

  const defaultLanguage = (contact?.defaultLanguage as Language) || 'es';

  return (
    <TranslationProvider defaultLanguage={defaultLanguage}>
      <ContactPageContent />
    </TranslationProvider>
  );
}