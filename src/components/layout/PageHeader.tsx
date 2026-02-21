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
import { Fragment, ReactNode, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PastoralStore } from "@/data/pastoral-store";

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  try {
    let cleanStr = dateStr;
    if (cleanStr.includes('Z')) {
      cleanStr = cleanStr.replace('Z', '');
    }
    if (!cleanStr.includes('T') && cleanStr.includes(' ')) {
      cleanStr = cleanStr.replace(' ', 'T');
    }
    return new Date(cleanStr.substring(0, 19));
  } catch (e) {
    return new Date();
  }
};

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  const [readEventIds, setReadEventIds] = useState<number[]>([]);

  // Verificar papel e ID do usuário
  let userRole = "";
  let userId = "";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      const user = JSON.parse(storedUser);
      userRole = user?.role?.toLowerCase() || "";
      userId = user?.id || "default";
    }
  } catch (e) {
    console.error("Error parsing user in header", e);
  }

  const isAllowedToSeeNotifications = ["administrador", "pastor", "secretaria", "secretário", "secretária"].includes(userRole);

  // Carregar IDs lidos do localStorage na inicialização
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`read_events_${userId}`);
      if (stored) {
        setReadEventIds(JSON.parse(stored));
      }
    }
  }, [userId]);

  // Buscar eventos para notificações apenas se permitido
  const { data: eventos = [] } = useQuery({
    queryKey: ["events-notifications"],
    queryFn: () => api.get("/events"),
    refetchInterval: 60000, // Atualiza a cada minuto
    enabled: isAllowedToSeeNotifications
  });

  // Filtrar eventos nos próximos 3 dias
  const urgentEvents = (() => {
    const today = startOfDay(new Date());
    const limitDate = addDays(today, 3);

    // 1. Eventos da Igreja (da API)
    const urgentChurchEvents = (eventos || []).filter((evento: any) => {
      const eventDate = parseLocalDate(evento.start_date);
      return isAfter(eventDate, today) && isBefore(eventDate, limitDate);
    }).map((e: any) => ({
      ...e,
      type: "church",
      sortDate: parseLocalDate(e.start_date),
      displayDate: e.start_date
    }));

    // 2. Agendamentos Pastorais (do LocalStorage/PastoralStore)
    const appointments = PastoralStore.getAppointments();
    const urgentPastoralEvents = appointments.filter((app: any) => {
      const eventDate = new Date(`${app.date}T${app.startTime}`);
      return app.status === "Confirmado" && isAfter(eventDate, today) && isBefore(eventDate, limitDate);
    }).map((a: any) => ({
      ...a,
      id: `pastoral-${a.id}`, // ID único para não colidir com eventos da API
      type: "pastoral",
      sortDate: new Date(`${a.date}T${a.startTime}`),
      displayDate: `${a.date}T${a.startTime}`
    }));

    // Retorna a união ordenada por data
    return [...urgentChurchEvents, ...urgentPastoralEvents].sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  })();

  // Eventos não lidos (que aparecerão no badge)
  const unreadUrgentEvents = urgentEvents.filter((e: any) => !readEventIds.includes(e.id));

  // Função para marcar como lido
  const markAsRead = () => {
    if (unreadUrgentEvents.length > 0) {
      const newReadIds = [...new Set([...readEventIds, ...unreadUrgentEvents.map((e: any) => e.id)])];
      setReadEventIds(newReadIds);
      localStorage.setItem(`read_events_${userId}`, JSON.stringify(newReadIds));
    }
  };

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

        {isAllowedToSeeNotifications && (
          <DropdownMenu onOpenChange={(open) => {
            if (open) markAsRead();
          }}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground outline-none"
              >
                <Bell className="h-5 w-5" />
                {unreadUrgentEvents.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                    {unreadUrgentEvents.length}
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
                      <Link
                        to={evento.type === "pastoral" ? "/pastor/agenda" : "/agenda"}
                        className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            {evento.type === "pastoral" ? (
                              <div className="h-5 w-5 rounded-md bg-indigo-500/10 flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-indigo-600" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-amber-600" />
                              </div>
                            )}
                            <span className="text-xs font-bold text-foreground line-clamp-1">{evento.title}</span>
                          </div>
                          <span className="text-[9px] font-bold uppercase text-primary/60">
                            {format(parseLocalDate(evento.displayDate), "dd/MM")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground ml-7">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(parseLocalDate(evento.displayDate), "HH:mm")}</span>
                          <span className="flex items-center gap-1">
                            {evento.type === "pastoral" ? "Atendimento Pastoral" : format(parseLocalDate(evento.displayDate), "EEEE", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-wider ml-7">
                          {evento.type === "pastoral" ? "Ver Agenda Pastoral" : "Ver na agenda"} <ArrowRight className="h-2 w-2" />
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
        )}
      </div>
    </header>
  );
}
