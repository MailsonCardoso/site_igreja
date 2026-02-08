import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Loader2, User, Phone, MapPin, Church, Users, Trash2, UserMinus, UserCheck, Check } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";

type MemberStatus = "membro" | "congregado" | "visitante" | "afastado";

const statusStyles: Record<string, string> = {
  membro: "bg-success/10 text-success border-success/20",
  congregado: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  visitante: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  afastado: "bg-muted text-muted-foreground border-muted",
  ativo: "bg-success/10 text-success border-success/20",
  inativo: "bg-muted text-muted-foreground border-muted",
  disciplina: "bg-destructive/10 text-destructive border-destructive/20",
};

// Helper mask functions
const maskCPF = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
};

const maskPhone = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

const maskCEP = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

export default function Secretaria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      birth_date: "",
      sex: "",
      marital_status: "",
      cpf: "",
      phone: "",
      email: "",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "",
      status: "visitante",
      baptism_date: "",
      role: "Membro",
      origin_church: "",
      father_name: "",
      mother_name: "",
      father_id: "",
      mother_id: "",
      spouse_id: "",
      cell_id: "",
    },
  });

  const { watch, setValue, reset } = form;
  const statusValue = watch("status");
  const maritalStatusValue = watch("marital_status");
  const cepValue = watch("cep");

  // Fetch Members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
  });

  // Fetch Cells
  const { data: cells = [] } = useQuery({
    queryKey: ["cells"],
    queryFn: () => api.get("/cells"),
  });

  // Watch for CEP changes to auto-fill address
  useEffect(() => {
    const cleanCEP = cepValue?.replace(/\D/g, "");
    if (cleanCEP?.length === 8) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setValue("logradouro", data.logradouro);
            setValue("bairro", data.bairro);
            setValue("cidade", data.localidade);
            setValue("uf", data.uf);
          }
        } catch (error) {
          console.error("Erro ao buscar CEP", error);
        }
      };
      fetchAddress();
    }
  }, [cepValue, setValue]);

  // Create Member Mutation
  const createMemberMutation = useMutation({
    mutationFn: (newMember: any) => api.post("/members", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Membro cadastrado com sucesso!");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar membro");
    },
  });

  // Update Member Mutation
  const updateMemberMutation = useMutation({
    mutationFn: (data: any) => api.put(`/members/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Membro atualizado com sucesso!");
      setIsDialogOpen(false);
      reset();
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar membro");
    },
  });

  // Delete Member Mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Membro excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir membro");
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) => api.put(`/members/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Status atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      category: data.status === "membro" ? "membro" : "visitante",
      baptism_date: data.status === "membro" ? data.baptism_date : null,
      cell_id: data.cell_id === "none" || !data.cell_id ? null : data.cell_id,
    };

    if (isEditMode && selectedMember) {
      updateMemberMutation.mutate({ ...processedData, id: selectedMember.id });
    } else {
      createMemberMutation.mutate(processedData);
    }
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsEditMode(true);
    reset({
      name: member.name || "",
      birth_date: member.birth_date ? member.birth_date.split('T')[0] : "",
      sex: member.sex || "",
      marital_status: member.marital_status || "",
      cpf: member.cpf || "",
      phone: member.phone || "",
      email: member.email || "",
      cep: member.cep || "",
      logradouro: member.logradouro || "",
      bairro: member.bairro || "",
      cidade: member.cidade || "",
      uf: member.uf || "",
      status: member.status || "visitante",
      baptism_date: member.baptism_date ? member.baptism_date.split('T')[0] : "",
      role: member.role || "Membro",
      origin_church: member.origin_church || "",
      father_name: member.father_name || "",
      mother_name: member.mother_name || "",
      father_id: member.father_id?.toString() || "",
      mother_id: member.mother_id?.toString() || "",
      spouse_id: member.spouse_id?.toString() || "",
      cell_id: member.cell_id?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (member: any) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = (member: any) => {
    const newStatus = member.status === "afastado" ? "membro" : "afastado";
    toggleStatusMutation.mutate({ id: member.id, status: newStatus });
  };

  const handleDeleteClick = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      deleteMemberMutation.mutate(selectedMember.id);
    }
  };

  const filteredMembros = members.filter((membro: any) => {
    const name = membro.name || membro.nome || "";
    const status = membro.status || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Membros" breadcrumbs={[{ label: "Membros" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-card p-6 shadow-card"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Membros</h2>
            <p className="text-sm text-muted-foreground">{filteredMembros.length} pessoas encontradas</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsEditMode(false);
              setSelectedMember(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                setIsEditMode(false);
                reset();
              }}>
                <Plus className="h-4 w-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[95vw] lg:max-w-[1400px] max-h-[92vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
              <div className="bg-primary/5 p-7 border-b relative flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
                      {isEditMode ? "Editar Membro" : "Novo Membro"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs mt-0.5 uppercase tracking-widest">
                      {isEditMode ? "Gestão Completa de Perfil" : "Cadastro Ministerial e Social"}
                    </DialogDescription>
                  </div>
                </div>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 bg-card">
                <ScrollArea className="flex-1">
                  <div className="p-10 space-y-12">
                    {/* Main Grid: 4 Columns */}
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                      {/* Col 1: Identidade */}
                      <div className="space-y-6">
                        <header className="flex items-center gap-2 border-b border-border/40 pb-3">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Identidade</h3>
                        </header>

                        <div className="space-y-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                            <Input id="name" {...form.register("name", { required: true })} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold focus:bg-background shadow-inner" placeholder="Nome do membro" />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="birth_date" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nascimento</Label>
                            <Input id="birth_date" type="date" {...form.register("birth_date")} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold focus:bg-background shadow-inner" />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="cpf" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CPF</Label>
                            <Input id="cpf" {...form.register("cpf")} onChange={(e) => setValue("cpf", maskCPF(e.target.value))} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold focus:bg-background shadow-inner" placeholder="000.000.000-00" />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="sex" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sexo</Label>
                            <Select onValueChange={(val) => setValue("sex", val)} value={watch("sex")}>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-xl">
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Vida na Igreja */}
                      <div className="space-y-6">
                        <header className="flex items-center gap-2 border-b border-border/40 pb-3">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Church className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Vida na Igreja</h3>
                        </header>

                        <div className="space-y-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Situação / Status</Label>
                            <Select onValueChange={(val) => setValue("status", val)} value={watch("status")}>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value="membro">Membro</SelectItem>
                                <SelectItem value="visitante">Visitante</SelectItem>
                                <SelectItem value="afastado">Afastado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Função / Cargo</Label>
                            <Select onValueChange={(val) => setValue("role", val)} value={watch("role")}>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value="Membro">Membro</SelectItem>
                                <SelectItem value="Pastor">Pastor</SelectItem>
                                <SelectItem value="Diácono">Diácono</SelectItem>
                                <SelectItem value="Obreiro">Obreiro</SelectItem>
                                <SelectItem value="Ministro">Ministro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="cell_id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Célula</Label>
                            <Select onValueChange={(val) => setValue("cell_id", val)} value={watch("cell_id")}>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner">
                                <SelectValue placeholder="Vincular Célula" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {cells.map((cell: any) => (
                                  <SelectItem key={cell.id} value={cell.id.toString()}>{cell.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="marital_status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estado Civil</Label>
                            <Select onValueChange={(val) => setValue("marital_status", val)} value={watch("marital_status")}>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                <SelectItem value="casado">Casado(a)</SelectItem>
                                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Col 3: Contatos & CEP */}
                      <div className="space-y-6">
                        <header className="flex items-center gap-2 border-b border-border/40 pb-3">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Comunicação</h3>
                        </header>

                        <div className="space-y-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                            <Input id="phone" {...form.register("phone")} onChange={(e) => setValue("phone", maskPhone(e.target.value))} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" placeholder="(00) 00000-0000" />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
                            <Input id="email" type="email" {...form.register("email")} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" placeholder="email@exemplo.com" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                              <Label htmlFor="cep" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CEP</Label>
                              <Input id="cep" {...form.register("cep")} onChange={(e) => setValue("cep", maskCEP(e.target.value))} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" placeholder="00.000-000" />
                            </div>
                            <div className="space-y-2.5">
                              <Label htmlFor="uf" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">UF</Label>
                              <Input id="uf" {...form.register("uf")} maxLength={2} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner text-center uppercase" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Col 4: Localização Detalhada */}
                      <div className="space-y-6">
                        <header className="flex items-center gap-2 border-b border-border/40 pb-3">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Endereço</h3>
                        </header>

                        <div className="space-y-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="logradouro" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logradouro</Label>
                            <Input id="logradouro" {...form.register("logradouro")} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" placeholder="Rua, Av, etc." />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="bairro" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Bairro</Label>
                            <Input id="bairro" {...form.register("bairro")} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="cidade" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cidade</Label>
                            <Input id="cidade" {...form.register("cidade")} className="h-12 rounded-2xl border-border/60 bg-secondary/5 font-bold shadow-inner" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Section: Família & Cônjuge */}
                    <div className="pt-10 border-t border-border/40 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                          <Users className="h-5 w-5" /> Vínculos de Parentesco
                        </h3>
                        <div className="h-px flex-1 bg-primary/5 mx-6" />
                      </div>

                      <div className="grid gap-8 lg:grid-cols-3">
                        <div className="p-6 bg-secondary/10 rounded-[2rem] border border-border/40 space-y-4">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Filiação: Pai</Label>
                          <Select onValueChange={(val) => setValue("father_id", val)} value={watch("father_id")}>
                            <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-background font-bold shadow-sm">
                              <SelectValue placeholder="Selecione o pai" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input {...form.register("father_name")} placeholder="Ou nome manual do pai" className="h-11 rounded-xl border-border/40 bg-background/50" />
                        </div>

                        <div className="p-6 bg-secondary/10 rounded-[2rem] border border-border/40 space-y-4">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Filiação: Mãe</Label>
                          <Select onValueChange={(val) => setValue("mother_id", val)} value={watch("mother_id")}>
                            <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-background font-bold shadow-sm">
                              <SelectValue placeholder="Selecione a mãe" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input {...form.register("mother_name")} placeholder="Ou nome manual da mãe" className="h-11 rounded-xl border-border/40 bg-background/50" />
                        </div>

                        {maritalStatusValue === "casado" && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/20 shadow-xl space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Users className="h-12 w-12 text-primary" />
                            </div>
                            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">Vínculo Matrimonial</Label>
                            <Select onValueChange={(val) => setValue("spouse_id", val)} value={watch("spouse_id")}>
                              <SelectTrigger className="h-12 rounded-2xl border-primary/30 bg-background font-bold shadow-lg">
                                <SelectValue placeholder="Cônjuge cadastrado" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                  <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-2 px-1">Selecione o cônjuge na lista de membros</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex gap-4 p-8 border-t bg-secondary/5 flex-shrink-0">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-2xl font-bold border-border/60 hover:bg-background transition-all">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMemberMutation.isPending || updateMemberMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                    {createMemberMutation.isPending || updateMemberMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <><Check className="h-5 w-5 mr-2" /> {isEditMode ? "Atualizar" : "Cadastrar"}</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6 bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-background border-transparent focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-none rounded-xl transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-transparent bg-background shadow-none">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="membro">Membros</SelectItem>
              <SelectItem value="congregado">Congregados</SelectItem>
              <SelectItem value="visitante">Visitantes</SelectItem>
              <SelectItem value="afastado">Afastados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <p className="font-medium opacity-60">Carregando membros...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive bg-destructive/5 rounded-3xl border border-destructive/10">
            <p className="font-medium">Não foi possível carregar a lista de membros.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMembros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-secondary/5 rounded-3xl border border-dashed border-secondary/30">
                <UserMinus className="h-12 w-12 opacity-20 mb-4" />
                <p className="text-lg font-medium">Nenhum membro encontrado</p>
                <p className="text-sm opacity-60">Tente buscar por outro termo.</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMembros.map((membro: any, index: number) => (
                  <motion.div
                    key={membro.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleView(membro)}
                    className="group relative bg-card hover:bg-secondary/5 rounded-[1.5rem] border border-border/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${membro.status === 'membro' ? 'bg-success' :
                      membro.status === 'afastado' ? 'bg-destructive' : 'bg-primary'
                      }`} />

                    <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-4 border-background shadow-md group-hover:scale-105 transition-transform duration-300">
                          <AvatarFallback className={`text-xl font-bold ${membro.status === 'membro' ? 'bg-blue-500/10 text-blue-600' :
                            membro.status === 'afastado' ? 'bg-destructive/10 text-destructive' :
                              'bg-secondary text-secondary-foreground'
                            }`}>
                            {(membro.name || membro.nome || "??").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {membro.status === 'membro' && (
                          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-background shadow-sm" title="Membro Ativo" />
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Badge variant="outline" className={`capitalize font-semibold border-0 ${statusStyles[membro.status]}`}>
                          {membro.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-popover/95 backdrop-blur-sm shadow-xl p-1">
                            <DropdownMenuItem className="cursor-pointer rounded-lg font-medium" onClick={(e) => { e.stopPropagation(); handleEdit(membro); }}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg font-medium" onClick={(e) => { e.stopPropagation(); handleToggleStatus(membro); }}>
                              {membro.status === "afastado" ? (
                                <div className="flex items-center text-success"><UserCheck className="mr-2 h-4 w-4" /> Reativar</div>
                              ) : (
                                <div className="flex items-center text-amber-600"><UserMinus className="mr-2 h-4 w-4" /> Desabilitar</div>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteClick(membro); }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1" title={membro.name || membro.nome}>
                        {membro.name || membro.nome}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-1.5">
                        <Church className="h-3.5 w-3.5" />
                        {membro.role || "Membro"}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5" title="Telefone/WhatsApp">
                        <Phone className="h-3.5 w-3.5 opacity-70" />
                        {membro.phone || membro.telefone || "Sem contato"}
                      </div>
                      {membro.cell_id && membro.cell_id !== "none" && (
                        <div className="flex items-center gap-1.5 text-primary/80" title="Célula">
                          <Users className="h-3.5 w-3.5" />
                          <span className="bg-primary/5 px-2 py-0.5 rounded-full">Célula</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>


      {/* View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-8 pb-4 bg-primary/5 flex-shrink-0">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {(selectedMember?.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">{selectedMember?.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 mt-1">
                  <Badge className={`${statusStyles[selectedMember?.status] || "bg-muted text-muted-foreground"} font-semibold`}>
                    {selectedMember?.status || "visitante"}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold text-foreground/70">{selectedMember?.role || "Membro"}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[calc(95vh-200px)]">
            <div className="p-8 space-y-10">
              {/* Personal Data */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider opacity-60">Informações Pessoais</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-secondary/5 p-6 rounded-2xl border border-secondary/20">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">CPF</p>
                    <p className="text-base font-semibold text-foreground">{selectedMember?.cpf || "Não informado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Nascimento</p>
                    <p className="text-base font-semibold text-foreground">
                      {selectedMember?.birth_date ? new Date(selectedMember.birth_date).toLocaleDateString('pt-BR') : "Não informada"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Gênero</p>
                    <p className="text-base font-semibold text-foreground capitalize">{selectedMember?.sex || "Não informado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Estado Civil</p>
                    <p className="text-base font-semibold text-foreground capitalize">{selectedMember?.marital_status || "Não informado"}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Contact Data */}
                <section>
                  <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider opacity-60">Contato</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6 bg-secondary/5 p-6 rounded-2xl border border-secondary/20 min-h-[140px]">
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">WhatsApp / Telefone</p>
                      <p className="text-base font-semibold text-foreground">{selectedMember?.phone || "Não informado"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">E-mail</p>
                      <p className="text-base font-semibold text-foreground truncate" title={selectedMember?.email}>{selectedMember?.email || "Não informado"}</p>
                    </div>
                  </div>
                </section>

                {/* Ecclesiastical Data */}
                <section>
                  <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <Church className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider opacity-60">Dados Eclesiásticos</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6 bg-secondary/5 p-6 rounded-2xl border border-secondary/20 min-h-[140px]">
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Cargo / Função</p>
                      <p className="text-base font-semibold text-foreground">{selectedMember?.role || "Membro"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Igreja de Origem</p>
                      <p className="text-base font-semibold text-foreground">{selectedMember?.origin_church || "Esta Igreja"}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Family Data */}
              <section className="pb-8">
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider opacity-60">Família e Filiação</h4>
                </div>

                <div className="space-y-6">
                  {/* Parents and Spouse */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="space-y-2">
                      <p className="text-[9px] text-primary uppercase font-semibold tracking-wider">Pai</p>
                      <p className="text-base font-semibold text-foreground leading-tight">
                        {selectedMember?.father?.name || selectedMember?.father_name || "Não informado"}
                      </p>
                      {selectedMember?.father?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10 font-semibold">Membro</Badge>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] text-primary uppercase font-semibold tracking-wider">Mãe</p>
                      <p className="text-base font-semibold text-foreground leading-tight">
                        {selectedMember?.mother?.name || selectedMember?.mother_name || "Não informada"}
                      </p>
                      {selectedMember?.mother?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10 font-semibold">Membro</Badge>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] text-primary uppercase font-semibold tracking-wider">Cônjuge</p>
                      <p className="text-base font-semibold text-foreground leading-tight">
                        {selectedMember?.spouse?.name || (selectedMember?.marital_status === 'casado' ? "Nome não vinculado" : "N/A")}
                      </p>
                      {selectedMember?.spouse?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10 font-semibold">Membro</Badge>}
                    </div>
                  </div>

                  {/* Children (Dynamic Discovery) */}
                  {members.filter((m: any) => m.father_id === selectedMember?.id || m.mother_id === selectedMember?.id).length > 0 && (
                    <div className="bg-success/5 p-6 rounded-2xl border border-success/20">
                      <p className="text-[9px] text-success uppercase font-semibold tracking-wider mb-4">Filhos (Membros Cadastrados)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {members
                          .filter((m: any) => m.father_id === selectedMember?.id || m.mother_id === selectedMember?.id)
                          .map((filho: any) => (
                            <div key={filho.id} className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border/50">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-semibold">
                                  {(filho.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">{filho.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{filho.role || "Membro"}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
          <div className="p-6 border-t bg-background flex justify-end gap-4 flex-shrink-0">
            <Button variant="outline" className="px-8 shadow-sm" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 shadow-md transition-all active:scale-95" onClick={() => {
              setIsViewDialogOpen(false);
              handleEdit(selectedMember);
            }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar Membro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{selectedMember?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout >
  );
}
