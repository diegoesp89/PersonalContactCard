import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login with password:", password);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      console.log("Login response:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log("Login error response:", errorData);
        throw new Error("Invalid password");
      }

      const responseData = await response.json();
      console.log("Login success:", responseData);

      toast({
        title: "Acceso autorizado",
        description: "Bienvenido al panel de administración",
      });
      
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error de autenticación",
        description: "Contraseña incorrecta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md glass-effect border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-slate-100">Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acceder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}