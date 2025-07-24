import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import ContactPage from "@/pages/contact";
import AdminPage from "@/pages/admin";
import AnalyticsPage from "@/pages/analytics";
import GalleryPage from "@/pages/GalleryPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/edit" component={AdminPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/:ruta/stats" component={AnalyticsPage} />
      <Route path="/:ruta" component={ContactPage} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
