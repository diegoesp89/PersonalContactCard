import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Save, X, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  aspectRatio?: 'square' | 'cover'; // square for profile, cover for cover image
}

export default function ImageEditor({ 
  isOpen, 
  onClose, 
  imageUrl, 
  onSave, 
  aspectRatio = 'square' 
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState([1]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Canvas dimensions based on aspect ratio
  const canvasWidth = aspectRatio === 'cover' ? 400 : 300;
  const canvasHeight = aspectRatio === 'cover' ? 200 : 300;

  useEffect(() => {
    if (isOpen && imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
        // Reset to default values when opening
        setScale([1]);
        setPosition({ x: 0, y: 0 });
        drawImage();
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img || !imageLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate scale to fit image in canvas initially
    const scaleX = canvasWidth / img.width;
    const scaleY = canvasHeight / img.height;
    const initialScale = Math.max(scaleX, scaleY); // Fill the canvas

    const currentScale = initialScale * scale[0];
    const scaledWidth = img.width * currentScale;
    const scaledHeight = img.height * currentScale;

    // Calculate position with constraints
    const maxOffsetX = Math.max(0, (scaledWidth - canvasWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - canvasHeight) / 2);
    
    const constrainedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, position.x));
    const constrainedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, position.y));

    const drawX = (canvasWidth - scaledWidth) / 2 + constrainedX;
    const drawY = (canvasHeight - scaledHeight) / 2 + constrainedY;

    // Draw image
    ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

    // Draw crop overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
  }, [scale, position, imageLoaded, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (imageLoaded) {
      drawImage();
    }
  }, [drawImage, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale([1]);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Create form data and upload
        const formData = new FormData();
        formData.append('profileImage', blob, 'edited-image.png');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onSave(data.imageUrl);
        onClose();
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Error saving edited image:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center">
            <ZoomIn className="w-5 h-5 mr-2" />
            Editor de Imagen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas */}
          <div className="flex justify-center bg-slate-800 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="border border-slate-600 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center">
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom: {scale[0].toFixed(1)}x
              </Label>
              <Slider
                value={scale}
                onValueChange={setScale}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded">
              <p className="flex items-center mb-1">
                <Move className="w-3 h-3 mr-1" />
                Arrastra la imagen para posicionarla
              </p>
              <p>• Usa el deslizador para hacer zoom</p>
              <p>• La línea punteada muestra el área que se guardará</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-600 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetear
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}