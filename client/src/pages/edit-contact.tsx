import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertContactSchema, type Contact, type InsertContact } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Save, User, Building2 } from "lucide-react";
import { Link } from "wouter";

export default function EditContactPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: contact, isLoading } = useQuery<Contact>({
    queryKey: ["/api/contact"],
  });

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      title: "",
      phone: "",
      email: "",
      whatsapp: "",
      instagram: "",
      website: "",
      bankName: "",
      bankAccount: "",
      bankClabe: "",
      bankHolder: "",
    },
  });

  // Update form with contact data when loaded
  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        title: contact.title,
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp,
        instagram: contact.instagram,
        website: contact.website,
        bankName: contact.bankName,
        bankAccount: contact.bankAccount,
        bankClabe: contact.bankClabe,
        bankHolder: contact.bankHolder,
      });
    }
  }, [contact, form]);

  const updateContactMutation = useMutation({
    mutationFn: (data: InsertContact) =>
      apiRequest("/api/contact", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Contacto actualizado",
        description: "Los datos se han guardado correctamente",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    updateContactMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-effect rounded-3xl p-8 w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4 text-slate-400 hover:text-slate-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-100">Editar Contacto</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  Información Personal
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nombre</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tu nombre completo" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Título/Profesión</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tu profesión o título" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Teléfono</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+52 123 456 7890" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Correo</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="tu@email.com" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">WhatsApp</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+521234567890" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Instagram</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="@tu_usuario" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Sitio Web</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://tu-sitio.com" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Banking Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-emerald-500" />
                  Información Bancaria
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Banco</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre del banco" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Titular</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre del titular" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Número de Cuenta</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1234 5678 9012 3456" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankClabe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">CLABE</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456789012345678" 
                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono"
                            maxLength={18}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Link href="/" className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={updateContactMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                >
                  {updateContactMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}