import { useState, useEffect, useRef } from "react";
import { Instagram } from "lucide-react";

export default function HomePage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
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
          x: deltaY * 20, // Max 20 degrees tilt
          y: deltaX * -20
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
          x: Math.max(-25, Math.min(25, e.beta * 0.8)), 
          y: Math.max(-25, Math.min(25, e.gamma * 0.8))
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
          className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl relative transition-transform duration-300 ease-out cursor-pointer"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {!imageLoaded && (
            <div className="w-full h-full bg-slate-700/50 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-600/50 rounded-full animate-pulse"></div>
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
            href="https://instagram.com/cashirts_camisas_a_medida"
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
      </div>
    </div>
  );
}