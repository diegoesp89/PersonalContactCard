import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Upload, RotateCcw, Crop, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCropUploadProps {
  onImageSelect: (file: File) => void;
  isUploading: boolean;
  currentImage?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropUpload({ onImageSelect, isUploading, currentImage }: ImageCropUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setSelectedFile(file);
      setShowCropDialog(true);
      
      // Reset crop settings
      setImageScale(1);
      setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - cropArea.x, 
      y: e.clientY - cropArea.y 
    });
  }, [cropArea]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, rect.width - cropArea.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, rect.height - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCropSizeChange = useCallback((dimension: 'width' | 'height', value: number[]) => {
    const newValue = Math.max(50, Math.min(400, value[0]));
    setCropArea(prev => ({ ...prev, [dimension]: newValue }));
  }, []);

  const cropImage = useCallback(async (): Promise<File | null> => {
    if (!selectedFile || !previewImage || !canvasRef.current || !imageRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Calculate scale factors between displayed image and original
        const displayedRect = imageRef.current!.getBoundingClientRect();
        const scaleX = img.naturalWidth / displayedRect.width;
        const scaleY = img.naturalHeight / displayedRect.height;

        // Apply crop area to original image dimensions
        const cropX = cropArea.x * scaleX;
        const cropY = cropArea.y * scaleY;
        const cropWidth = cropArea.width * scaleX;
        const cropHeight = cropArea.height * scaleY;

        // Set canvas size to crop dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped portion
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        // Convert to blob and create new file
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], selectedFile.name, {
              type: selectedFile.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            resolve(null);
          }
        }, selectedFile.type, 0.9);
      };

      img.src = previewImage;
    });
  }, [selectedFile, previewImage, cropArea]);

  const handleConfirmCrop = useCallback(async () => {
    const croppedFile = await cropImage();
    if (croppedFile) {
      onImageSelect(croppedFile);
      setShowCropDialog(false);
      setPreviewImage(null);
      setSelectedFile(null);
    }
  }, [cropImage, onImageSelect]);

  const handleCancelCrop = useCallback(() => {
    setShowCropDialog(false);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Current Image Preview */}
          {currentImage && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <img
                src={currentImage}
                alt="Current profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={handleCancelCrop}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crop className="w-5 h-5" />
              <span>Recortar Imagen</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Preview with Crop Area */}
            <div className="relative flex justify-center">
              <div 
                className="relative inline-block border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'default' }}
              >
                {previewImage && (
                  <>
                    <img
                      ref={imageRef}
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-96 select-none"
                      style={{ transform: `scale(${imageScale})` }}
                      draggable={false}
                    />
                    
                    {/* Crop Overlay */}
                    <div 
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={handleDragStart}
                    >
                      {/* Corner Handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Crop Width */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ancho: {cropArea.width}px</label>
                  <Slider
                    value={[cropArea.width]}
                    onValueChange={(value) => handleCropSizeChange('width', value)}
                    min={50}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Crop Height */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alto: {cropArea.height}px</label>
                  <Slider
                    value={[cropArea.height]}
                    onValueChange={(value) => handleCropSizeChange('height', value)}
                    min={50}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Image Scale */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zoom: {Math.round(imageScale * 100)}%</label>
                  <Slider
                    value={[imageScale]}
                    onValueChange={(value) => setImageScale(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCropArea({ x: 50, y: 50, width: 200, height: 200 })}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restablecer
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCropArea(prev => ({ ...prev, width: 300, height: 300 }))}
                >
                  Cuadrado Grande
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCropArea(prev => ({ ...prev, width: 200, height: 150 }))}
                >
                  Rectangular
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCancelCrop}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleConfirmCrop} disabled={isUploading}>
                <Check className="w-4 h-4 mr-2" />
                {isUploading ? 'Subiendo...' : 'Confirmar y Subir'}
              </Button>
            </div>
          </div>

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}