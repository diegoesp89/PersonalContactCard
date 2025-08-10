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
import ImageManagement from "@/pages/image-management";
import MenuDemo from "@/pages/MenuDemo";
import MenuEditor from "@/pages/MenuEditor";
import MenuManagement from "@/pages/MenuManagement";
import DynamicRoute from "@/pages/DynamicRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/edit" component={AdminPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/image-management" component={ImageManagement} />
      <Route path="/menu-demo" component={MenuDemo} />
      <Route path="/menu-edit" component={MenuManagement} />
      <Route path="/:ruta/stats" component={AnalyticsPage} />
      <Route path="/:slug/edit">
        {(params) => <MenuEditor menuSlug={params.slug} />}
      </Route>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
