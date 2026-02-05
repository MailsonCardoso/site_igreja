import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.get("/events"),
  });

  // Get dates that have events
  const eventDates = eventos.map((e: any) => new Date(e.start_date || e.data));

  return (
    <MainLayout title="Agenda" breadcrumbs={[{ label: "Eventos" }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Calendário</h2>
          <div className="flex justify-center">
            {isLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-xl"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    position: 'relative',
                  },
                }}
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const hasEvent = eventDates.some(
                      (ed: Date) => ed.toDateString() === dayDate.toDateString()
                    );
                    return (
                      <div className="relative flex items-center justify-center">
                        {dayDate.getDate()}
                        {hasEvent && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Próximos Eventos</h2>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento agendado.</p>
            ) : (
              eventos.slice(0, 5).map((evento: any, index: number) => {
                const eventDate = new Date(evento.start_date || evento.data);
                const day = format(eventDate, "dd", { locale: ptBR });
                const month = format(eventDate, "MMM", { locale: ptBR }).toUpperCase();

                return (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
                    className="flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
                      <span className="text-lg font-bold text-primary">{day}</span>
                      <span className="text-[10px] font-medium uppercase">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{evento.title || evento.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{evento.horario || format(eventDate, "HH:mm")}</p>
                      <p className="text-xs text-muted-foreground truncate">{evento.location || evento.local}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

