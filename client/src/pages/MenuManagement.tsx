import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  Trash2,
  Save,
  Settings
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface Menu {
  id: number;
  slug: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  showChefRecommendation: number;
  showSpicyIndicator: number;
  showVegetarianIndicator: number;
  showExtraLabels: number;
}

export default function MenuManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenuData, setNewMenuData] = useState({
    slug: "",
    name: "",
    description: "",
    primaryColor: "#d97706",
    secondaryColor: "#92400e", 
    accentColor: "#fbbf24",
    backgroundColor: "#451a03",
    textColor: "#fef3c7",
  });

  // Fetch all menus
  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ['/api/menus'],
  });

  // Create new menu
  const createMenuMutation = useMutation({
    mutationFn: async (data: typeof newMenuData) => {
      const response = await fetch(`/api/admin/menu/${data.slug}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to create menu');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menú creado",
        description: "El nuevo menú se ha creado correctamente.",
      });
      setShowCreateForm(false);
      setNewMenuData({
        slug: "",
        name: "",
        description: "",
        primaryColor: "#d97706",
        secondaryColor: "#92400e", 
        accentColor: "#fbbf24",
        backgroundColor: "#451a03",
        textColor: "#fef3c7",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el menú.",
        variant: "destructive",
      });
    },
  });

  const handleCreateMenu = () => {
    if (!newMenuData.slug || !newMenuData.name) {
      toast({
        title: "Campos requeridos",
        description: "El slug y el nombre son campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    createMenuMutation.mutate(newMenuData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Cargando menús...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-slate-100">
              Gestión de Menús
            </h1>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Menú
          </Button>
        </div>

        {/* Menus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(menus as Menu[]).map((menu: Menu) => (
            <Card key={menu.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-slate-100 mb-2">
                      {menu.name}
                    </CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: menu.primaryColor,
                          color: menu.primaryColor 
                        }}
                      >
                        /{menu.slug}
                      </Badge>
                    </div>
                    {menu.description && (
                      <p className="text-sm text-slate-400 mb-3">
                        {menu.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Color Palette Preview */}
                <div className="flex gap-1 mb-3">
                  <div 
                    className="w-4 h-4 rounded border border-slate-600"
                    style={{ backgroundColor: menu.primaryColor }}
                    title="Color Principal"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-slate-600"
                    style={{ backgroundColor: menu.secondaryColor }}
                    title="Color Secundario"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-slate-600"
                    style={{ backgroundColor: menu.accentColor }}
                    title="Color de Acento"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-slate-600"
                    style={{ backgroundColor: menu.backgroundColor }}
                    title="Color de Fondo"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${menu.slug}`, '_blank')}
                    className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/${menu.slug}/edit`)}
                    className="flex-1 bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {menus.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Settings className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                No hay menús creados
              </h3>
              <p className="text-slate-500 mb-4">
                Crea tu primer menú para comenzar
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Menú
              </Button>
            </div>
          )}
        </div>

        {/* Create Menu Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-100 mb-4">
                Crear Nuevo Menú
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Slug del Menú (URL)</Label>
                    <Input
                      value={newMenuData.slug}
                      onChange={(e) => setNewMenuData({ ...newMenuData, slug: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="ej: pizza-menu"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Se usará como /{newMenuData.slug}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-200">Nombre del Menú</Label>
                    <Input
                      value={newMenuData.name}
                      onChange={(e) => setNewMenuData({ ...newMenuData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Ej: Menú de Pizzas"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-200">Descripción</Label>
                  <Input
                    value={newMenuData.description}
                    onChange={(e) => setNewMenuData({ ...newMenuData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="Descripción del menú..."
                  />
                </div>

                {/* Color Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Color Principal</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newMenuData.primaryColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={newMenuData.primaryColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, primaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color Secundario</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newMenuData.secondaryColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={newMenuData.secondaryColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, secondaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color de Acento</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newMenuData.accentColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, accentColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={newMenuData.accentColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, accentColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color de Fondo</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newMenuData.backgroundColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={newMenuData.backgroundColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, backgroundColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-200">Color de Texto</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newMenuData.textColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, textColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={newMenuData.textColor}
                        onChange={(e) => setNewMenuData({ ...newMenuData, textColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateMenu}
                    disabled={createMenuMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMenuMutation.isPending ? "Creando..." : "Crear Menú"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}