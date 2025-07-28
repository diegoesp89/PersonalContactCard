import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Eye, Download, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  filename: string;
  url: string;
  uploadDate: Date;
}

export default function GalleryPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authenticate admin
  const authenticateMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
      });
      if (!response.ok) throw new Error("Authentication failed");
      return response.json();
    },
    onSuccess: () => {
      const isSuper = password === "Mafatanga2025";
      setIsAuthenticated(true);
      setIsSuperAdmin(isSuper);
      toast({
        title: "Autenticación exitosa",
        description: isSuper ? "Acceso SuperAdmin activado" : "Acceso Admin activado"
      });
    },
    onError: () => {
      toast({
        title: "Error de autenticación",
        description: "Contraseña incorrecta",
        variant: "destructive"
      });
    }
  });

  // Get gallery images
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
    enabled: isAuthenticated,
  });

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setUploadFile(null);
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente"
      });
    },
    onError: () => {
      toast({
        title: "Error de subida",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      });
    }
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await fetch(`/api/gallery/${filename}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente"
      });
    },
    onError: () => {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      });
    }
  });

  // Clear cache mutation (SuperAdmin only)
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/gallery/clear-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) throw new Error("Clear cache failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Caché limpiado",
        description: `Se eliminaron ${data.oldCacheSize} imágenes del caché. Object Storage: ${data.objectStorageHealth.failCount} fallos.`
      });
    },
    onError: () => {
      toast({
        title: "Error al limpiar caché",
        description: "No se pudo limpiar el caché",
        variant: "destructive"
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      authenticateMutation.mutate(password);
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleDelete = (filename: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar ${filename}?`)) {
      deleteMutation.mutate(filename);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <CardTitle className="text-white text-2xl">Gallery Admin</CardTitle>
            <p className="text-slate-400">Ingresa la contraseña de administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={authenticateMutation.isPending}
              >
                {authenticateMutation.isPending ? "Verificando..." : "Acceder"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gallery Admin</h1>
            <p className="text-slate-400">
              Gestiona todas las imágenes del servidor 
              {isSuperAdmin && <span className="text-blue-400 font-semibold"> (SuperAdmin)</span>}
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* Upload Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Subir Nueva Imagen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upload" className="text-slate-300">Seleccionar archivo</Label>
                    <Input
                      id="upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  {uploadFile && (
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-white text-sm">
                        <strong>Archivo:</strong> {uploadFile.name}
                      </p>
                      <p className="text-slate-400 text-sm">
                        <strong>Tamaño:</strong> {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={handleUpload}
                    disabled={!uploadFile || uploadMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {uploadMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Clear Cache Button (SuperAdmin only) */}
            {isSuperAdmin && (
              <Button 
                variant="outline"
                onClick={() => {
                  if (confirm("¿Estás seguro de que quieres limpiar el caché de imágenes? Esto forzará una recarga completa desde Object Storage.")) {
                    clearCacheMutation.mutate();
                  }
                }}
                disabled={clearCacheMutation.isPending}
                className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
                title="Limpiar caché de galería - Solo SuperAdmin"
              >
                🗑️ {clearCacheMutation.isPending ? "Limpiando..." : "Limpiar Caché"}
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={() => {
                setIsAuthenticated(false);
                setPassword("");
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Imágenes</p>
                  <p className="text-2xl font-bold text-white">{images.length}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Acceso</p>
                  <p className="text-2xl font-bold text-white">
                    {isSuperAdmin ? "SuperAdmin" : "Admin"}
                  </p>
                </div>
                <Lock className={`h-8 w-8 ${isSuperAdmin ? 'text-yellow-400' : 'text-green-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Estado</p>
                  <p className="text-2xl font-bold text-green-400">Activo</p>
                </div>
                <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Upload className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay imágenes en la galería</p>
              <p className="text-slate-500 text-sm">Sube tu primera imagen para comenzar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image: GalleryImage) => (
              <Card key={image.filename} className="bg-slate-800/50 border-slate-700 overflow-hidden group">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(image)}
                      className="bg-white/20 hover:bg-white/30"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image.url, image.filename)}
                      className="bg-white/20 hover:bg-white/30"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.filename)}
                      className="bg-red-600/80 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-white font-medium truncate">{image.filename}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(image.uploadDate).toLocaleDateString('es-ES')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedImage.filename}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-auto">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <p className="text-slate-400">
                  Subida: {new Date(selectedImage.uploadDate).toLocaleString('es-ES')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => downloadImage(selectedImage.url, selectedImage.filename)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedImage.filename);
                      setSelectedImage(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}