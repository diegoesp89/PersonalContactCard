import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle,
  QrCode,
  LogOut,
  BarChart3,
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";

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
  statsPassword: string;

  banks: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  onEditContact: (contact: Contact) => void;
  password: string;
}

export default function AdminDashboard({ onLogout, onEditContact, password }: AdminDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, date, ruta
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, dev
  const [showInDev, setShowInDev] = useState(true);
  const [showPublished, setShowPublished] = useState(true);
  
  // Check if user is superadmin
  const isSuperAdmin = password === "Mafatanga2025";

  const { data: contacts = [], isLoading, error } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }
    },
    retry: 1
  });

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => {
        const fullName = `${contact.name}`.toLowerCase();
        const route = `/${contact.ruta}`.toLowerCase();
        return fullName.includes(term) || route.includes(term);
      });
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "dev") {
        filtered = filtered.filter(contact => contact.inDev === "true");
      } else if (statusFilter === "published") {
        filtered = filtered.filter(contact => contact.inDev !== "true");
      }
    }
    
    // Alternative filter by show/hide switches
    if (!showInDev && !showPublished) {
      return []; // If both are hidden, show nothing
    } else if (!showInDev) {
      filtered = filtered.filter(contact => contact.inDev !== "true");
    } else if (!showPublished) {
      filtered = filtered.filter(contact => contact.inDev === "true");
    }
    
    // Sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
          compareValue = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        case "ruta":
          compareValue = a.ruta.toLowerCase().localeCompare(b.ruta.toLowerCase());
          break;
        case "status":
          // Sort by development status (published first, then dev)
          const aStatus = a.inDev === "true" ? 1 : 0;
          const bStatus = b.inDev === "true" ? 1 : 0;
          compareValue = aStatus - bStatus;
          break;
        default:
          compareValue = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [contacts, searchTerm, statusFilter, showInDev, showPublished, sortBy, sortOrder]);

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    }
  });

  const toggleDevMutation = useMutation({
    mutationFn: async ({ id, inDev }: { id: number; inDev: string }) => {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, inDev: inDev === "true" ? "false" : "true" })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de desarrollo del contacto ha sido cambiado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de desarrollo",
        variant: "destructive",
      });
    }
  });

  const downloadQR = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contact/${contact.id}/qr`);
      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${contact.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "QR Descargado",
        description: `Código QR de ${contact.name} descargado exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el código QR.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-100">Cargando panel de administración...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">Error al cargar el panel de administración</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Panel de Administración
                {isSuperAdmin && (
                  <span className="ml-2 text-sm bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">
                    SuperAdmin
                  </span>
                )}
              </h1>
              <p className="text-slate-400">
                {isSuperAdmin ? "Acceso completo - Gestión, aprobación y desarrollo" : "Gestión y aprobación de contactos"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('/image-management', '_blank')}
              variant="outline"
              className="border-purple-600/30 text-purple-400 hover:bg-purple-600/10"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4" />
              </svg>
              Gestión de Imágenes
            </Button>
            <Button
              onClick={() => onEditContact({} as Contact)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 space-y-4">
          {/* Filter Controls */}
          <Card className="glass-effect border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <CardTitle className="text-lg text-slate-100">Filtros y Ordenación</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-slate-200 text-sm">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="name" className="text-slate-100">Nombre</SelectItem>
                      <SelectItem value="ruta" className="text-slate-100">Ruta</SelectItem>
                      <SelectItem value="status" className="text-slate-100">Estado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sort Order */}
                <div className="space-y-2">
                  <Label className="text-slate-200 text-sm">Orden</Label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="asc" className="text-slate-100">Ascendente (A-Z)</SelectItem>
                      <SelectItem value="desc" className="text-slate-100">Descendente (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-200 text-sm">Filtrar por estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-slate-100">Todos</SelectItem>
                      <SelectItem value="published" className="text-slate-100">Solo Publicados</SelectItem>
                      <SelectItem value="dev" className="text-slate-100">Solo en Desarrollo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Show/Hide Toggles */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-600">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-published"
                    checked={showPublished}
                    onCheckedChange={setShowPublished}
                  />
                  <Label htmlFor="show-published" className="text-slate-200 text-sm">
                    Mostrar Publicados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-dev"
                    checked={showInDev}
                    onCheckedChange={setShowInDev}
                  />
                  <Label htmlFor="show-dev" className="text-slate-200 text-sm">
                    Mostrar en Desarrollo
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o ruta (ej: Juan, /juan-perez)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-400"
            />
          </div>
          
          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <p>
              Mostrando {filteredAndSortedContacts.length} de {contacts.length} contacto{contacts.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtrado por: "${searchTerm}")`}
            </p>
            {filteredAndSortedContacts.length !== contacts.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setShowInDev(true);
                  setShowPublished(true);
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedContacts.length > 0 ? (
            filteredAndSortedContacts.map((contact) => (
            <Card key={contact.id} className="glass-effect border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-100 truncate">
                      {contact.name}
                    </CardTitle>
                    <p className="text-sm text-slate-400">{contact.title}</p>
                  </div>
                  <div className="flex gap-1">
                    {contact.inDev === "true" && (
                      <AlertTriangle className="w-4 h-4 text-amber-400" title="En desarrollo" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Ruta</p>
                  <a 
                    href={`/${contact.ruta}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
                    >
                      /{contact.ruta}
                    </Badge>
                  </a>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Estado</p>
                  <div className="flex gap-2">
                    <Badge 
                      variant={contact.inDev === "true" ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {contact.inDev === "true" ? "En Desarrollo" : "Publicado"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Contacto</p>
                  {(() => {
                    // Parse email field (could be JSON array or string)
                    let emailDisplay = '';
                    try {
                      const emails = JSON.parse(contact.email || '[]');
                      if (Array.isArray(emails) && emails.length > 0) {
                        emailDisplay = emails[0].url || emails[0].label || '';
                      }
                    } catch {
                      emailDisplay = contact.email || '';
                    }
                    
                    // Parse phone field (could be JSON array or string)
                    let phoneDisplay = '';
                    try {
                      const phones = JSON.parse(contact.phone || '[]');
                      if (Array.isArray(phones) && phones.length > 0) {
                        phoneDisplay = phones[0].url || phones[0].label || '';
                      }
                    } catch {
                      phoneDisplay = contact.phone || '';
                    }
                    
                    return (
                      <>
                        {emailDisplay && <p className="text-sm text-slate-300 truncate">{emailDisplay}</p>}
                        {phoneDisplay && <p className="text-sm text-slate-300">{phoneDisplay}</p>}
                      </>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditContact(contact)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/${contact.ruta}/stats`, '_blank')}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    title="Ver estadísticas"
                  >
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQR(contact)}
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    title="Descargar código QR"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                  
                  {/* Development toggle - only for superadmin */}
                  {isSuperAdmin && (
                    <Button
                      size="sm"
                      variant={contact.inDev === "true" ? "secondary" : "default"}
                      onClick={() => toggleDevMutation.mutate({ 
                        id: contact.id, 
                        inDev: contact.inDev 
                      })}
                      disabled={toggleDevMutation.isPending}
                      title={contact.inDev === "true" ? "Publicar contacto" : "Marcar en desarrollo"}
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("¿Estás seguro de que quieres eliminar este contacto?")) {
                        deleteContactMutation.mutate(contact.id);
                      }
                    }}
                    disabled={deleteContactMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-2">No se encontraron contactos</p>
              <p className="text-slate-500 text-sm">
                {searchTerm ? `No hay contactos que coincidan con "${searchTerm}"` : "No hay contactos creados"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => onEditContact({} as Contact)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer contacto
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}