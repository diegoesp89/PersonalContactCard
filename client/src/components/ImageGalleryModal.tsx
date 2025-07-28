import { useState, useRef, useEffect } from "react";
import { X, Upload, Check, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageEditor from "./ImageEditor";

interface ImageGalleryModalProps {
  isOpen: boolean;
  currentImage?: string;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
  password: string;
}

interface GalleryImage {
  filename: string;
  url: string;
  uploadDate: string;
}

export default function ImageGalleryModal({ isOpen, currentImage, onSelectImage, onClose, password }: ImageGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const [showEditor, setShowEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
      console.log('Starting upload mutation for file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });

      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Add timeout for mobile connections
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Upload error response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Error ${response.status}: ${errorData || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Upload successful:', result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Upload fetch error:', error);
        
        if (error.name === 'AbortError') {
          throw new Error('La subida tardó demasiado. Intenta con una imagen más pequeña.');
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Upload success:', data);
      toast({
        title: "Imagen subida",
        description: "La imagen se subió correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setSelectedImage(data.imageUrl);
    },
    onError: (error: any) => {
      console.error('Upload mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await fetch(`/api/gallery/${filename}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
      
      return response.json();
    },
    onSuccess: (_, filename) => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se eliminó correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      
      // If the deleted image was selected, clear selection
      if (selectedImage.includes(filename)) {
        setSelectedImage('');
      }
      
      setDeletingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la imagen",
        variant: "destructive",
      });
      
      setDeletingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete('current');
        return newSet;
      });
    }
  });

  const handleDeleteImage = (filename: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeletingImages(prev => new Set(prev).add(filename));
    deleteMutation.mutate(filename);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });

    // More specific validation for mobile devices
    const validImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic', // iOS photos
      'image/heif'  // iOS photos
    ];

    // Check if it's an image by extension if MIME type is missing (mobile issue)
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].some(ext => 
      fileName.endsWith(ext)
    );

    if (!file.type.startsWith('image/') && !hasValidExtension) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: `La imagen debe ser menor a 5MB (actual: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        variant: "destructive",
      });
      return;
    }

    // Check if file is empty (mobile issue)
    if (file.size === 0) {
      toast({
        title: "Error",
        description: "El archivo está vacío. Intenta seleccionar otra imagen.",
        variant: "destructive",
      });
      return;
    }

    // Create temporary URL for editor
    const tempUrl = URL.createObjectURL(file);
    setImageToEdit(tempUrl);
    setShowEditor(true);
    
    // Clear both inputs so same file can be selected again
    event.target.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleEditImage = (imageUrl: string) => {
    setImageToEdit(imageUrl);
    setShowEditor(true);
  };

  const handleEditorSave = (editedImageUrl: string) => {
    setSelectedImage(editedImageUrl);
    queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    setShowEditor(false);
    toast({
      title: "Imagen editada",
      description: "La imagen se ha guardado con los cambios aplicados"
    });
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
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*,.heic,.heif"
              capture="environment"
              onChange={handleFileUpload}
              ref={cameraInputRef}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Subiendo..." : "Galería"}
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  📷 Cámara
                </Button>
              </div>
              <p className="text-slate-400 text-sm">
                Máximo 5MB - JPG, PNG, GIF, WebP, HEIC
              </p>
              <Button
                onClick={() => {
                  console.log('Debug mobile upload:', {
                    userAgent: navigator.userAgent,
                    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    supportedFeatures: {
                      FormData: typeof FormData !== 'undefined',
                      fetch: typeof fetch !== 'undefined',
                      FileReader: typeof FileReader !== 'undefined'
                    }
                  });
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Debug Info
              </Button>
            </div>
            <p className="text-slate-400 text-xs">
              📱 En móviles: "Galería" para elegir foto existente, "Cámara" para tomar nueva foto
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
              {/* Default Avatar Option */}
              <div
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 border-dashed border-slate-600 ${
                  selectedImage === '/default-avatar.svg'
                    ? 'ring-2 ring-blue-500 transform scale-105'
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
                onClick={() => setSelectedImage('/default-avatar.svg')}
              >
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <img
                    src="/default-avatar.svg"
                    alt="Avatar por defecto"
                    className="w-16 h-16 opacity-60"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                  Por defecto
                </div>
                {selectedImage === '/default-avatar.svg' && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="bg-blue-500 rounded-full p-2">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Images */}
              {galleryImages.map((image: GalleryImage) => (
                <div
                  key={image.filename}
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImage === image.url
                      ? 'ring-2 ring-blue-500 transform scale-105'
                      : 'hover:scale-105 hover:shadow-lg'
                  } ${deletingImages.has(image.filename) ? 'opacity-50' : ''}`}
                  onClick={() => !deletingImages.has(image.filename) && setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditImage(image.url);
                      }}
                      className="p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-all"
                      title="Editar imagen"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteImage(image.filename, e)}
                      disabled={deletingImages.has(image.filename)}
                      className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {selectedImage === image.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {deletingImages.has(image.filename) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm">Eliminando...</div>
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

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        imageUrl={imageToEdit}
        onSave={handleEditorSave}
        aspectRatio="square"
      />
    </div>
  );
}