import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { PageHeader } from "./PageHeader";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function MainLayout({ children, title, breadcrumbs, actions }: MainLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar currentPath={currentPath} />

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />

        <main className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
