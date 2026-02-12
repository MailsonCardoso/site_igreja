import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { PageHeader } from "./PageHeader";
import { useSidebar } from "@/contexts/SidebarContext";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function MainLayout({ children, title, breadcrumbs, actions }: MainLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { collapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar currentPath={currentPath} />

      {/* Main Content com padding dinâmico */}
      <motion.div
        initial={false}
        animate={{
          paddingLeft: isDesktop ? (collapsed ? 72 : 256) : 0
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="min-h-screen"
      >
        <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />

        <main className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
