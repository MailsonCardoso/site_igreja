import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    CheckCircle2,
    MessageSquare,
    Search,
    ChevronRight,
    ClipboardList,
    AlertCircle,
    UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PastoralStore, PastoralAppointment, AppointmentRequest } from "@/data/pastoral-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import { Check, ChevronsUpDown } from "lucide-react";

export default function AgendaPastoral() {
    // Estados de Dados (Via API agora)
    // const [appointments, setAppointments] = useState<PastoralAppointment[]>([]); // Removido local state inicial
    // const [requests, setRequests] = useState<AppointmentRequest[]>([]); // Removido local state inicial
    const [searchTerm, setSearchTerm] = useState("");

    const queryClient = useQueryClient();

    // Fetch Data do Backend
    const { data: pastoralData, isLoading } = useQuery({
        queryKey: ["pastoral-data"],
        queryFn: async () => {
            const response = await api.get("/pastoral");
            // Mapping Snake Case (Backend) -> Camel Case (Frontend)
            return {
                appointments: response.appointments.map((a: any) => ({
                    ...a,
                    memberId: a.member_id,
                    startTime: a.start_time,
                    endTime: a.end_time
                })),
                requests: response.requests.map((r: any) => ({
                    ...r,
                    memberId: r.member_id,
                    requestedAt: r.requested_at
                }))
            };
        }
    });

    const appointments = (pastoralData?.appointments || []) as PastoralAppointment[];
    const requests = (pastoralData?.requests || []) as AppointmentRequest[];

    // Estados do Modal
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<PastoralAppointment | null>(null);
    const [viewingAppointment, setViewingAppointment] = useState<PastoralAppointment | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);

    // Role Check
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isSecretary = ["secretaria", "secretária", "secretário"].includes(user.role?.toLowerCase());


    // Estado do Form
    const [formData, setFormData] = useState<Partial<PastoralAppointment>>({
        type: "Gabinete",
        title: "",
        person: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "",
        endTime: "",
        location: "Gabinete Pastoral",
        notes: "",
        status: "Confirmado"
    });

    // Autocomplete State
    const [openMemberSearch, setOpenMemberSearch] = useState(false);

    // Fetch Membros para Autocomplete
    const { data: members = [] } = useQuery({
        queryKey: ["members"],
        queryFn: () => api.get("/members"),
    });

    // Mutations
    const createAppointmentMutation = useMutation({
        mutationFn: (data: any) => api.post("/pastoral/appointments", {
            ...data,
            member_id: data.memberId,
            start_time: data.startTime,
            end_time: data.endTime
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastoral-data"] });
            toast.success("Agendamento criado com sucesso!");
            setIsSheetOpen(false);
        },
        onError: () => toast.error("Erro ao criar agendamento.")
    });

    const updateAppointmentMutation = useMutation({
        mutationFn: (data: any) => api.put(`/pastoral/appointments/${data.id}`, {
            ...data,
            member_id: data.memberId,
            start_time: data.startTime,
            end_time: data.endTime
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastoral-data"] });
            toast.success("Agendamento atualizado!");
            setIsSheetOpen(false);
        }
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/pastoral/appointments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastoral-data"] });
            toast.success("Agendamento removido.");
            setIsDeleteDialogOpen(false);
        }
    });

    const createRequestMutation = useMutation({
        mutationFn: (data: any) => api.post("/pastoral/requests", {
            ...data,
            member_id: data.memberId
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastoral-data"] });
            toast.success("Solicitação enviada para o Pastor!");
            setIsSheetOpen(false);
        }
    });

    const deleteRequestMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/pastoral/requests/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pastoral-data"] });
        }
    });

    const handleOpenCreate = () => {
        setEditingAppointment(null);
        setSelectedRequest(null);
        setFormData({
            type: "Gabinete",
            title: "",
            person: "",
            date: format(new Date(), "yyyy-MM-dd"),
            startTime: "",
            endTime: "",
            location: "Gabinete Pastoral",
            notes: "",
            status: "Confirmado"
        });
        setIsSheetOpen(true);
    };

    const handleEdit = (appointment: PastoralAppointment) => {
        setEditingAppointment(appointment);
        setSelectedRequest(null);
        setFormData(appointment);
        setIsSheetOpen(true);
    };

    const handleScheduleRequest = (request: AppointmentRequest) => {
        setSelectedRequest(request);
        setEditingAppointment(null);
        setViewingAppointment(null);
        setFormData({
            type: request.type,
            title: `Atendimento: ${request.reason}`,
            person: request.person,
            memberId: request.memberId,
            date: format(new Date(), "yyyy-MM-dd"),
            startTime: "",
            endTime: "",
            location: request.type === "Gabinete" ? "Gabinete Pastoral" : "Residência do Membro",
            notes: "",
            status: "Confirmado"
        });
        setIsSheetOpen(true);
    };

    const handleView = (appointment: PastoralAppointment) => {
        setViewingAppointment(appointment);
        setIsViewSheetOpen(true);
    };

    const handleToggleStatus = (appointment: PastoralAppointment) => {
        const newStatus = appointment.status === "Realizado" ? "Confirmado" : "Realizado";
        updateAppointmentMutation.mutate({ ...appointment, status: newStatus });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSecretary) {
            if (!formData.title || !formData.person) {
                toast.error("Por favor, preencha os campos obrigatórios.");
                return;
            }
        } else {
            if (!formData.title || !formData.person || !formData.date || !formData.startTime) {
                toast.error("Por favor, preencha os campos obrigatórios.");
                return;
            }

            // Validação de conflito de horário (mesma data e mesmo horário de início)
            const hasConflict = appointments.some(app => {
                // Se estiver editando, ignora o próprio agendamento na verificação
                if (editingAppointment && app.id === editingAppointment.id) return false;

                // Normalizando horários para comparar apenas HH:mm
                const appTime = app.startTime.substring(0, 5);
                const formTime = (formData.startTime || "").substring(0, 5);

                return app.date === formData.date && appTime === formTime;
            });

            if (hasConflict) {
                toast.error("Horário Indisponível", {
                    description: `Já existe um compromisso agendado para o dia ${format(new Date(formData.date + 'T00:00:00'), "dd/MM/yyyy")} às ${formData.startTime}.`
                });
                return;
            }
        }

        if (editingAppointment) {
            // Update
            updateAppointmentMutation.mutate({ ...formData, id: editingAppointment.id });
        } else {
            // Se for secretaria, cria uma SOLICITAÇÃO (Request)
            if (isSecretary) {
                createRequestMutation.mutate({
                    person: formData.person || "Anônimo",
                    type: formData.type,
                    reason: formData.title || "Sem motivo especifico",
                    memberId: formData.memberId
                });
            } else {
                // Pastor cria agendamento direto
                createAppointmentMutation.mutate(formData);

                // Se veio de uma solicitação, removemos a solicitação do backend também
                if (selectedRequest) {
                    deleteRequestMutation.mutate(selectedRequest.id);
                }
            }
        }
    };

    const handleDeleteClick = (id: number) => {
        setAppointmentToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (appointmentToDelete) {
            deleteAppointmentMutation.mutate(appointmentToDelete);
        }
    };

    // Filtragem de agendamentos por hoje/futuro e busca
    const now = new Date();
    const filteredAppointments = appointments
        .filter(a => {
            const matchesSearch = a.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.title.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtrar apenas compromissos futuros ou de hoje
            const appointmentDateTime = new Date(`${a.date}T${a.startTime || '00:00'}`);
            const isFutureOrToday = appointmentDateTime >= new Date(now.getFullYear(), now.getMonth(), now.getDate());

            return matchesSearch && isFutureOrToday;
        })
        .sort((a, b) => {
            // Ordenar por proximidade (mais próximo primeiro)
            const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`);
            return dateA.getTime() - dateB.getTime(); // Ordem CRESCENTE (mais próximo primeiro)
        });

    return (
        <MainLayout title="Agenda Pastoral" breadcrumbs={[{ label: "Pastoral", href: "/pastor" }, { label: "Agenda" }]}>
            <div className="flex flex-col gap-8">
                {/* Header com Ações */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Controle de Agendamentos</h1>
                        <p className="text-muted-foreground">Gerencie seus aconselhamentos, visitas e compromissos ministeriais.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 transition-all active:scale-95">
                        <Plus className="h-5 w-5" />
                        <span className="font-bold uppercase tracking-tight">{isSecretary ? "Nova Solicitação" : "Novo Agendamento"}</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LADO ESQUERDO: Solicitações Pendentes (4 colunas) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                Solicitações Pendentes
                            </h2>
                            <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none font-bold">
                                {requests.length}
                            </Badge>
                        </div>

                        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                                        <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <p className="text-sm font-medium text-muted-foreground">Nenhuma solicitação pendente.</p>
                                    </div>
                                ) : (
                                    requests.map((request) => (
                                        <Card key={request.id} className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[1.5rem] bg-card/50 backdrop-blur-sm border-l-4 border-l-primary/30 hover:border-l-primary">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {request.person.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm text-foreground">{request.person}</h3>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{request.type}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-bold border-muted-foreground/20">
                                                        {format(new Date(request.requestedAt), "dd MMM", { locale: ptBR })}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">
                                                    "{request.reason}"
                                                </p>
                                                <Button
                                                    onClick={() => handleScheduleRequest(request)}
                                                    disabled={isSecretary} // Secretaria não pode agendar, só o pastor
                                                    className="w-full h-9 rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold text-xs uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSecretary ? "Aguardando Pastor" : "Agendar no Calendário"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* LADO DIREITO: Timeline/Agenda (8 colunas) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Agenda e Compromissos
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar na agenda..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 rounded-full bg-card border-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredAppointments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-border/50 text-center">
                                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                                        <Calendar className="h-10 w-10 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Agenda Vazia</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">Você não possui compromissos agendados para este período ou com este termo de busca.</p>
                                </div>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <Card key={app.id} className={cn(
                                        "group overflow-hidden border-none shadow-md hover:shadow-lg transition-all rounded-[2rem] bg-card",
                                        app.status === "Realizado" && "opacity-60 grayscale-[0.3]"
                                    )}>
                                        <CardContent className="p-0 flex flex-col md:flex-row cursor-pointer" onClick={() => handleView(app)}>
                                            {/* Faixa lateral de horario */}
                                            <div className={cn(
                                                "md:w-32 p-4 md:p-6 flex md:flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-border/50",
                                                app.type === "Gabinete" ? "bg-indigo-500/5" : "bg-amber-500/5"
                                            )}>
                                                <span className="text-xs font-bold text-muted-foreground uppercase">{format(new Date(app.date), "EEE", { locale: ptBR })}</span>
                                                <span className="text-2xl font-black text-foreground">{format(new Date(app.date), "dd")}</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                    <Clock className="h-3 w-3" />
                                                    {app.startTime}
                                                </div>
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={cn(
                                                            "rounded-full px-3 font-bold text-[10px] uppercase",
                                                            app.type === "Gabinete" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        )}>
                                                            {app.type}
                                                        </Badge>
                                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 italic">
                                                            <MapPin className="h-3 w-3" />
                                                            {app.location}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-foreground leading-tight">{app.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                        <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-foreground">
                                                            {app.person.charAt(0)}
                                                        </div>
                                                        {app.person}
                                                    </div>
                                                </div>

                                                {!isSecretary && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(app); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                            disabled={app.status === "Realizado"}
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(app.id); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                        <div className="h-8 w-[1px] bg-border/50 mx-2 hidden sm:block" />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(app); }}
                                                            className={cn(
                                                                "h-10 w-10 rounded-xl transition-all",
                                                                app.status === "Realizado"
                                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                                    : "hover:bg-green-500/10 hover:text-green-600"
                                                            )}
                                                            title={app.status === "Realizado" ? "Reabrir Atendimento" : "Marcar como Realizado"}
                                                        >
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sheet Lateral - Padrão Novo */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] w-full h-full p-0 overflow-hidden border-none shadow-2xl flex flex-col">
                    <div className="p-6 bg-primary/5 flex items-center gap-4 border-b shrink-0">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold text-foreground">
                                {editingAppointment ? "Editar Agendamento" : (isSecretary ? "Nova Solicitação de Atendimento" : "Novo Agendamento")}
                            </SheetTitle>
                            <SheetDescription className="text-xs font-bold text-primary">
                                {selectedRequest ? `Finalizando solicitação de ${selectedRequest.person}` : "Preencha os dados do compromisso."}
                            </SheetDescription>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <form onSubmit={handleSave} className="p-6 space-y-6 bg-card">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Tipo de Agendamento</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Gabinete" className="font-semibold">Gabinete Pastoral</SelectItem>
                                            <SelectItem value="Visita" className="font-semibold">Visita Domiciliar / Hospitalar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Assunto / Título</Label>
                                    <div className="relative">
                                        <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Aconselhamento sobre família"
                                            className="h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Pessoa / Membro</Label>

                                    <Popover open={openMemberSearch} onOpenChange={setOpenMemberSearch}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openMemberSearch}
                                                className="w-full h-12 justify-between rounded-xl bg-secondary/5 font-semibold border-secondary/30 px-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {formData.person || "Buscar membro..."}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[450px] p-0 rounded-xl shadow-2xl border-none">
                                            <Command className="rounded-xl">
                                                <CommandInput placeholder="Digite o nome do membro..." className="h-12 font-semibold" />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {members.map((member: any) => (
                                                            <CommandItem
                                                                key={member.id}
                                                                value={member.name}
                                                                onSelect={(currentValue) => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        person: currentValue,
                                                                        memberId: member.id
                                                                    });
                                                                    setOpenMemberSearch(false);
                                                                }}
                                                                className="h-12 font-medium"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.person === member.name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {member.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {!isSecretary && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Data</Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Início</Label>
                                                <Input
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Fim</Label>
                                                <Input
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Localização</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Ex: Gabinete / Rua Tal, 123"
                                            className="h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-1">Notas / Observações</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Detalhes importantes para o atendimento..."
                                        className="min-h-[100px] rounded-xl bg-secondary/5 font-medium border-secondary/30 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 gap-3 flex shrink-0">
                                <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)} className="flex-1 font-bold h-12 rounded-xl border-secondary/20 hover:bg-secondary/10">
                                    CANCELAR
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] font-bold h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20"
                                >
                                    {editingAppointment ? "SALVAR ALTERAÇÕES" : (isSecretary ? "ENVIAR SOLICITAÇÃO" : "CONFIRMAR AGENDAMENTO")}
                                </Button>
                            </div>
                        </form>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Sheet de Visualização */}
            <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] w-full h-full p-0 overflow-hidden border-none shadow-2xl flex flex-col">
                    {viewingAppointment && (
                        <>
                            <div className={cn(
                                "p-8 flex flex-col gap-4 shrink-0",
                                viewingAppointment.type === "Gabinete" ? "bg-indigo-500/10" : "bg-amber-500/10"
                            )}>
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center text-white",
                                        viewingAppointment.type === "Gabinete" ? "bg-indigo-500" : "bg-amber-500"
                                    )}>
                                        <Calendar className="h-7 w-7" />
                                    </div>
                                    <Badge className={cn(
                                        "rounded-full px-4 py-1 font-bold text-xs uppercase",
                                        viewingAppointment.status === "Realizado" ? "bg-green-500 text-white" : "bg-primary text-white"
                                    )}>
                                        {viewingAppointment.status}
                                    </Badge>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground">{viewingAppointment.title}</h2>
                                    <p className="font-bold text-primary flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {viewingAppointment.person}
                                    </p>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] items-center gap-1 uppercase font-bold text-muted-foreground flex tracking-wider">
                                                <Calendar className="h-3 w-3" /> Data
                                            </p>
                                            <p className="font-bold text-foreground">
                                                {format(new Date(viewingAppointment.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] items-center gap-1 uppercase font-bold text-muted-foreground flex tracking-wider">
                                                <Clock className="h-3 w-3" /> Horário
                                            </p>
                                            <p className="font-bold text-foreground">
                                                {viewingAppointment.startTime} {viewingAppointment.endTime && `às ${viewingAppointment.endTime}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] items-center gap-1 uppercase font-bold text-muted-foreground flex tracking-wider">
                                            <MapPin className="h-3 w-3" /> Localização
                                        </p>
                                        <p className="font-bold text-foreground">
                                            {viewingAppointment.location}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] items-center gap-1 uppercase font-bold text-muted-foreground flex tracking-wider">
                                            <ClipboardList className="h-3 w-3" /> Tipo
                                        </p>
                                        <p className="font-bold text-foreground">
                                            {viewingAppointment.type === "Gabinete" ? "Gabinete Pastoral" : "Visita Domiciliar / Hospitalar"}
                                        </p>
                                    </div>

                                    <div className="bg-muted/30 p-6 rounded-3xl space-y-3">
                                        <p className="text-[10px] items-center gap-1 uppercase font-bold text-muted-foreground flex tracking-wider">
                                            <MessageSquare className="h-3 w-3" /> Notas e Observações
                                        </p>
                                        <p className="text-sm font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {viewingAppointment.notes || "Nenhuma observação registrada."}
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-tight gap-2"
                                            onClick={() => setIsViewSheetOpen(false)}
                                        >
                                            FECHAR
                                        </Button>
                                        {viewingAppointment.status !== "Realizado" && (
                                            <Button
                                                className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-tight gap-2 bg-primary hover:bg-primary/90"
                                                onClick={() => {
                                                    setIsViewSheetOpen(false);
                                                    handleEdit(viewingAppointment);
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                EDITAR
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Modal de Confirmação de Exclusão */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-muted-foreground">
                            Tem certeza que deseja excluir este agendamento? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold h-11 border-secondary/20">
                            CANCELAR
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-xl font-bold h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            EXCLUIR AGENDAMENTO
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayout>
    );
}
