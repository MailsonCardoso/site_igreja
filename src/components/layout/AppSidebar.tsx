import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CircleDot,
  Calendar,
  Music,
  GraduationCap,
  Settings,
  Cross,
  Menu,
  LogOut,
  ChevronLeft,
  BookOpen,
  Library,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pastoral", href: "/pastor", icon: BookOpen },
  { name: "Séries", href: "/pastor/series", icon: Library },
  { name: "Insights", href: "/pastor/insights", icon: Lightbulb },
  { name: "Membros", href: "/secretaria", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Análise Financeira", href: "/financeiro/analise", icon: BarChart3 },
  { name: "Células", href: "/celulas", icon: CircleDot },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Ministérios", href: "/ministerios", icon: Music },
  { name: "Ensino", href: "/ensino", icon: GraduationCap },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

interface SidebarContentProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  currentPath: string;
}

function SidebarContent({ collapsed = false, onCollapse, currentPath }: SidebarContentProps) {
  const navigate = useNavigate();
  let user = { name: "Usuário", role: "Administrador" };

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Error parsing user in sidebar", e);
  }

  const userRole = user?.role || "Administrador";

  const filteredNavigation = navigationItems.filter(item => {
    const normalizedRole = userRole.toLowerCase();

    if (normalizedRole === "administrador") {
      return true; // Admin vê tudo
    }

    if (normalizedRole === "pastor") {
      // Pastor vê apenas: Dashboard, Agenda, Pastoral, Séries, Insights, Células, Ensino
      return ["Dashboard", "Agenda", "Pastoral", "Séries", "Insights", "Células", "Ensino"].includes(item.name);
    }

    if (normalizedRole === "secretaria" || normalizedRole === "secretária" || normalizedRole === "secretário") {
      // Secretaria não vê Financeiro nem Configurações
      return !["Financeiro", "Análise Financeira", "Configurações"].includes(item.name);
    }

    if (normalizedRole === "financeiro") {
      // Financeiro vê Financeiro e Análise Financeira
      return ["Financeiro", "Análise Financeira"].includes(item.name);
    }

    // Outros papéis
    return ["Dashboard", "Agenda", "Células"].includes(item.name);
  });

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-sidebar-border overflow-hidden">
            <img
              src="/logo_ipr.png"
              alt="Logo IPR"
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback to Icon if image doesn't exist yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-primary');
              }}
            />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-sidebar-foreground"
            >
              IPR Jaguarema
            </motion.span>
          )}
        </Link>
        {onCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
              PC
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name || "Usuário"}</p>
              <p className="truncate text-xs text-sidebar-muted">{user.role || "Papel"}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              navigate("/auth");
            }}
            className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppSidebarProps {
  currentPath: string;
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-10 w-10 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent currentPath={currentPath} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border lg:block"
      >
        <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} currentPath={currentPath} />
      </motion.aside>

      {/* Collapsed expand button */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="fixed left-[80px] top-4 z-50 hidden h-8 w-8 bg-sidebar text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
