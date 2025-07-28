import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Upload, RefreshCw, Database, AlertTriangle, 
  CheckCircle, Clock, HardDrive, Cloud 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageManagement() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [galleryStats, setGalleryStats] = useState<any>(null);
  const { toast } = useToast();

  const authenticate = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Por favor ingresa la contraseña de administrador",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "Éxito",
          description: "Autenticación exitosa",
        });
        await loadGalleryStats();
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
        description: "Error de conexión",
        variant: "destructive",
      });
    }
  };

  const loadGalleryStats = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const images = await response.json();
        setGalleryStats({
          totalImages: images.length,
          images: images.slice(0, 10), // Show first 10 for preview
        });
      }
    } catch (error) {
      console.error("Error loading gallery stats:", error);
    }
  };

  const backupLocalImages = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Se requiere contraseña para el respaldo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gallery/backup-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      setBackupResult(result);

      if (result.success) {
        toast({
          title: "Respaldo Completado",
          description: `${result.results.success} imágenes respaldadas exitosamente`,
        });
        await loadGalleryStats();
      } else {
        toast({
          title: "Información",
          description: result.message,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error ejecutando respaldo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Se requiere contraseña para limpiar caché",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gallery/clear-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Caché Limpiado",
          description: "El caché de la galería ha sido limpiado exitosamente",
        });
        await loadGalleryStats();
      } else {
        toast({
          title: "Error",
          description: "Error limpiando caché",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error limpiando caché",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-slate-100">Gestión de Imágenes</CardTitle>
            <p className="text-slate-400 text-sm">
              Panel de administración para el sistema de imágenes y respaldos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-slate-200">
                Contraseña de Administrador
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && authenticate()}
                className="bg-slate-800/50 border-slate-600 text-slate-100"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            <Button 
              onClick={authenticate} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Autenticar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Gestión de Imágenes y Respaldos
          </h1>
          <p className="text-slate-400">
            Panel de administración para monitorear y gestionar el sistema de imágenes
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Total de Imágenes
              </CardTitle>
              <HardDrive className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {galleryStats?.totalImages || 0}
              </div>
              <p className="text-xs text-slate-500">
                Imágenes en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Estado del Sistema
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                Operativo
              </div>
              <p className="text-xs text-slate-500">
                Sistema funcionando correctamente
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Último Respaldo
              </CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {backupResult ? "Reciente" : "Pendiente"}
              </div>
              <p className="text-xs text-slate-500">
                {backupResult ? "Respaldo ejecutado" : "No ejecutado aún"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-blue-400" />
                Respaldo a Object Storage
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Respalda todas las imágenes locales a Object Storage para prevenir pérdida de datos en deploys
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={backupLocalImages} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Ejecutando Respaldo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Ejecutar Respaldo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-400" />
                Limpiar Caché
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Limpia el caché de la galería para forzar recarga desde Object Storage
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={clearCache} 
                disabled={loading}
                variant="outline"
                className="w-full border-slate-600 text-slate-100 hover:bg-slate-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpiar Caché
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backup Results */}
        {backupResult && (
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Resultado del Último Respaldo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {backupResult.results?.total || 0}
                  </div>
                  <p className="text-sm text-slate-400">Total procesadas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {backupResult.results?.success || 0}
                  </div>
                  <p className="text-sm text-slate-400">Exitosas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {backupResult.results?.failed || 0}
                  </div>
                  <p className="text-sm text-slate-400">Fallidas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {backupResult.results?.existingInObjectStorage || 0}
                  </div>
                  <p className="text-sm text-slate-400">Ya respaldadas</p>
                </div>
              </div>

              {backupResult.results?.errors && backupResult.results.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errores encontrados:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {backupResult.results.errors.slice(0, 3).map((error: string, index: number) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                      {backupResult.results.errors.length > 3 && (
                        <li className="text-sm">... y {backupResult.results.errors.length - 3} errores más</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> En producción, las imágenes se guardan automáticamente en Object Storage. 
            Este panel te permite verificar y respaldar imágenes que pudieran haberse guardado solo localmente. 
            El sistema ejecuta verificaciones automáticas cada 30 minutos en producción.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}