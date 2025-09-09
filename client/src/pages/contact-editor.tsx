import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload,
  Building2,
  User,
  X,
  ImageIcon
} from "lucide-react";
import { z } from "zod";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import ImageEditor from "@/components/ImageEditor";

interface Contact {
  id?: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  telegram: string;
  youtube: string;
  facebook: string;
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
  textColor: string;
  statsPassword: string;
  defaultLanguage: string;

  banks: string;
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

interface ContactEditorProps {
  contact?: Contact;
  onBack: () => void;
  password: string;
}

export default function ContactEditor({ contact, onBack, password }: ContactEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!contact?.id;
  
  // Check if user is superadmin
  const isSuperAdmin = password === "Mafatanga2025";
  
  // State for image upload
  const [uploading, setUploading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showCoverGalleryModal, setShowCoverGalleryModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>('');
  const [editingImageType, setEditingImageType] = useState<'profile' | 'cover'>('profile');

  const [formData, setFormData] = useState<Contact>({
    name: contact?.name || "",
    title: contact?.title || "",
    phone: contact?.phone || "[]",
    email: contact?.email || "[]",
    whatsapp: contact?.whatsapp || "[]",
    instagram: contact?.instagram || "[]",
    tiktok: contact?.tiktok || "[]",
    linkedin: contact?.linkedin || "[]",
    telegram: contact?.telegram || "[]",
    youtube: contact?.youtube || "[]",
    facebook: contact?.facebook || "[]",
    website: contact?.website || "[]",
    profileImage: contact?.profileImage || "",
    coverImage: contact?.coverImage || "",
    officeAddress: contact?.officeAddress || "",
    bankName: contact?.bankName || "",
    bankAccount: contact?.bankAccount || "",
    accType: contact?.accType || "",
    bankHolder: contact?.bankHolder || "",
    inDev: contact?.inDev || "true", // Always default to true for new contacts
    ruta: contact?.ruta || "",
    backgroundColor: contact?.backgroundColor || "#1e293b", // Default slate-800
    textColor: contact?.textColor || "#ffffff", // Default white text
    statsPassword: contact?.statsPassword || "",
    defaultLanguage: contact?.defaultLanguage || "es",

    banks: contact?.banks || "[]"
  });

  const [banks, setBanks] = useState<Bank[]>([]);
  const [phoneLinks, setPhoneLinks] = useState<SocialLink[]>([]);
  const [emailLinks, setEmailLinks] = useState<SocialLink[]>([]);
  const [whatsappLinks, setWhatsappLinks] = useState<SocialLink[]>([]);
  const [websiteLinks, setWebsiteLinks] = useState<SocialLink[]>([]);
  const [instagramLinks, setInstagramLinks] = useState<SocialLink[]>([]);
  const [tiktokLinks, setTiktokLinks] = useState<SocialLink[]>([]);
  const [linkedinLinks, setLinkedinLinks] = useState<SocialLink[]>([]);
  const [telegramLinks, setTelegramLinks] = useState<SocialLink[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<SocialLink[]>([]);
  const [facebookLinks, setFacebookLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (formData.banks) {
      try {
        setBanks(JSON.parse(formData.banks));
      } catch (error) {
        setBanks([]);
      }
    }
  }, [formData.banks]);

  useEffect(() => {
    if (formData.phone) {
      try {
        setPhoneLinks(JSON.parse(formData.phone));
      } catch (error) {
        setPhoneLinks([]);
      }
    }
  }, [formData.phone]);

  useEffect(() => {
    if (formData.email) {
      try {
        setEmailLinks(JSON.parse(formData.email));
      } catch (error) {
        setEmailLinks([]);
      }
    }
  }, [formData.email]);

  useEffect(() => {
    if (formData.whatsapp) {
      try {
        setWhatsappLinks(JSON.parse(formData.whatsapp));
      } catch (error) {
        setWhatsappLinks([]);
      }
    }
  }, [formData.whatsapp]);

  useEffect(() => {
    if (formData.website) {
      try {
        setWebsiteLinks(JSON.parse(formData.website));
      } catch (error) {
        setWebsiteLinks([]);
      }
    }
  }, [formData.website]);

  useEffect(() => {
    if (formData.youtube) {
      try {
        setYoutubeLinks(JSON.parse(formData.youtube));
      } catch (error) {
        setYoutubeLinks([]);
      }
    }
  }, [formData.youtube]);

  useEffect(() => {
    if (formData.instagram) {
      try {
        setInstagramLinks(JSON.parse(formData.instagram));
      } catch (error) {
        setInstagramLinks([]);
      }
    }
  }, [formData.instagram]);

  useEffect(() => {
    if (formData.tiktok) {
      try {
        setTiktokLinks(JSON.parse(formData.tiktok));
      } catch (error) {
        setTiktokLinks([]);
      }
    }
  }, [formData.tiktok]);

  useEffect(() => {
    if (formData.linkedin) {
      try {
        setLinkedinLinks(JSON.parse(formData.linkedin));
      } catch (error) {
        setLinkedinLinks([]);
      }
    }
  }, [formData.linkedin]);

  useEffect(() => {
    if (formData.telegram) {
      try {
        setTelegramLinks(JSON.parse(formData.telegram));
      } catch (error) {
        setTelegramLinks([]);
      }
    }
  }, [formData.telegram]);

  useEffect(() => {
    if (formData.facebook) {
      try {
        setFacebookLinks(JSON.parse(formData.facebook));
      } catch (error) {
        setFacebookLinks([]);
      }
    }
  }, [formData.facebook]);

  const updateField = (field: keyof Contact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image upload function
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "La imagen debe ser menor a 25MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      updateField('profileImage', data.imageUrl);
      
      toast({
        title: "¡Imagen subida!",
        description: "La imagen de perfil se ha guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addBank = () => {
    const newBank: Bank = {
      id: Date.now().toString(),
      name: "",
      account: "",
      accountType: "Vista",
      holder: "",
      rut: "",
      email: "",
      logo: ""
    };
    const updatedBanks = [...banks, newBank];
    setBanks(updatedBanks);
    setFormData(prev => ({ ...prev, banks: JSON.stringify(updatedBanks) }));
  };

  const removeBank = (bankId: string) => {
    const updatedBanks = banks.filter(bank => bank.id !== bankId);
    setBanks(updatedBanks);
    setFormData(prev => ({ ...prev, banks: JSON.stringify(updatedBanks) }));
  };

  const updateBank = (bankId: string, field: keyof Bank, value: string) => {
    const updatedBanks = banks.map(bank =>
      bank.id === bankId ? { ...bank, [field]: value } : bank
    );
    setBanks(updatedBanks);
    setFormData(prev => ({ ...prev, banks: JSON.stringify(updatedBanks) }));
  };

  // Phone links functions
  const addPhoneLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...phoneLinks, newLink];
    setPhoneLinks(updatedLinks);
    setFormData(prev => ({ ...prev, phone: JSON.stringify(updatedLinks) }));
  };

  const removePhoneLink = (linkId: string) => {
    const updatedLinks = phoneLinks.filter(link => link.id !== linkId);
    setPhoneLinks(updatedLinks);
    setFormData(prev => ({ ...prev, phone: JSON.stringify(updatedLinks) }));
  };

  const updatePhoneLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = phoneLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setPhoneLinks(updatedLinks);
    setFormData(prev => ({ ...prev, phone: JSON.stringify(updatedLinks) }));
  };

  // Email links functions
  const addEmailLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...emailLinks, newLink];
    setEmailLinks(updatedLinks);
    setFormData(prev => ({ ...prev, email: JSON.stringify(updatedLinks) }));
  };

  const removeEmailLink = (linkId: string) => {
    const updatedLinks = emailLinks.filter(link => link.id !== linkId);
    setEmailLinks(updatedLinks);
    setFormData(prev => ({ ...prev, email: JSON.stringify(updatedLinks) }));
  };

  const updateEmailLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = emailLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setEmailLinks(updatedLinks);
    setFormData(prev => ({ ...prev, email: JSON.stringify(updatedLinks) }));
  };

  // WhatsApp links functions
  const addWhatsappLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...whatsappLinks, newLink];
    setWhatsappLinks(updatedLinks);
    setFormData(prev => ({ ...prev, whatsapp: JSON.stringify(updatedLinks) }));
  };

  const removeWhatsappLink = (linkId: string) => {
    const updatedLinks = whatsappLinks.filter(link => link.id !== linkId);
    setWhatsappLinks(updatedLinks);
    setFormData(prev => ({ ...prev, whatsapp: JSON.stringify(updatedLinks) }));
  };

  const updateWhatsappLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = whatsappLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setWhatsappLinks(updatedLinks);
    setFormData(prev => ({ ...prev, whatsapp: JSON.stringify(updatedLinks) }));
  };

  // Website links functions
  const addWebsiteLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...websiteLinks, newLink];
    setWebsiteLinks(updatedLinks);
    setFormData(prev => ({ ...prev, website: JSON.stringify(updatedLinks) }));
  };

  const removeWebsiteLink = (linkId: string) => {
    const updatedLinks = websiteLinks.filter(link => link.id !== linkId);
    setWebsiteLinks(updatedLinks);
    setFormData(prev => ({ ...prev, website: JSON.stringify(updatedLinks) }));
  };

  const updateWebsiteLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = websiteLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setWebsiteLinks(updatedLinks);
    setFormData(prev => ({ ...prev, website: JSON.stringify(updatedLinks) }));
  };

  // Instagram links functions
  const addInstagramLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...instagramLinks, newLink];
    setInstagramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, instagram: JSON.stringify(updatedLinks) }));
  };

  const removeInstagramLink = (linkId: string) => {
    const updatedLinks = instagramLinks.filter(link => link.id !== linkId);
    setInstagramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, instagram: JSON.stringify(updatedLinks) }));
  };

  const updateInstagramLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = instagramLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setInstagramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, instagram: JSON.stringify(updatedLinks) }));
  };

  // TikTok links functions
  const addTiktokLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...tiktokLinks, newLink];
    setTiktokLinks(updatedLinks);
    setFormData(prev => ({ ...prev, tiktok: JSON.stringify(updatedLinks) }));
  };

  const removeTiktokLink = (linkId: string) => {
    const updatedLinks = tiktokLinks.filter(link => link.id !== linkId);
    setTiktokLinks(updatedLinks);
    setFormData(prev => ({ ...prev, tiktok: JSON.stringify(updatedLinks) }));
  };

  const updateTiktokLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = tiktokLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setTiktokLinks(updatedLinks);
    setFormData(prev => ({ ...prev, tiktok: JSON.stringify(updatedLinks) }));
  };

  // LinkedIn links functions
  const addLinkedinLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...linkedinLinks, newLink];
    setLinkedinLinks(updatedLinks);
    setFormData(prev => ({ ...prev, linkedin: JSON.stringify(updatedLinks) }));
  };

  const removeLinkedinLink = (linkId: string) => {
    const updatedLinks = linkedinLinks.filter(link => link.id !== linkId);
    setLinkedinLinks(updatedLinks);
    setFormData(prev => ({ ...prev, linkedin: JSON.stringify(updatedLinks) }));
  };

  const updateLinkedinLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = linkedinLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setLinkedinLinks(updatedLinks);
    setFormData(prev => ({ ...prev, linkedin: JSON.stringify(updatedLinks) }));
  };

  // Telegram links functions
  const addTelegramLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...telegramLinks, newLink];
    setTelegramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, telegram: JSON.stringify(updatedLinks) }));
  };

  const removeTelegramLink = (linkId: string) => {
    const updatedLinks = telegramLinks.filter(link => link.id !== linkId);
    setTelegramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, telegram: JSON.stringify(updatedLinks) }));
  };

  const updateTelegramLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = telegramLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setTelegramLinks(updatedLinks);
    setFormData(prev => ({ ...prev, telegram: JSON.stringify(updatedLinks) }));
  };

  // YouTube links functions
  const addYoutubeLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...youtubeLinks, newLink];
    setYoutubeLinks(updatedLinks);
    setFormData(prev => ({ ...prev, youtube: JSON.stringify(updatedLinks) }));
  };

  const removeYoutubeLink = (linkId: string) => {
    const updatedLinks = youtubeLinks.filter(link => link.id !== linkId);
    setYoutubeLinks(updatedLinks);
    setFormData(prev => ({ ...prev, youtube: JSON.stringify(updatedLinks) }));
  };

  const updateYoutubeLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = youtubeLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setYoutubeLinks(updatedLinks);
    setFormData(prev => ({ ...prev, youtube: JSON.stringify(updatedLinks) }));
  };

  // Facebook links functions
  const addFacebookLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      url: "",
      label: ""
    };
    const updatedLinks = [...facebookLinks, newLink];
    setFacebookLinks(updatedLinks);
    setFormData(prev => ({ ...prev, facebook: JSON.stringify(updatedLinks) }));
  };

  const removeFacebookLink = (linkId: string) => {
    const updatedLinks = facebookLinks.filter(link => link.id !== linkId);
    setFacebookLinks(updatedLinks);
    setFormData(prev => ({ ...prev, facebook: JSON.stringify(updatedLinks) }));
  };

  const updateFacebookLink = (linkId: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = facebookLinks.map(link =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    setFacebookLinks(updatedLinks);
    setFormData(prev => ({ ...prev, facebook: JSON.stringify(updatedLinks) }));
  };

  // Image Editor handlers
  const handleEditProfileImage = () => {
    if (formData.profileImage) {
      setImageToEdit(formData.profileImage);
      setEditingImageType('profile');
      setShowImageEditor(true);
    }
  };

  const handleEditCoverImage = () => {
    if (formData.coverImage) {
      setImageToEdit(formData.coverImage);
      setEditingImageType('cover');
      setShowImageEditor(true);
    }
  };

  const handleImageEditorSave = (editedImageUrl: string) => {
    if (editingImageType === 'profile') {
      updateField('profileImage', editedImageUrl);
    } else {
      updateField('coverImage', editedImageUrl);
    }
    setShowImageEditor(false);
    toast({
      title: "Imagen editada",
      description: "La imagen se ha guardado con los cambios aplicados"
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Contact) => {
      const endpoint = isEditing 
        ? `/api/admin/contacts/${contact!.id}`
        : "/api/admin/contacts/create";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...data })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: isEditing ? "Contacto actualizado" : "Contacto creado",
        description: isEditing 
          ? "Los cambios han sido guardados exitosamente"
          : "El nuevo contacto ha sido creado",
      });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el contacto",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.ruta) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, email y ruta",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEditing ? `Editar: ${contact?.name}` : "Nuevo Contacto"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Imagen de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => setShowGalleryModal(true)}
                  >
                    {formData.profileImage ? (
                      <>
                        <img
                          src={formData.profileImage}
                          alt="Imagen de perfil"
                          className="w-24 h-24 rounded-full object-cover border-2 border-slate-600 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 group-hover:bg-slate-600 transition-colors overflow-hidden">
                        <img
                          src="/default-avatar.svg"
                          alt="Avatar por defecto"
                          className="w-16 h-16 opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                      </div>
                    )}
                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateField('profileImage', '');
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-slate-200 block mb-2">
                    Imagen de Perfil
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowGalleryModal(true)}
                      className="bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.profileImage ? "Cambiar Imagen" : "Seleccionar de Galería"}
                    </Button>
                    {formData.profileImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditProfileImage}
                        className="bg-blue-800/50 border-blue-600 text-blue-100 hover:bg-blue-700/50"
                      >
                        ✂️ Editar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Haz clic para abrir la galería de imágenes. Usa imágenes de alta resolución para máxima calidad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-200">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-slate-200">Título/Empresa</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image Upload */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                        <p className="text-slate-500 text-sm">Sin imagen de portada</p>
                      </div>
                    )}
                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateField('coverImage', '');
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200 block mb-2">
                    Imagen de Portada (Estilo Facebook)
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCoverGalleryModal(true)}
                      className="bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.coverImage ? "Cambiar Portada" : "Seleccionar de Galería"}
                    </Button>
                    {formData.coverImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditCoverImage}
                        className="bg-blue-800/50 border-blue-600 text-blue-100 hover:bg-blue-700/50"
                      >
                        ✂️ Editar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Para máxima calidad, usa imágenes de alta resolución (hasta 25MB). Formatos recomendados: PNG o JPEG de alta calidad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Language */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Idioma por Defecto</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-slate-200 block mb-2">
                Selecciona el idioma por defecto para este contacto
              </Label>
              <select
                value={formData.defaultLanguage || 'es'}
                onChange={(e) => updateField('defaultLanguage', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">
                Los visitantes verán este idioma por defecto, pero podrán cambiarlo con el botón "Traducir"
              </p>
            </CardContent>
          </Card>

          {/* Phone Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Teléfonos</CardTitle>
              <Button type="button" onClick={addPhoneLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Teléfono
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {phoneLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Teléfono {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePhoneLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Número de teléfono</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updatePhoneLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="+56912345678"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del teléfono (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updatePhoneLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Teléfono personal"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {phoneLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay teléfonos agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Teléfono" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Emails</CardTitle>
              <Button type="button" onClick={addEmailLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Email
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Email {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEmailLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Dirección de email</Label>
                      <Input
                        type="email"
                        value={link.url}
                        onChange={(e) => updateEmailLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del email (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateEmailLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Email de trabajo"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {emailLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay emails agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Email" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">WhatsApp</CardTitle>
              <Button type="button" onClick={addWhatsappLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar WhatsApp
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {whatsappLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">WhatsApp {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWhatsappLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Número de WhatsApp</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateWhatsappLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="+56912345678"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del WhatsApp (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateWhatsappLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="WhatsApp personal"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {whatsappLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay números de WhatsApp agregados</p>
                  <p className="text-sm">Usa el botón "Agregar WhatsApp" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Website Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Sitios Web</CardTitle>
              <Button type="button" onClick={addWebsiteLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Sitio Web
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {websiteLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Sitio Web {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWebsiteLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">URL del sitio web</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateWebsiteLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del sitio web (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateWebsiteLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi sitio web"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {websiteLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay sitios web agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Sitio Web" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instagram Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Instagram</CardTitle>
              <Button type="button" onClick={addInstagramLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cuenta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {instagramLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Cuenta {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeInstagramLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Usuario de Instagram</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateInstagramLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="usuario_instagram"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre de la cuenta (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateInstagramLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi cuenta de Instagram"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {instagramLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay cuentas de Instagram agregadas</p>
                  <p className="text-sm">Usa el botón "Agregar Cuenta" para añadir una</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TikTok Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">TikTok</CardTitle>
              <Button type="button" onClick={addTiktokLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cuenta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiktokLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Cuenta {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTiktokLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Usuario de TikTok</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateTiktokLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="@usuario_tiktok"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre de la cuenta (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateTiktokLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi cuenta de TikTok"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {tiktokLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay cuentas de TikTok agregadas</p>
                  <p className="text-sm">Usa el botón "Agregar Cuenta" para añadir una</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LinkedIn Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">LinkedIn</CardTitle>
              <Button type="button" onClick={addLinkedinLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Perfil
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedinLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Perfil {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeLinkedinLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Usuario de LinkedIn</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateLinkedinLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="usuario-linkedin"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del perfil (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateLinkedinLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi perfil profesional"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {linkedinLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay perfiles de LinkedIn agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Perfil" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Telegram</CardTitle>
              <Button type="button" onClick={addTelegramLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cuenta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {telegramLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Cuenta {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTelegramLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Usuario de Telegram</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateTelegramLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="@usuario_telegram"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre de la cuenta (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateTelegramLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi cuenta de Telegram"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {telegramLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay cuentas de Telegram agregadas</p>
                  <p className="text-sm">Usa el botón "Agregar Cuenta" para añadir una</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* YouTube Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">YouTube</CardTitle>
              <Button type="button" onClick={addYoutubeLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Canal
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {youtubeLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Canal {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeYoutubeLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">URL del Canal</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateYoutubeLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="https://youtube.com/@usuario"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre del Canal (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateYoutubeLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi Canal de YouTube"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {youtubeLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay canales de YouTube agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Canal" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facebook Links */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Facebook</CardTitle>
              <Button type="button" onClick={addFacebookLink} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Página
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {facebookLinks.map((link, index) => (
                <div key={link.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Página {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFacebookLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">URL de la Página</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => updateFacebookLink(link.id, "url", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="https://facebook.com/mipagina"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Nombre de la Página (opcional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => updateFacebookLink(link.id, "label", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Mi Página de Facebook"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {facebookLinks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay páginas de Facebook agregadas</p>
                  <p className="text-sm">Usa el botón "Agregar Página" para añadir una</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="officeAddress" className="text-slate-200">Dirección de Oficina</Label>
                  <Input
                    id="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => updateField("officeAddress", e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                    placeholder="Ej: Av. Las Condes 123, Las Condes, Santiago"
                  />
                </div>
                <div>
                  <Label htmlFor="ruta" className="text-slate-200">Ruta *</Label>
                  <Input
                    id="ruta"
                    value={formData.ruta}
                    onChange={(e) => {
                      // Filter input to allow only lowercase letters and hyphens (no spaces)
                      const filteredValue = e.target.value.toLowerCase().replace(/[^a-z-]/g, '');
                      updateField("ruta", filteredValue);
                    }}
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                    placeholder="cristian"
                    required
                    pattern="[a-z-]+"
                    title="Solo letras minúsculas y guiones permitidos"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    La URL será: /{formData.ruta}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo letras minúsculas y guiones (-). No espacios
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Background Color Picker */}
              <div className="space-y-2">
                <Label className="text-slate-200">Color de Fondo</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => updateField("backgroundColor", e.target.value)}
                    className="w-12 h-10 rounded border border-slate-600 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => updateField("backgroundColor", e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                    placeholder="#1e293b"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Color de fondo para la tarjeta de contacto
                </p>
              </div>

              {/* Text Color Picker */}
              <div className="space-y-2">
                <Label className="text-slate-200">Color de Texto</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => updateField("textColor", e.target.value)}
                    className="w-12 h-10 rounded border border-slate-600 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => updateField("textColor", e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-slate-100"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Color del texto para el nombre y título del perfil
                </p>
              </div>
              
              {/* Color Preview */}
              <div className="mt-6 p-4 border border-slate-600 rounded-lg">
                <Label className="text-slate-200 mb-3 block">Vista Previa de Colores</Label>
                <div 
                  className="p-6 rounded-lg border-2"
                  style={{ 
                    backgroundColor: formData.backgroundColor || "#1e293b",
                    color: formData.textColor || "#ffffff",
                    borderColor: "#475569"
                  }}
                >
                  <div className="text-center">
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ color: formData.textColor || "#ffffff" }}
                    >
                      {formData.name || "Nombre de Ejemplo"}
                    </h3>
                    <p 
                      className="text-lg mb-4"
                      style={{ color: formData.textColor || "#ffffff" }}
                    >
                      {formData.title || "Título del Perfil"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm">
                        WhatsApp
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-sm">
                        Instagram
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500 text-white text-sm">
                        Sitio Web
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Password */}
              <div className="space-y-2">
                <Label htmlFor="statsPassword" className="text-slate-200">Contraseña de Estadísticas</Label>
                <Input
                  id="statsPassword"
                  type="password"
                  value={formData.statsPassword}
                  onChange={(e) => updateField("statsPassword", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="Contraseña para que el contacto vea sus stats"
                />
                <p className="text-xs text-slate-400">
                  El contacto podrá ver sus estadísticas usando esta contraseña
                </p>
              </div>

              {/* Development mode - only for superadmin */}
              {isSuperAdmin && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-200">En Desarrollo</Label>
                    <p className="text-xs text-slate-400">
                      Muestra banner de desarrollo (Solo SuperAdmin)
                    </p>
                  </div>
                  <Switch
                    checked={formData.inDev === "true"}
                    onCheckedChange={(checked) => 
                      updateField("inDev", checked ? "true" : "false")
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banks */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Bancos</CardTitle>
              <Button type="button" onClick={addBank} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Banco
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {banks.map((bank, index) => (
                <div key={bank.id} className="p-4 border border-slate-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-200 font-medium">Banco {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBank(bank.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-200">Nombre del Banco</Label>
                      <Input
                        value={bank.name}
                        onChange={(e) => updateBank(bank.id, "name", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="BCI, Mercado Pago, etc."
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Número de Cuenta</Label>
                      <Input
                        value={bank.account}
                        onChange={(e) => updateBank(bank.id, "account", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Tipo de Cuenta</Label>
                      <Input
                        value={bank.accountType}
                        onChange={(e) => updateBank(bank.id, "accountType", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="Vista, Corriente, Digital"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">RUT</Label>
                      <Input
                        value={bank.rut}
                        onChange={(e) => updateBank(bank.id, "rut", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="12.345.678-9"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Titular</Label>
                      <Input
                        value={bank.holder}
                        onChange={(e) => updateBank(bank.id, "holder", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Email</Label>
                      <Input
                        value={bank.email}
                        onChange={(e) => updateBank(bank.id, "email", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-slate-200">Logo del Banco</Label>
                      <div className="flex items-center gap-3">
                        <Select
                          value={bank.logo || ""}
                          onValueChange={(value) => updateBank(bank.id, "logo", value)}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100 flex-1">
                            <SelectValue placeholder="Selecciona un logo" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="" className="text-slate-100">
                              Sin logo
                            </SelectItem>
                            <SelectItem value="/mp.svg" className="text-slate-100">
                              MercadoPago
                            </SelectItem>
                            <SelectItem value="/bci.svg" className="text-slate-100">
                              BCI
                            </SelectItem>
                            <SelectItem value="/std.svg" className="text-slate-100">
                              Santander
                            </SelectItem>
                            <SelectItem value="/tenpo.svg" className="text-slate-100">
                              Tenpo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {bank.logo && (
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <img
                              src={bank.logo}
                              alt="Logo del banco"
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {banks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay bancos agregados</p>
                  <p className="text-sm">Usa el botón "Agregar Banco" para añadir uno</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Guardando..." : "Guardar Contacto"}
            </Button>
          </div>
        </form>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={showGalleryModal}
        currentImage={formData.profileImage}
        onSelectImage={(imageUrl) => updateField('profileImage', imageUrl)}
        onClose={() => setShowGalleryModal(false)}
        password={password}
      />

      {/* Cover Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={showCoverGalleryModal}
        currentImage={formData.coverImage}
        onSelectImage={(imageUrl) => updateField('coverImage', imageUrl)}
        onClose={() => setShowCoverGalleryModal(false)}
        password={password}
      />

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        imageUrl={imageToEdit}
        onSave={handleImageEditorSave}
        aspectRatio={editingImageType === 'cover' ? 'cover' : 'square'}
      />
    </div>
  );
}