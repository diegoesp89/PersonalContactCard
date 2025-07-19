import { useState, useRef, useEffect } from "react";
import { X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ImageGalleryModalProps {
  isOpen: boolean;
  currentImage?: string;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
}

interface GalleryImage {
  filename: string;
  url: string;
  uploadDate: string;
}

export default function ImageGalleryModal({ isOpen, currentImage, onSelectImage, onClose }: ImageGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gallery images
  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: isOpen
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Imagen subida",
        description: "La imagen se subió correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setSelectedImage(data.imageUrl);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
  };

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(currentImage || '');
    }
  }, [isOpen, currentImage]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Galería de Imágenes</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Subiendo..." : "Subir Nueva Imagen"}
            </Button>
            <p className="text-slate-400 text-sm">
              Máximo 5MB - JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No hay imágenes en la galería</p>
              <p className="text-slate-500 text-sm mt-2">Sube tu primera imagen usando el botón de arriba</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image: GalleryImage) => (
                <div
                  key={image.filename}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImage === image.url
                      ? 'ring-2 ring-blue-500 transform scale-105'
                      : 'hover:scale-105 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedImage === image.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {selectedImage && (
              <span>Imagen seleccionada: {selectedImage.split('/').pop()}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSelectImage}
              disabled={!selectedImage}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Seleccionar Imagen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}