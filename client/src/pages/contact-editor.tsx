import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  X
} from "lucide-react";
import { z } from "zod";
import ImageGalleryModal from "@/components/ImageGalleryModal";

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

  const [formData, setFormData] = useState<Contact>({
    name: contact?.name || "",
    title: contact?.title || "",
    phone: contact?.phone || "",
    email: contact?.email || "",
    whatsapp: contact?.whatsapp || "",
    instagram: contact?.instagram || "",
    tiktok: contact?.tiktok || "",
    linkedin: contact?.linkedin || "",
    telegram: contact?.telegram || "",
    website: contact?.website || "",
    profileImage: contact?.profileImage || "",
    officeAddress: contact?.officeAddress || "",
    bankName: contact?.bankName || "",
    bankAccount: contact?.bankAccount || "",
    accType: contact?.accType || "",
    bankHolder: contact?.bankHolder || "",
    inDev: contact?.inDev || "true", // Always default to true for new contacts
    ruta: contact?.ruta || "",
    backgroundColor: contact?.backgroundColor || "#1e293b", // Default slate-800

    banks: contact?.banks || "[]"
  });

  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    if (formData.banks) {
      try {
        setBanks(JSON.parse(formData.banks));
      } catch (error) {
        setBanks([]);
      }
    }
  }, [formData.banks]);

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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "La imagen debe ser menor a 5MB",
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
                      <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 group-hover:bg-slate-600 transition-colors">
                        <Upload className="w-8 h-8 text-slate-400" />
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGalleryModal(true)}
                    className="bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.profileImage ? "Cambiar Imagen" : "Seleccionar de Galería"}
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">
                    Haz clic para abrir la galería de imágenes
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
              <div>
                <Label htmlFor="email" className="text-slate-200">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-200">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp" className="text-slate-200">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="text-slate-200">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="usuario_instagram"
                />
              </div>
              <div>
                <Label htmlFor="tiktok" className="text-slate-200">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.tiktok}
                  onChange={(e) => updateField("tiktok", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="@usuario_tiktok"
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="text-slate-200">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="usuario-linkedin"
                />
              </div>
              <div>
                <Label htmlFor="telegram" className="text-slate-200">Telegram</Label>
                <Input
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => updateField("telegram", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="@usuario_telegram"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-slate-200">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="https://ejemplo.com"
                />
              </div>
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
                  onChange={(e) => updateField("ruta", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100"
                  placeholder="cristian"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  La URL será: /{formData.ruta}
                </p>
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
                      <Label className="text-slate-200">Logo (URL)</Label>
                      <Input
                        value={bank.logo || ""}
                        onChange={(e) => updateBank(bank.id, "logo", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-slate-100"
                        placeholder="/mp.svg, /bci.svg, etc."
                      />
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
      />
    </div>
  );
}