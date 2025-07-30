import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf,
  Flame,
  ChefHat,
  ImageIcon
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}



const menuItems: MenuItem[] = [
  // Entradas
  {
    id: "1",
    name: "Hummus con Pan Pita",
    description: "Puré cremoso de garbanzos con tahini, aceite de oliva, limón y ajo, servido con pan pita caliente",
    price: 8500,
    category: "entradas",
    isVegetarian: true
  },
  {
    id: "2",
    name: "Baba Ganoush",
    description: "Puré de berenjenas asadas con tahini, ajo, limón y aceite de oliva, acompañado de vegetales frescos",
    price: 9200,
    category: "entradas",
    isVegetarian: true
  },
  {
    id: "3",
    name: "Falafel (6 unidades)",
    description: "Croquetas de garbanzos y especias árabes fritas, servidas con salsa tahini y ensalada",
    price: 10800,
    category: "entradas",
    isVegetarian: true
  },
  {
    id: "4",
    name: "Kibbeh (4 unidades)",
    description: "Croquetas de bulgur rellenas con carne de cordero, cebolla y especias, fritas hasta dorar",
    price: 12500,
    category: "entradas"
  },

  // Platos Principales
  {
    id: "5",
    name: "Shawarma de Cordero",
    description: "Finas láminas de cordero marinado con especias árabes, servido en pan pita con vegetales y salsa tahini",
    price: 16800,
    category: "principales"
  },
  {
    id: "6",
    name: "Shawarma de Pollo",
    description: "Pollo marinado en especias árabes, servido en pan pita con tomate, cebolla, pepino y salsa ajo",
    price: 14500,
    category: "principales"
  },
  {
    id: "7",
    name: "Kebab de Cordero",
    description: "Brochetas de cordero marinado con especias orientales, servido con arroz basmati y ensalada tabbouleh",
    price: 19800,
    category: "principales"
  },
  {
    id: "8",
    name: "Mansaf",
    description: "Cordero cocido en salsa de yogurt fermentado (jameed) con almendras, servido sobre arroz",
    price: 22500,
    category: "principales"
  },
  {
    id: "9",
    name: "Makloubeh Vegetariano",
    description: "Arroz basmati con berenjenas, coliflor y especias árabes, servido invertido con yogurt",
    price: 15200,
    category: "principales",
    isVegetarian: true
  },

  // Postres
  {
    id: "10",
    name: "Baklava (3 piezas)",
    description: "Hojaldre relleno de nueces y pistachos, bañado en miel con agua de rosas",
    price: 7800,
    category: "postres",
    isVegetarian: true
  },
  {
    id: "11",
    name: "Kanafeh",
    description: "Postre tradicional con queso fresco cubierto de pasta kadaif y jarabe de azúcar con agua de rosas",
    price: 8500,
    category: "postres",
    isVegetarian: true
  },
  {
    id: "12",
    name: "Muhallabia",
    description: "Pudín cremoso de leche con agua de rosas, decorado con pistachos molidos y canela",
    price: 6200,
    category: "postres",
    isVegetarian: true
  },

  // Bebidas
  {
    id: "13",
    name: "Té de Menta Árabe",
    description: "Té verde con hojas de menta fresca y azúcar, servido en vaso tradicional",
    price: 3500,
    category: "bebidas",
    isVegetarian: true
  },
  {
    id: "14",
    name: "Café Árabe (Qahwa)",
    description: "Café tradicional con cardamomo, servido en tacitas pequeñas con dátiles",
    price: 4200,
    category: "bebidas",
    isVegetarian: true
  },
  {
    id: "15",
    name: "Limonada con Agua de Rosas",
    description: "Refrescante limonada con un toque de agua de rosas y menta fresca",
    price: 4800,
    category: "bebidas",
    isVegetarian: true
  },
  {
    id: "16",
    name: "Jallab",
    description: "Bebida tradicional de jarabe de dátiles, agua de rosas y piñones, servida con hielo",
    price: 5500,
    category: "bebidas",
    isVegetarian: true
  }
];

const categories = [
  { id: "todos", name: "Todos los platos", icon: "📋" },
  { id: "entradas", name: "Entradas", icon: "🥗" },
  { id: "principales", name: "Platos Principales", icon: "🍽️" },
  { id: "postres", name: "Postres", icon: "🍰" },
  { id: "bebidas", name: "Bebidas", icon: "🍹" }
];

export default function MenuDemo() {
  const [activeCategory, setActiveCategory] = useState("todos");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredItems = activeCategory === "todos" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
      {/* Header */}
      <div className="bg-amber-800/80 backdrop-blur-sm border-b border-amber-600 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-amber-100">Menú Demo</h1>
                <p className="text-amber-300 text-sm">Comida rápida - Solo Muestra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="w-full">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-amber-800 border-amber-600">
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-yellow-600 data-[state=active]:text-amber-900 text-amber-200"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="grid gap-6">
                    {filteredItems.map(item => (
                      <Card key={item.id} className="bg-amber-950/70 border-amber-700 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Placeholder para imagen */}
                            <div className="w-32 h-32 bg-amber-800/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-600">
                              <ImageIcon className="w-8 h-8 text-amber-400" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold text-amber-100">{item.name}</h3>
                                {item.isVegetarian && (
                                  <Badge variant="outline" className="border-green-400 text-green-300 bg-green-900/30">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    Vegetariano
                                  </Badge>
                                )}
                                {item.isSpicy && (
                                  <Badge variant="outline" className="border-red-400 text-red-300 bg-red-900/30">
                                    <Flame className="w-3 h-3 mr-1" />
                                    Picante
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-amber-200 mb-3">{item.description}</p>
                              
                              <div className="flex items-center justify-end">
                                <div className="text-2xl font-bold text-yellow-400">
                                  {formatPrice(item.price)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
        </div>
      </div>
    </div>
  );
}