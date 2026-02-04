import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { PageHeader } from "./PageHeader";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function MainLayout({ children, title, breadcrumbs }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        
        <main className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
