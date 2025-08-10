import { useQuery } from "@tanstack/react-query";
import MenuDemo from "./MenuDemo";
import ContactPage from "./contact";
import NotFound from "./not-found";

interface DynamicRouteProps {
  slug: string;
}

export default function DynamicRoute({ slug }: DynamicRouteProps) {
  // First try to get menu data
  const { data: menuResponse, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ['/api/menu', slug],
    retry: false, // Don't retry on 404
  });

  // If menu fails, try to get contact data
  const { data: contactData, isLoading: contactLoading, error: contactError } = useQuery({
    queryKey: ['/api/contact', slug],
    enabled: !menuLoading && !!menuError, // Only run if menu failed
    retry: false, // Don't retry on 404
  });

  // Show loading while checking menu first
  if (menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Cargando...</div>
      </div>
    );
  }

  // If menu data exists, show menu
  if (menuResponse && (menuResponse as any).menu) {
    return <MenuDemo menuSlug={slug} />;
  }

  // Show loading while checking contact
  if (contactLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Cargando...</div>
      </div>
    );
  }

  // If contact data exists, show contact
  if (contactData) {
    return <ContactPage />;
  }

  // If neither exists, show 404
  return <NotFound />;
}