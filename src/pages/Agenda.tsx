import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";
import { Plus, Loader2, MapPin, Calendar as CalendarIcon, Clock, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_date: "",
      horario: "19:30",
      color: "#ecb318"
    }
  });

  const { reset, setValue, watch } = form;

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => api.get("/events"),
  });

  // Salvar Evento
  const saveEventMutation = useMutation({
    mutationFn: (data: any) => {
      // Concatenar data e hora para o backend
      const payload = {
        ...data,
        start_date: `${data.start_date} ${data.horario || '00:00'}:00`
      };

      return isEditMode && selectedEvent
        ? api.put(`/events/${selectedEvent.id}`, payload)
        : api.post("/events", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(isEditMode ? "Evento atualizado!" : "Evento agendado!");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => toast.error(error.message || "Erro ao salvar evento"),
  });

  // Excluir Evento
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento removido!");
      setIsDeleteOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Erro ao excluir"),
  });

  const onSubmit = (data: any) => saveEventMutation.mutate(data);

  const handleEdit = (evento: any) => {
    setSelectedEvent(evento);
    setIsEditMode(true);
    const eventDate = new Date(evento.start_date);
    reset({
      title: evento.title || "",
      description: evento.description || "",
      location: evento.location || "",
      start_date: format(eventDate, "yyyy-MM-dd"),
      horario: format(eventDate, "HH:mm"),
      color: evento.color || "#ecb318"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (evento: any) => {
    setSelectedEvent(evento);
    setIsDeleteOpen(true);
  };

  // Get dates that have events for the calendar indicators
  const eventDates = eventos.map((e: any) => new Date(e.start_date));

  // Filter events for the selected day
  const dayEvents = eventos.filter((e: any) => {
    if (!date) return false;
    const ed = new Date(e.start_date);
    return ed.toDateString() === date.toDateString();
  });

  // Remaining events (upcoming)
  const upcomingEvents = eventos
    .filter((e: any) => new Date(e.start_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <MainLayout title="Agenda" breadcrumbs={[{ label: "Eventos" }]}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Agenda da Igreja</h2>
          <p className="text-muted-foreground">Gerencie cultos, reuniões e eventos especiais</p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            reset({
              title: "",
              description: "",
              location: "",
              start_date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
              horario: "19:30",
              color: "#ecb318"
            });
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 h-11 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Novo Evento</span>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Calendar Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="rounded-[2rem] bg-card p-8 shadow-xl border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Calendário de Atividades</h2>
            </div>

            <div className="flex justify-center bg-secondary/5 rounded-3xl p-6 border border-secondary/10">
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
                  className="rounded-xl border-none"
                  modifiers={{ hasEvent: eventDates }}
                  components={{
                    DayContent: ({ date: dayDate }) => {
                      const hasEvent = eventDates.some(
                        (ed: Date) => ed.toDateString() === dayDate.toDateString()
                      );
                      return (
                        <div className="relative flex items-center justify-center w-full h-full">
                          {dayDate.getDate()}
                          {hasEvent && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-sm shadow-primary/50" />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Events for selected day */}
          <div className="rounded-[2rem] bg-card p-8 shadow-xl border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                  {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Eventos do Dia"}
                </h3>
              </div>
              <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-bold">
                {dayEvents.length} {dayEvents.length === 1 ? 'Evento' : 'Eventos'}
              </Badge>
            </div>

            <div className="grid gap-4">
              {dayEvents.length === 0 ? (
                <div className="text-center py-12 bg-secondary/5 rounded-3xl border border-dashed border-secondary/20">
                  <p className="text-muted-foreground font-medium italic">Nenhum evento para este dia.</p>
                </div>
              ) : (
                dayEvents.map((evento: any) => (
                  <div key={evento.id} className="group relative flex items-center justify-between p-5 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-primary/10" style={{ backgroundColor: evento.color || '#ecb318' }}>
                        <span className="text-xs font-black uppercase opacity-80">{format(new Date(evento.start_date), "MMM", { locale: ptBR })}</span>
                        <span className="text-lg font-black leading-none">{format(new Date(evento.start_date), "dd")}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground leading-tight mb-1">{evento.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(evento.start_date), "HH:mm")}h</span>
                          {evento.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {evento.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(evento)} className="rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(evento)} className="rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Column: Upcoming */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="rounded-[2rem] bg-sidebar p-8 shadow-xl border border-primary/5 h-full">
            <h2 className="text-xl font-black text-sidebar-foreground uppercase tracking-tight mb-8">Destaques</h2>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-center text-sidebar-foreground/60 italic text-sm">Sem eventos futuros.</p>
              ) : (
                upcomingEvents.slice(0, 4).map((evento: any) => (
                  <div key={evento.id} className="bg-background/40 backdrop-blur-sm p-5 rounded-3xl border border-white/10 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setDate(new Date(evento.start_date))}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase tracking-widest">{format(new Date(evento.start_date), "EEEE", { locale: ptBR })}</Badge>
                      <span className="text-[10px] font-bold text-sidebar-foreground/50">{format(new Date(evento.start_date), "dd 'de' MMM", { locale: ptBR })}</span>
                    </div>
                    <h4 className="font-bold text-sidebar-foreground group-hover:text-primary transition-colors">{evento.title}</h4>
                    <p className="text-xs text-sidebar-foreground/60 mt-1 line-clamp-1">{evento.location || "Local não informado"}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-10 p-6 rounded-3xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-sidebar-foreground/80 leading-relaxed">
                Mantenha a agenda sempre atualizada para que todos os membros possam acompanhar as atividades da nossa comunidade.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[750px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-6 border-b relative">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                {isEditMode ? <Pencil className="h-7 w-7 text-primary" /> : <CalendarIcon className="h-7 w-7 text-primary" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground">
                  {isEditMode ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-xs">
                  Planeje e organize as atividades da igreja.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título do Evento</Label>
                  <Input
                    {...form.register("title", { required: true })}
                    placeholder="Ex: Culto de Celebração"
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-bold transition-all focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data</Label>
                    <Input
                      type="date"
                      {...form.register("start_date", { required: true })}
                      className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horário</Label>
                    <Input
                      type="time"
                      {...form.register("horario")}
                      className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Local</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="Ex: Templo Principal"
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição (Opcional)</Label>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Detalhes sobre o evento..."
                    className="rounded-xl border-secondary/30 bg-secondary/5 min-h-[110px] font-medium text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cor de Identificação</Label>
                  <div className="flex gap-2.5">
                    {["#ecb318", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValue("color", c)}
                        className={`h-9 w-9 rounded-xl border-4 transition-all ${watch("color") === c ? 'border-primary shadow-lg scale-110' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-11 rounded-xl font-bold">Cancelar</Button>
              <Button type="submit" disabled={saveEventMutation.isPending} className="flex-1 h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                {saveEventMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> {isEditMode ? "Atualizar" : "Agendar"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Remover Eventos</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir o evento <strong>{selectedEvent?.title}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold">Manter Evento</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedEvent && deleteEventMutation.mutate(selectedEvent.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

