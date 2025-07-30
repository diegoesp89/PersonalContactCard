import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star,
  Clock,
  Users,
  Leaf,
  Flame,
  ShoppingCart,
  Plus,
  Minus,
  ChefHat
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
  isPopular?: boolean;
  prepTime?: string;
  rating?: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  // Entradas
  {
    id: "1",
    name: "Carpaccio de Salmón",
    description: "Láminas finas de salmón fresco con alcaparras, rúcula y aceite de oliva extra virgen",
    price: 12500,
    category: "entradas",
    isPopular: true,
    prepTime: "10 min",
    rating: 4.8
  },
  {
    id: "2",
    name: "Tabla de Quesos Artesanales",
    description: "Selección de quesos locales con mermeladas caseras, nueces y crackers",
    price: 9800,
    category: "entradas",
    isVegetarian: true,
    prepTime: "5 min",
    rating: 4.6
  },
  {
    id: "3",
    name: "Ceviche de Corvina",
    description: "Corvina fresca marinada en limón con ají amarillo, cebolla morada y camote",
    price: 11200,
    category: "entradas",
    isSpicy: true,
    prepTime: "15 min",
    rating: 4.9
  },

  // Platos Principales
  {
    id: "4",
    name: "Lomo Saltado Premium",
    description: "Lomo fino salteado con cebolla, tomate y ají amarillo, acompañado de papas fritas y arroz",
    price: 18900,
    category: "principales",
    isPopular: true,
    isSpicy: true,
    prepTime: "20 min",
    rating: 4.7
  },
  {
    id: "5",
    name: "Salmón a la Plancha",
    description: "Filete de salmón con risotto de espárragos y salsa de mantequilla al limón",
    price: 22500,
    category: "principales",
    prepTime: "25 min",
    rating: 4.8
  },
  {
    id: "6",
    name: "Ñoquis de Espinaca",
    description: "Ñoquis caseros de espinaca con salsa de queso parmesano y nueces",
    price: 14800,
    category: "principales",
    isVegetarian: true,
    prepTime: "15 min",
    rating: 4.5
  },
  {
    id: "7",
    name: "Paella Mixta",
    description: "Arroz bomba con mariscos, pollo, chorizo español y azafrán (para 2 personas)",
    price: 32000,
    category: "principales",
    prepTime: "35 min",
    rating: 4.9
  },

  // Postres
  {
    id: "8",
    name: "Tiramisú de la Casa",
    description: "Clásico italiano con café expreso, mascarpone y cacao en polvo",
    price: 7500,
    category: "postres",
    isPopular: true,
    prepTime: "5 min",
    rating: 4.7
  },
  {
    id: "9",
    name: "Cheesecake de Frutos Rojos",
    description: "Suave cheesecake con compota de frutos rojos y base de galleta",
    price: 8200,
    category: "postres",
    isVegetarian: true,
    prepTime: "5 min",
    rating: 4.6
  },
  {
    id: "10",
    name: "Volcán de Chocolate",
    description: "Bizcocho de chocolate con centro líquido, helado de vainilla y frutos secos",
    price: 8900,
    category: "postres",
    isVegetarian: true,
    prepTime: "12 min",
    rating: 4.8
  },

  // Bebidas
  {
    id: "11",
    name: "Pisco Sour Premium",
    description: "Pisco acholado, limón, jarabe de goma, clara de huevo y amargo de angostura",
    price: 6500,
    category: "bebidas",
    isPopular: true,
    prepTime: "3 min",
    rating: 4.9
  },
  {
    id: "12",
    name: "Limonada de Maracuyá",
    description: "Refrescante limonada con pulpa de maracuyá y menta fresca",
    price: 4200,
    category: "bebidas",
    isVegetarian: true,
    prepTime: "2 min",
    rating: 4.4
  },
  {
    id: "13",
    name: "Sangría de la Casa",
    description: "Vino tinto con frutas de estación, brandy y especias (jarra 1L)",
    price: 12800,
    category: "bebidas",
    prepTime: "5 min",
    rating: 4.6
  }
];

const categories = [
  { id: "entradas", name: "Entradas", icon: "🥗" },
  { id: "principales", name: "Platos Principales", icon: "🍽️" },
  { id: "postres", name: "Postres", icon: "🍰" },
  { id: "bebidas", name: "Bebidas", icon: "🍹" }
];

export default function MenuDemo() {
  const [activeCategory, setActiveCategory] = useState("entradas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Restaurante Demo</h1>
                <p className="text-slate-400 text-sm">Cocina Fusión Gourmet</p>
              </div>
            </div>
            
            {/* Cart Button */}
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-orange-600 hover:bg-orange-700"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
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
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold text-slate-100">{item.name}</h3>
                                {item.isPopular && (
                                  <Badge className="bg-orange-600 text-white">
                                    <Star className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
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
                              
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                {item.prepTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {item.prepTime}
                                  </div>
                                )}
                                {item.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {item.rating}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-400 mb-3">
                                {formatPrice(item.price)}
                              </div>
                              <Button
                                onClick={() => addToCart(item)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar
                              </Button>
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

          {/* Cart Sidebar */}
          <div className={`lg:col-span-1 ${showCart ? 'block' : 'hidden lg:block'}`}>
            <Card className="glass-effect border-slate-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Tu Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Tu carrito está vacío
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-slate-100 font-medium text-sm">{item.name}</h4>
                          <p className="text-slate-400 text-xs">{formatPrice(item.price)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0 border-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-slate-100 w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 p-0 border-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-slate-600 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-100 font-semibold">Total:</span>
                        <span className="text-orange-400 font-bold text-xl">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Proceder al Pago
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}