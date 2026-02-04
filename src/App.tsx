import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Secretaria from "./pages/Secretaria";
import Financeiro from "./pages/Financeiro";
import Celulas from "./pages/Celulas";
import Agenda from "./pages/Agenda";
import Ministerios from "./pages/Ministerios";
import Ensino from "./pages/Ensino";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/secretaria" element={<Secretaria />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/celulas" element={<Celulas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ministerios" element={<Ministerios />} />
          <Route path="/ensino" element={<Ensino />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
