import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Eye,
  MessageCircle,
  Instagram,
  Download,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

interface Contact {
  id: number;
  name: string;
  ruta: string;
}

interface EventCount {
  event: string;
  count: number;
}

interface DailyVisit {
  date: string;
  views: number;
}

interface HourlyDistribution {
  hour: number;
  views: number;
}

interface RecentEvent {
  id: number;
  event: string;
  userAgent: string;
  ipAddress: string;
  timestamp: string;
}

interface AnalyticsData {
  contact: Contact;
  eventCounts: EventCount[];
  dailyVisits: DailyVisit[];
  hourlyDistribution: HourlyDistribution[];
  recentEvents: RecentEvent[];
  period: string;
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [days, setDays] = useState(30);

  // Get contact route from URL
  const pathSegments = window.location.pathname.split('/');
  const ruta = pathSegments[1]; // /cristian-alfaro/stats -> cristian-alfaro
  
  // Analytics query
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', ruta, days],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${ruta}?days=${days}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "Autenticado",
          description: "Acceso concedido a las estadísticas",
        });
      } else {
        toast({
          title: "Error",
          description: "Contraseña incorrecta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar la autenticación",
        variant: "destructive",
      });
    }
  };

  const formatEventName = (event: string) => {
    const eventMap: { [key: string]: string } = {
      'view': 'Visualizaciones',
      'whatsapp_click': 'Clics WhatsApp',
      'instagram_click': 'Clics Instagram',
      'phone_click': 'Clics Teléfono',
      'email_click': 'Clics Email',
      'vcard_download': 'Descargas vCard',
      'share_click': 'Compartir',
      'qr_view': 'Ver QR'
    };
    return eventMap[event] || event;
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'whatsapp_click': return <MessageCircle className="w-4 h-4" />;
      case 'instagram_click': return <Instagram className="w-4 h-4" />;
      case 'vcard_download': return <Download className="w-4 h-4" />;
      case 'share_click': return <Share2 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Acceso a Estadísticas</CardTitle>
            <p className="text-slate-400">Ingresa la contraseña de administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">No se encontraron estadísticas</div>
      </div>
    );
  }

  const totalViews = analytics.eventCounts.find(e => e.event === 'view')?.count || 0;
  const totalInteractions = analytics.eventCounts.reduce((sum, e) => e.event !== 'view' ? sum + e.count : sum, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Estadísticas - {analytics.contact.name}</h1>
            <p className="text-slate-400">{analytics.period}</p>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-slate-300">Período (días):</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 30)}
              className="w-20 bg-slate-800 border-slate-600"
              min="1"
              max="365"
            />
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              Actualizar
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Visualizaciones</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{totalViews}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Interacciones</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{totalInteractions}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Tasa Conversión</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {totalViews > 0 ? ((totalInteractions / totalViews) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Eventos Totales</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {analytics.eventCounts.reduce((sum, e) => sum + e.count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Views Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Calendar className="w-5 h-5" />
                Visualizaciones Diarias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Activity className="w-5 h-5" />
                Distribución de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.eventCounts}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={(entry) => `${formatEventName(entry.event)}: ${entry.count}`}
                  >
                    {analytics.eventCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Clock className="w-5 h-5" />
              Distribución por Horas (Últimos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => `${value}:00`}
                />
                <Bar dataKey="views" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Counts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Eventos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.eventCounts.map((event, index) => (
                  <div key={event.event} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event)}
                      <span className="text-slate-200">{formatEventName(event.event)}</span>
                    </div>
                    <span className="text-lg font-semibold text-slate-100">{event.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analytics.recentEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded text-sm">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.event)}
                      <span className="text-slate-300">{formatEventName(event.event)}</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}