import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Palette,
  Settings,
  Upload,
  Image,
  X
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";

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

interface MenuItem {
  id?: number;
  menuId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVegetarian: number;
  isSpicy: number;
  specialLabel: string;
  sortOrder: number;
  isActive: number;
}

interface MenuEditorProps {
  menuSlug: string;
}

export default function MenuEditor({ menuSlug }: MenuEditorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [menuData, setMenuData] = useState<Partial<Menu>>({
    slug: menuSlug,
    name: "",
    description: "",
    primaryColor: "#d97706",
    secondaryColor: "#92400e", 
    accentColor: "#fbbf24",
    backgroundColor: "#451a03",
    textColor: "#fef3c7",
    showChefRecommendation: 1,
    showSpicyIndicator: 1,
    showVegetarianIndicator: 1,
    showExtraLabels: 1,
  });
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  // Fetch existing menu data
  const { data: menuResponse, isLoading } = useQuery({
    queryKey: ['/api/menu', menuSlug],
    enabled: !!menuSlug,
  });

  useEffect(() => {
    if (menuResponse) {
      if (menuResponse.menu) {
        setMenuData({
          ...menuResponse.menu,
          showChefRecommendation: menuResponse.menu.showChefRecommendation || 1,
          showSpicyIndicator: menuResponse.menu.showSpicyIndicator || 1,
          showVegetarianIndicator: menuResponse.menu.showVegetarianIndicator || 1,
          showExtraLabels: menuResponse.menu.showExtraLabels || 1,
        });
      }
      if (menuResponse.items) {
        setItems(menuResponse.items);
      }
    }
  }, [menuResponse]);

  // Save menu configuration
  const saveMenuMutation = useMutation({
    mutationFn: async (data: Partial<Menu>) => {
      return apiRequest(`/api/admin/menu/${menuSlug}`, {
        method: 'POST',
        body: JSON.stringify({ ...data, password: "CamisasWenas.!" }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Menú guardado",
        description: "La configuración del menú se ha guardado correctamente.",
      });
      
      // If the slug changed, redirect to new URL
      if (data.slug && data.slug !== menuSlug) {
        setLocation(`/${data.slug}/edit`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/menu', menuSlug] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración del menú.",
        variant: "destructive",
      });
    },
  });

  // Save menu item
  const saveItemMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      if (item.id) {
        return apiRequest(`/api/admin/menu/${menuSlug}/items/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...item, password: "CamisasWenas.!" }),
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return apiRequest(`/api/admin/menu/${menuSlug}/items`, {
          method: 'POST',
          body: JSON.stringify({ ...item, password: "CamisasWenas.!" }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Plato guardado",
        description: "El plato se ha guardado correctamente.",
      });
      setShowItemForm(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['/api/menu', menuSlug] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar el plato.",
        variant: "destructive",
      });
    },
  });

  // Delete menu item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest(`/api/admin/menu/${menuSlug}/items/${itemId}`, {
        method: 'DELETE',
        body: JSON.stringify({ password: "CamisasWenas.!" }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Plato eliminado",
        description: "El plato se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/menu', menuSlug] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plato.",
        variant: "destructive",
      });
    },
  });

  const handleSaveMenu = () => {
    saveMenuMutation.mutate(menuData);
  };

  const handleSaveItem = (item: MenuItem) => {
    saveItemMutation.mutate(item);
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este plato?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleAddNewItem = () => {
    setEditingItem({
      menuId: menuData.id || 0,
      name: "",
      description: "",
      price: 0,
      category: "entradas",
      image: "",
      isVegetarian: 0,
      isSpicy: 0,
      specialLabel: "",
      sortOrder: items.length,
      isActive: 1,
    });
    setShowItemForm(true);
  };

  const categories = [
    { id: "entradas", name: "Entradas" },
    { id: "principales", name: "Platos Principales" },
    { id: "postres", name: "Postres" },
    { id: "bebidas", name: "Bebidas" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Cargando editor de menú...</div>
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
              Editor de Menú: {menuSlug}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(`/${menuSlug}`, '_blank')}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={handleSaveMenu}
              disabled={saveMenuMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMenuMutation.isPending ? "Guardando..." : "Guardar Menú"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu Configuration */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Nombre del Menú</Label>
                    <Input
                      value={menuData.name || ""}
                      onChange={(e) => setMenuData({ ...menuData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Ej: Menú Principal"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Ruta del Menú (URL)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">/</span>
                      <Input
                        value={menuData.slug || ""}
                        onChange={(e) => {
                          // Sanitize slug: lowercase, no spaces, only alphanumeric and hyphens
                          const sanitized = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, '');
                          setMenuData({ ...menuData, slug: sanitized });
                        }}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="menu-principal"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Se accederá como: /{menuData.slug || "menu-principal"}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-200">Descripción</Label>
                  <Textarea
                    value={menuData.description || ""}
                    onChange={(e) => setMenuData({ ...menuData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="Descripción del menú..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Configuration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Colores del Menú
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Color Principal</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={menuData.primaryColor || "#d97706"}
                        onChange={(e) => setMenuData({ ...menuData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={menuData.primaryColor || "#d97706"}
                        onChange={(e) => setMenuData({ ...menuData, primaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color Secundario</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={menuData.secondaryColor || "#92400e"}
                        onChange={(e) => setMenuData({ ...menuData, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={menuData.secondaryColor || "#92400e"}
                        onChange={(e) => setMenuData({ ...menuData, secondaryColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color de Acento</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={menuData.accentColor || "#fbbf24"}
                        onChange={(e) => setMenuData({ ...menuData, accentColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={menuData.accentColor || "#fbbf24"}
                        onChange={(e) => setMenuData({ ...menuData, accentColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200">Color de Fondo</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={menuData.backgroundColor || "#451a03"}
                        onChange={(e) => setMenuData({ ...menuData, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={menuData.backgroundColor || "#451a03"}
                        onChange={(e) => setMenuData({ ...menuData, backgroundColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-200">Color de Texto</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={menuData.textColor || "#fef3c7"}
                        onChange={(e) => setMenuData({ ...menuData, textColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-600"
                      />
                      <Input
                        value={menuData.textColor || "#fef3c7"}
                        onChange={(e) => setMenuData({ ...menuData, textColor: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Toggles */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Opciones del Menú</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Mostrar "Recomendación del Chef"</Label>
                  <Switch
                    checked={menuData.showChefRecommendation === 1}
                    onCheckedChange={(checked) => 
                      setMenuData({ ...menuData, showChefRecommendation: checked ? 1 : 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Mostrar indicador "Picante"</Label>
                  <Switch
                    checked={menuData.showSpicyIndicator === 1}
                    onCheckedChange={(checked) => 
                      setMenuData({ ...menuData, showSpicyIndicator: checked ? 1 : 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Mostrar indicador "Vegetariano"</Label>
                  <Switch
                    checked={menuData.showVegetarianIndicator === 1}
                    onCheckedChange={(checked) => 
                      setMenuData({ ...menuData, showVegetarianIndicator: checked ? 1 : 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Mostrar etiquetas especiales</Label>
                  <Switch
                    checked={menuData.showExtraLabels === 1}
                    onCheckedChange={(checked) => 
                      setMenuData({ ...menuData, showExtraLabels: checked ? 1 : 0 })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100">Platos del Menú</CardTitle>
                  <Button
                    onClick={handleAddNewItem}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Plato
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-100">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === item.category)?.name || item.category}
                          </Badge>
                          {item.specialLabel && (
                            <Badge className="text-xs bg-yellow-600 text-yellow-900">
                              {item.specialLabel}
                            </Badge>
                          )}
                          {item.isVegetarian === 1 && (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                              Vegetariano
                            </Badge>
                          )}
                          {item.isSpicy === 1 && (
                            <Badge variant="outline" className="text-xs text-red-400 border-red-400">
                              Picante
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                        <p className="text-lg font-bold text-green-400">
                          ${(item.price / 100).toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id!)}
                          className="bg-red-600 border-red-500 text-white hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      No hay platos en el menú. ¡Agrega el primero!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Item Form Modal */}
        {showItemForm && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-100 mb-4">
                {editingItem.id ? 'Editar Plato' : 'Agregar Nuevo Plato'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Nombre del Plato</Label>
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Categoría</Label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-200">Descripción</Label>
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Precio (en pesos)</Label>
                    <Input
                      type="number"
                      value={editingItem.price / 100}
                      onChange={(e) => setEditingItem({ ...editingItem, price: Math.round(parseFloat(e.target.value) * 100) })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Etiqueta Especial</Label>
                    <Input
                      value={editingItem.specialLabel}
                      onChange={(e) => setEditingItem({ ...editingItem, specialLabel: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Ej: Recomendación del Chef"
                    />
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <Label className="text-slate-200">Imagen del Plato</Label>
                  <div className="mt-2">
                    {editingItem.image ? (
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={editingItem.image.startsWith('http') ? editingItem.image : `/public-objects/${editingItem.image}`}
                            alt={editingItem.name}
                            className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem({ ...editingItem, image: "" })}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-600 border-red-500 text-white hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-300">Imagen actual</p>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880} // 5MB
                            onGetUploadParameters={async () => {
                              const response = await fetch('/api/objects/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                              });
                              const data = await response.json();
                              return {
                                method: 'PUT' as const,
                                url: data.uploadURL
                              };
                            }}
                            onComplete={(result) => {
                              if (result.successful?.[0]?.uploadURL) {
                                const imageUrl = result.successful[0].uploadURL.split('?')[0];
                                const imagePath = imageUrl.split('/').pop() || '';
                                setEditingItem({ ...editingItem, image: imagePath });
                              }
                            }}
                            buttonClassName="bg-blue-600 hover:bg-blue-700 text-sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Cambiar Imagen
                          </ObjectUploader>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                        <Image className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400 mb-3">No hay imagen asignada</p>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880} // 5MB
                          onGetUploadParameters={async () => {
                            const response = await fetch('/api/objects/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            const data = await response.json();
                            return {
                              method: 'PUT' as const,
                              url: data.uploadURL
                            };
                          }}
                          onComplete={(result) => {
                            if (result.successful?.[0]?.uploadURL) {
                              const imageUrl = result.successful[0].uploadURL.split('?')[0];
                              const imagePath = imageUrl.split('/').pop() || '';
                              setEditingItem({ ...editingItem, image: imagePath });
                            }
                          }}
                          buttonClassName="bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Imagen
                        </ObjectUploader>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegetarian === 1}
                      onChange={(e) => setEditingItem({ ...editingItem, isVegetarian: e.target.checked ? 1 : 0 })}
                    />
                    <Label className="text-slate-200">Vegetariano</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isSpicy === 1}
                      onChange={(e) => setEditingItem({ ...editingItem, isSpicy: e.target.checked ? 1 : 0 })}
                    />
                    <Label className="text-slate-200">Picante</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isActive === 1}
                      onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked ? 1 : 0 })}
                    />
                    <Label className="text-slate-200">Activo</Label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleSaveItem(editingItem)}
                    disabled={saveItemMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saveItemMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowItemForm(false);
                      setEditingItem(null);
                    }}
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