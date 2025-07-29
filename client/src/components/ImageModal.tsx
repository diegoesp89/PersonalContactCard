import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

export default function ImageModal({ isOpen, imageUrl, altText, onClose }: ImageModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onError={onClose}
        />
      </div>
    </div>
  );
}