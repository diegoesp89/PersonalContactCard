import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Leaf,
  Flame,
  ChefHat,
  ImageIcon,
  Edit
} from "lucide-react";

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
  id: number;
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

interface MenuDemoProps {
  menuSlug?: string;
}

export default function MenuDemo({ menuSlug }: MenuDemoProps) {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("entradas");

  // Use menuSlug from props or default to 'menu'
  const slug = menuSlug || 'menu';

  // Fetch menu data from API using the slug
  const { data: menuResponse, isLoading } = useQuery({
    queryKey: ['/api/menu', slug],
  });

  const menu: Menu | null = menuResponse?.menu || null;
  const items: MenuItem[] = menuResponse?.items || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: "#451a03", color: "#fef3c7" }}>
        <div>Cargando menú...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: "#451a03", color: "#fef3c7" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Menú no encontrado</h2>
          <p>No se encontró el menú solicitado.</p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: "entradas", name: "Entradas" },
    { id: "principales", name: "Platos Principales" },
    { id: "postres", name: "Postres" },
    { id: "bebidas", name: "Bebidas" },
  ];

  const getItemsByCategory = (category: string) => 
    items.filter(item => item.category === category && item.isActive === 1);

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: menu.backgroundColor,
        color: menu.textColor 
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: menu.primaryColor }}
          >
            {menu.name}
          </h1>
          {menu.description && (
            <p 
              className="text-lg mb-4"
              style={{ color: menu.textColor }}
            >
              {menu.description}
            </p>
          )}
        </div>

        {/* Categories Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList 
            className="grid w-full grid-cols-4 mb-8 bg-transparent border-2"
            style={{ borderColor: menu.secondaryColor }}
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-sm font-medium data-[state=active]:text-white transition-all"
                style={{
                  color: menu.textColor,
                  backgroundColor: selectedCategory === category.id ? menu.primaryColor : 'transparent',
                }}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <div className="grid gap-6">
                {getItemsByCategory(category.id).map((item) => (
                  <Card 
                    key={item.id} 
                    className="border-2 bg-transparent shadow-lg"
                    style={{ 
                      borderColor: menu.secondaryColor,
                      backgroundColor: `${menu.secondaryColor}15`
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle 
                              className="text-xl"
                              style={{ color: menu.primaryColor }}
                            >
                              {item.name}
                            </CardTitle>
                            
                            {/* Special Labels */}
                            {menu.showExtraLabels === 1 && item.specialLabel && (
                              <Badge 
                                className="text-xs font-semibold"
                                style={{ 
                                  backgroundColor: menu.accentColor,
                                  color: menu.backgroundColor
                                }}
                              >
                                <ChefHat className="w-3 h-3 mr-1" />
                                {item.specialLabel}
                              </Badge>
                            )}
                            
                            {/* Vegetarian Badge */}
                            {menu.showVegetarianIndicator === 1 && item.isVegetarian === 1 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs border-2"
                                style={{ 
                                  borderColor: menu.accentColor,
                                  color: menu.accentColor
                                }}
                              >
                                <Leaf className="w-3 h-3 mr-1" />
                                Vegetariano
                              </Badge>
                            )}
                            
                            {/* Spicy Badge */}
                            {menu.showSpicyIndicator === 1 && item.isSpicy === 1 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs border-2"
                                style={{ 
                                  borderColor: "#ef4444",
                                  color: "#ef4444"
                                }}
                              >
                                <Flame className="w-3 h-3 mr-1" />
                                Picante
                              </Badge>
                            )}
                          </div>
                          
                          <p 
                            className="text-sm mb-4 leading-relaxed"
                            style={{ color: menu.textColor }}
                          >
                            {item.description}
                          </p>
                          
                          <div 
                            className="text-2xl font-bold"
                            style={{ color: menu.accentColor }}
                          >
                            ${(item.price / 100).toLocaleString('es-CL')}
                          </div>
                        </div>
                        
                        {/* Placeholder for image */}
                        {item.image ? (
                          <div className="w-24 h-24 rounded-lg bg-cover bg-center"
                               style={{ backgroundImage: `url(${item.image})` }}>
                          </div>
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-lg flex items-center justify-center border-2 border-dashed"
                            style={{ borderColor: menu.secondaryColor }}
                          >
                            <ImageIcon 
                              className="w-8 h-8"
                              style={{ color: menu.secondaryColor }}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {getItemsByCategory(category.id).length === 0 && (
                <div className="text-center py-12">
                  <p 
                    className="text-lg"
                    style={{ color: menu.textColor }}
                  >
                    No hay platos disponibles en esta categoría
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}