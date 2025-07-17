import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  Trash2,
  Settings,
  CheckCircle,
  XCircle
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
  inDev: string;
  ruta: string;
  approved: string;
  visible: string;
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

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, visible }: { id: number; visible: string }) => {
      return apiRequest(`/api/admin/contacts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, visible: visible === "true" ? "false" : "true" })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Visibilidad actualizada",
        description: "El estado del contacto ha sido cambiado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la visibilidad",
        variant: "destructive",
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
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
              <h1 className="text-2xl font-bold text-slate-100">Panel de Administración</h1>
              <p className="text-slate-400">Gestión de contactos y usuarios</p>
            </div>
          </div>
          <div className="flex gap-2">
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

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
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
                    {contact.approved === "true" ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    {contact.visible === "true" ? (
                      <Eye className="w-4 h-4 text-blue-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Ruta</p>
                  <Badge variant="outline" className="text-xs">
                    /{contact.ruta}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Estado</p>
                  <div className="flex gap-2">
                    <Badge 
                      variant={contact.approved === "true" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {contact.approved === "true" ? "Aprobado" : "Pendiente"}
                    </Badge>
                    <Badge 
                      variant={contact.visible === "true" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {contact.visible === "true" ? "Visible" : "Oculto"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Contacto</p>
                  <p className="text-sm text-slate-300 truncate">{contact.email}</p>
                  <p className="text-sm text-slate-300">{contact.phone}</p>
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
                    onClick={() => toggleVisibilityMutation.mutate({ 
                      id: contact.id, 
                      visible: contact.visible 
                    })}
                    disabled={toggleVisibilityMutation.isPending}
                  >
                    {contact.visible === "true" ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
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
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 mb-4">No hay contactos creados</p>
            <Button onClick={() => onEditContact({} as Contact)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer contacto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}