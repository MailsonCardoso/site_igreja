import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Secretaria from "./pages/Secretaria";
import Financeiro from "./pages/Financeiro";
import AnaliseFinanceira from "./pages/AnaliseFinanceira";
import Celulas from "./pages/Celulas";
import Agenda from "./pages/Agenda";
import Ministerios from "./pages/Ministerios";
import Ensino from "./pages/Ensino";
import Configuracoes from "./pages/Configuracoes";
import Altar from "./pages/pastor/Altar";
import Pulpito from "./pages/pastor/Pulpito";
import Series from "./pages/pastor/Series";
import Insights from "./pages/pastor/Insights";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const token = localStorage.getItem("auth_token");
  let user = { role: "Administrador" };

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Error parsing user", e);
  }

  const userRole = user?.role || "Administrador";

  if (!token) return <Navigate to="/auth" replace />;

  const normalizedUserRole = String(userRole).toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

  const hasAccess = normalizedAllowedRoles.some(role => {
    if (role === "secretaria") {
      return ["secretaria", "secretária", "secretário"].includes(normalizedUserRole);
    }
    return role === normalizedUserRole;
  });

  if (hasAccess) {
    return <>{children}</>;
  }

  if (normalizedUserRole === "financeiro") return <Navigate to="/financeiro" replace />;
  return <Navigate to="/" replace />;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />

          {/* Telas que todos (exceto Financeiro puro) podem ver ou que têm filtro interno */}
          <Route path="/" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria", "Lider de pequeno grupo"]}>
              <Dashboard />
            </RoleRoute>
          } />

          {/* Módulo Pastoral */}
          <Route path="/pastor" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor"]}>
              <Altar />
            </RoleRoute>
          } />

          <Route path="/pastor/pulpito/:id" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor"]}>
              <Pulpito />
            </RoleRoute>
          } />

          <Route path="/pastor/series" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor"]}>
              <Series />
            </RoleRoute>
          } />

          <Route path="/pastor/insights" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor"]}>
              <Insights />
            </RoleRoute>
          } />

          {/* Secretaria e Admins */}
          <Route path="/secretaria" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria"]}>
              <Secretaria />
            </RoleRoute>
          } />

          {/* Financeiro e Admins */}
          <Route path="/financeiro" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Financeiro"]}>
              <Financeiro />
            </RoleRoute>
          } />

          <Route path="/financeiro/analise" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Financeiro"]}>
              <AnaliseFinanceira />
            </RoleRoute>
          } />

          {/* Outras telas operacionais */}
          <Route path="/celulas" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria", "Lider de pequeno grupo"]}>
              <Celulas />
            </RoleRoute>
          } />
          <Route path="/agenda" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria", "Lider de pequeno grupo"]}>
              <Agenda />
            </RoleRoute>
          } />
          <Route path="/ministerios" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria"]}>
              <Ministerios />
            </RoleRoute>
          } />
          <Route path="/ensino" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor", "Secretaria"]}>
              <Ensino />
            </RoleRoute>
          } />

          {/* Somente Admin e Pastor */}
          <Route path="/configuracoes" element={
            <RoleRoute allowedRoles={["Administrador", "Pastor"]}>
              <Configuracoes />
            </RoleRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
