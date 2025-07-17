import { Mail } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="glass-effect rounded-3xl p-8 w-full max-w-md text-center">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl">
          <img
            src="/cas.jpg"
            alt="CA Shirts Logo"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Email Contact */}
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-slate-100 mb-6">
            Contacto
          </h1>
          
          <a
            href="mailto:crt.cas@gmail.com"
            className="flex items-center justify-center p-4 rounded-xl border border-slate-700 hover:translate-y-[-2px] transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30 group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-md group-hover:bg-blue-600 transition-colors">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-slate-100 font-semibold">Correo Electrónico</h3>
              <p className="text-slate-400 text-sm">crt.cas@gmail.com</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}