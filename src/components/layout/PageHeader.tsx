import { Bell, Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Fragment, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  // Buscar eventos para notificações
  const { data: eventos = [] } = useQuery({
    queryKey: ["events-notifications"],
    queryFn: () => api.get("/events"),
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  // Filtrar eventos nos próximos 3 dias
  const urgentEvents = eventos.filter((evento: any) => {
    const eventDate = new Date(evento.start_date);
    const today = startOfDay(new Date());
    const limitDate = addDays(today, 3);

    // Evento é entre agora e 3 dias no futuro
    return isAfter(eventDate, today) && isBefore(eventDate, limitDate);
  }).sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 lg:px-8">
      <div className="flex flex-col gap-0.5 pl-12 lg:pl-0">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-foreground text-xs">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={index}>
                  <BreadcrumbSeparator className="text-xs" />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href} className="text-muted-foreground hover:text-foreground text-xs">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-xs">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="mr-2">{actions}</div>}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground outline-none"
            >
              <Bell className="h-5 w-5" />
              {urgentEvents.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  {urgentEvents.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-2xl border-primary/10">
            <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
              <span className="font-bold text-sm tracking-tight">Notificações</span>
              {urgentEvents.length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {urgentEvents.length} PRÓXIMOS
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[350px] overflow-y-auto">
              {urgentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">Tudo tranquilo por enquanto.</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Não há eventos nos próximos 3 dias.</p>
                </div>
              ) : (
                urgentEvents.map((evento: any) => (
                  <DropdownMenuItem key={evento.id} asChild>
                    <Link to="/agenda" className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-bold text-foreground line-clamp-1">{evento.title}</span>
                        <span className="text-[9px] font-bold uppercase text-primary/60">
                          {format(new Date(evento.start_date), "dd/MM")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(evento.start_date), "HH:mm")}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(evento.start_date), "EEEE", { locale: ptBR })}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-wider">
                        Ver na agenda <ArrowRight className="h-2 w-2" />
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {urgentEvents.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/agenda" className="w-full flex justify-center py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Ver agenda completa
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
