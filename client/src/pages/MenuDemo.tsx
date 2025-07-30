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
    name: "Carpaccio de Salmón",
    description: "Láminas finas de salmón fresco con alcaparras, rúcula y aceite de oliva extra virgen",
    price: 12500,
    category: "entradas"
  },
  {
    id: "2",
    name: "Tabla de Quesos Artesanales",
    description: "Selección de quesos locales con mermeladas caseras, nueces y crackers",
    price: 9800,
    category: "entradas",
    isVegetarian: true
  },
  {
    id: "3",
    name: "Ceviche de Corvina",
    description: "Corvina fresca marinada en limón con ají amarillo, cebolla morada y camote",
    price: 11200,
    category: "entradas",
    isSpicy: true
  },

  // Platos Principales
  {
    id: "4",
    name: "Lomo Saltado Premium",
    description: "Lomo fino salteado con cebolla, tomate y ají amarillo, acompañado de papas fritas y arroz",
    price: 18900,
    category: "principales",
    isSpicy: true
  },
  {
    id: "5",
    name: "Salmón a la Plancha",
    description: "Filete de salmón con risotto de espárragos y salsa de mantequilla al limón",
    price: 22500,
    category: "principales"
  },
  {
    id: "6",
    name: "Ñoquis de Espinaca",
    description: "Ñoquis caseros de espinaca con salsa de queso parmesano y nueces",
    price: 14800,
    category: "principales",
    isVegetarian: true
  },
  {
    id: "7",
    name: "Paella Mixta",
    description: "Arroz bomba con mariscos, pollo, chorizo español y azafrán (para 2 personas)",
    price: 32000,
    category: "principales"
  },

  // Postres
  {
    id: "8",
    name: "Tiramisú de la Casa",
    description: "Clásico italiano con café expreso, mascarpone y cacao en polvo",
    price: 7500,
    category: "postres"
  },
  {
    id: "9",
    name: "Cheesecake de Frutos Rojos",
    description: "Suave cheesecake con compota de frutos rojos y base de galleta",
    price: 8200,
    category: "postres",
    isVegetarian: true
  },
  {
    id: "10",
    name: "Volcán de Chocolate",
    description: "Bizcocho de chocolate con centro líquido, helado de vainilla y frutos secos",
    price: 8900,
    category: "postres",
    isVegetarian: true
  },

  // Bebidas
  {
    id: "11",
    name: "Pisco Sour Premium",
    description: "Pisco acholado, limón, jarabe de goma, clara de huevo y amargo de angostura",
    price: 6500,
    category: "bebidas"
  },
  {
    id: "12",
    name: "Limonada de Maracuyá",
    description: "Refrescante limonada con pulpa de maracuyá y menta fresca",
    price: 4200,
    category: "bebidas",
    isVegetarian: true
  },
  {
    id: "13",
    name: "Sangría de la Casa",
    description: "Vino tinto con frutas de estación, brandy y especias (jarra 1L)",
    price: 12800,
    category: "bebidas"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Menú Demo</h1>
                <p className="text-slate-400 text-sm">Comida rápida - Solo Muestra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="w-full">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
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
                      <Card key={item.id} className="glass-effect border-slate-700 hover:border-orange-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Placeholder para imagen */}
                            <div className="w-32 h-32 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-600">
                              <ImageIcon className="w-8 h-8 text-slate-500" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold text-slate-100">{item.name}</h3>
                                {item.isVegetarian && (
                                  <Badge variant="outline" className="border-green-500 text-green-400">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    Vegetariano
                                  </Badge>
                                )}
                                {item.isSpicy && (
                                  <Badge variant="outline" className="border-red-500 text-red-400">
                                    <Flame className="w-3 h-3 mr-1" />
                                    Picante
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-slate-300 mb-3">{item.description}</p>
                              
                              <div className="flex items-center justify-end">
                                <div className="text-2xl font-bold text-orange-400">
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