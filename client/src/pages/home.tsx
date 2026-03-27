import { useState, useEffect, useRef } from "react";
import { Instagram, Phone, Mail, Building2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageModal from "@/components/ImageModal";

export default function HomePage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCASModal, setShowCASModal] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  // Mouse movement and gyroscope effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        
        setTilt({
          x: 0, // No vertical tilt
          y: deltaX * -20 // Only horizontal tilt
        });
      }
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    // Global mouse movement for container area
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const isHovering = e.clientX >= rect.left && e.clientX <= rect.right && 
                          e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isHovering) {
          handleMouseMove(e);
        }
      }
    };

    // Gyroscope effect for mobile
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setTilt({
          x: 0, // No vertical tilt
          y: Math.max(-25, Math.min(25, e.gamma * 0.8)) // Only horizontal tilt
        });
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    const logoElement = logoRef.current;
    if (logoElement) {
      logoElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
      
      if (logoElement) {
        logoElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="glass-effect rounded-3xl p-8 w-full max-w-md text-center">
        {/* Logo */}
        <div 
          ref={logoRef}
          className="w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl relative transition-transform duration-300 ease-out cursor-pointer"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
          onClick={() => setShowImageModal(true)}
        >
          {!imageLoaded && (
            <div className="w-full h-full bg-slate-700/50 animate-pulse flex items-center justify-center">
              <div className="w-24 h-24 bg-slate-600/50 rounded-full animate-pulse"></div>
            </div>
          )}
          <img
            src="/cas.jpg"
            alt="CA Shirts Logo"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
        
        {/* Instagram Contact */}
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-slate-100 mb-6">
            Contacto
          </h1>
          
          <a
            href="https://www.instagram.com/cas_shirts_and_market"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] transition-all duration-300 hover:bg-pink-500/10 hover:border-pink-500/30 group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-md group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
              <Instagram className="text-white w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-slate-100 font-semibold">Instagram</h3>
              <p className="text-slate-400 text-sm">@cashirts_camisas_a_medida</p>
            </div>
          </a>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            <button 
              onClick={() => setShowCASModal(true)}
              className="hover:text-slate-300 underline transition-colors cursor-pointer"
            >
              CAS - Contactáctanos si quieres tu propia tarjeta
            </button> - Todos los Derechos Reservados - 2025.
            <br />
            Sistema de Contactos Digitales
          </p>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        imageUrl="/cas.jpg"
        altText="CA Shirts Logo"
        onClose={() => setShowImageModal(false)}
      />

      {/* CAS Contact Modal */}
      <Dialog open={showCASModal} onOpenChange={setShowCASModal}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100 text-center flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Contacto CAS - Sistema
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* WhatsApp */}
            <a
              href="https://wa.me/56982306759"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Phone className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">WhatsApp</h3>
                <p className="text-slate-400 text-sm">+56982306759</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-green-400 transition-colors" />
            </a>

            {/* Phone */}
            <a
              href="tel:+56982306759"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Phone className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Teléfono</h3>
                <p className="text-slate-400 text-sm">+569 8230 6759</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-blue-400 transition-colors" />
            </a>

            {/* Email */}
            <a
              href="mailto:crt.cas@gmail.com"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <Mail className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Email</h3>
                <p className="text-slate-400 text-sm">crt.cas@gmail.com</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-red-400 transition-colors" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/cas_shirts_and_market"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-slate-700 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Instagram className="text-white w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-100 font-semibold text-sm">Instagram</h3>
                <p className="text-slate-400 text-sm">@cashirts_camisas_a_medida</p>
              </div>
              <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-pink-400 transition-colors" />
            </a>
          </div>

          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">
              Sistema de Contactos Digitales CAS
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}