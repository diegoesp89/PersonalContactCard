import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import ContactPage from "@/pages/contact";
import AdminPage from "@/pages/admin";
import AnalyticsPage from "@/pages/analytics";
import GalleryPage from "@/pages/GalleryPage";
import NotFound from "@/pages/not-found";
import ImageManagement from "@/pages/image-management";
import MenuDemo from "@/pages/MenuDemo";
import MenuEditor from "@/pages/MenuEditor";
import MenuManagement from "@/pages/MenuManagement";
import DynamicRoute from "@/pages/DynamicRoute";

function GlobalBlockOverlay() {
  const [location] = useLocation();

  const { data } = useQuery({
    queryKey: ["/api/system/global-block"],
    queryFn: async () => {
      const res = await fetch("/api/system/global-block");
      return res.json() as Promise<{ blocked: boolean }>;
    },
    refetchInterval: 10000,
  });

  const isAdminRoute = location === "/edit" || location.startsWith("/edit");

  if (!data?.blocked || isAdminRoute) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950"
    >
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-100">
            Hubo un problema
          </h1>
          <p className="text-slate-300 text-lg">
            Contacte con el administrador.
          </p>
          <div className="inline-block bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
            <span className="text-red-400 font-mono text-sm font-semibold">
              Error Código: HTTP 402 Payment Required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/edit" component={AdminPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/image-management" component={ImageManagement} />
      <Route path="/menu-demo" component={MenuDemo} />
      <Route path="/menu-edit" component={MenuManagement} />
      {/* More specific routes should come first */}
      <Route path="/:ruta/stats" component={AnalyticsPage} />
      <Route path="/:slug/edit">
        {(params) => <MenuEditor menuSlug={params.slug} />}
      </Route>
      {/* Generic dynamic route should be last */}
      <Route path="/:slug">
        {(params) => <DynamicRoute slug={params.slug} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <GlobalBlockOverlay />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
