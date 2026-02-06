import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Loader2, User, Phone, MapPin, Church, Users, Trash2, UserMinus, UserCheck } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
              <div className="bg-primary/5 p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black text-foreground">
                      {isEditMode ? "Editar Membro" : "Adicionar Novo Membro"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {isEditMode ? "Atualize os dados do membro da igreja." : "Preencha os dados do novo membro da igreja em etapas."}
                    </DialogDescription>
                  </div>
                </div>
              </div>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 px-6 py-4">
                  <Tabs defaultValue="pessoais" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="pessoais">Pessoais</TabsTrigger>
                      <TabsTrigger value="contato">Contato</TabsTrigger>
                      <TabsTrigger value="eclesiastico">Igreja</TabsTrigger>
                      <TabsTrigger value="familia">Família</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pessoais" className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="name" {...form.register("name", { required: true })} className="pl-10" placeholder="Nome do membro" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birth_date">Data de Nascimento</Label>
                          <Input id="birth_date" type="date" {...form.register("birth_date")} />
                        </div>
                        <div className="space-y-2 p-0.5">
                          <Label htmlFor="sex">Sexo</Label>
                          <Select onValueChange={(val) => setValue("sex", val)} value={watch("sex")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 p-0.5">
                          <Label htmlFor="marital_status">Estado Civil</Label>
                          <Select onValueChange={(val) => setValue("marital_status", val)} value={watch("marital_status")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                              <SelectItem value="casado">Casado(a)</SelectItem>
                              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            {...form.register("cpf")}
                            onChange={(e) => setValue("cpf", maskCPF(e.target.value))}
                            placeholder="000.000.000-00"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contato" className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">WhatsApp / Telefone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              {...form.register("phone")}
                              className="pl-10"
                              placeholder="(00) 00000-0000"
                              onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input id="email" type="email" {...form.register("email")} placeholder="exemplo@email.com" />
                        </div>
                        <div className="sm:col-span-2 border-t pt-4">
                          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Endereço
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="cep">CEP</Label>
                              <Input
                                id="cep"
                                {...form.register("cep")}
                                placeholder="00000-000"
                                onChange={(e) => setValue("cep", maskCEP(e.target.value))}
                              />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                              <Label htmlFor="logradouro">Logradouro</Label>
                              <Input id="logradouro" {...form.register("logradouro")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bairro">Bairro</Label>
                              <Input id="bairro" {...form.register("bairro")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cidade">Cidade</Label>
                              <Input id="cidade" {...form.register("cidade")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="uf">UF</Label>
                              <Input id="uf" {...form.register("uf")} maxLength={2} className="uppercase" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="eclesiastico" className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 p-0.5">
                          <Label htmlFor="status">Situação / Status</Label>
                          <Select onValueChange={(val) => setValue("status", val)} value={watch("status")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="membro">Membro</SelectItem>
                              <SelectItem value="congregado">Congregado</SelectItem>
                              <SelectItem value="visitante">Visitante</SelectItem>
                              <SelectItem value="afastado">Afastado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 p-0.5">
                          <Label htmlFor="role">Função / Cargo</Label>
                          <Select onValueChange={(val) => setValue("role", val)} value={watch("role")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Membro">Membro</SelectItem>
                              <SelectItem value="Diácono">Diácono</SelectItem>
                              <SelectItem value="Obreiro">Obreiro</SelectItem>
                              <SelectItem value="Ministro de Louvor">Ministro de Louvor</SelectItem>
                              <SelectItem value="Pastor">Pastor</SelectItem>
                              <SelectItem value="Instrumentista">Instrumentista</SelectItem>
                              <SelectItem value="Financeiro">Financeiro</SelectItem>
                              <SelectItem value="Secretaria">Secretaria</SelectItem>
                              <SelectItem value="Líder de Pequeno Grupo">Líder de Pequeno Grupo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 p-0.5">
                          <Label htmlFor="cell_id">Célula / Pequeno Grupo</Label>
                          <Select onValueChange={(val) => setValue("cell_id", val)} value={watch("cell_id")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma célula" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {cells.map((cell: any) => (
                                <SelectItem key={cell.id} value={cell.id.toString()}>{cell.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="familia" className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-1">
                        <div className="space-y-2">
                          <Label>Vínculo com Membros Já Cadastrados</Label>
                          <p className="text-xs text-muted-foreground mb-4">Selecione membros da igreja para vincular como parentes.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="father_id">Pai (Membro)</Label>
                            <Select onValueChange={(val) => setValue("father_id", val)} value={watch("father_id")}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um membro" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                  <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="pt-2">
                              <Label htmlFor="father_name" className="text-xs">Ou Nome do Pai (Manual)</Label>
                              <Input id="father_name" {...form.register("father_name")} placeholder="Nome do pai" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mother_id">Mãe (Membro)</Label>
                            <Select onValueChange={(val) => setValue("mother_id", val)} value={watch("mother_id")}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um membro" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                  <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="pt-2">
                              <Label htmlFor="mother_name" className="text-xs">Ou Nome da Mãe (Manual)</Label>
                              <Input id="mother_name" {...form.register("mother_name")} placeholder="Nome da mãe" />
                            </div>
                          </div>

                          {maritalStatusValue === "casado" && (
                            <div className="sm:col-span-2 space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/10">
                              <Label htmlFor="spouse_id" className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> Cônjuge (Membro)
                              </Label>
                              <Select onValueChange={(val) => setValue("spouse_id", val)} value={watch("spouse_id")}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o cônjuge" />
                                </SelectTrigger>
                                <SelectContent>
                                  {members.filter((m: any) => m.id !== selectedMember?.id).map((m: any) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
                <div className="flex justify-end gap-3 p-6 border-t mt-auto">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground min-w-[100px]" disabled={createMemberMutation.isPending || updateMemberMutation.isPending}>
                    {createMemberMutation.isPending || updateMemberMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Situações</SelectItem>
              <SelectItem value="membro">Membros</SelectItem>
              <SelectItem value="congregado">Congregados</SelectItem>
              <SelectItem value="visitante">Visitantes</SelectItem>
              <SelectItem value="afastado">Afastados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table/Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Carregando membros...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Erro ao carregar dados. Verifique a conexão com o servidor.</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Cargo/Função</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">WhatsApp</TableHead>
                  <TableHead className="font-semibold">Situação</TableHead>
                  <TableHead className="font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembros.map((membro: any, index: number) => (
                    <motion.tr
                      key={membro.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b hover:bg-secondary/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                              {(membro.name || membro.nome || "??").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{membro.name || membro.nome}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{membro.cpf || "Sem CPF"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {membro.role || membro.funcao || "Membro"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {membro.phone || membro.telefone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[membro.status] || "bg-muted text-muted-foreground"}>
                          {membro.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(membro)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(membro)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggleStatus(membro)}>
                              {membro.status === "afastado" ? (
                                <><UserCheck className="mr-2 h-4 w-4 text-success" /> Reativar</>
                              ) : (
                                <><UserMinus className="mr-2 h-4 w-4 text-amber-500" /> Desabilitar</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDeleteClick(membro)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-8 pb-0 bg-primary/5">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {(selectedMember?.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">{selectedMember?.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 mt-1">
                  <Badge className={statusStyles[selectedMember?.status] || "bg-muted text-muted-foreground"}>
                    {selectedMember?.status || "visitante"}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-foreground">{selectedMember?.role || "Membro"}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              {/* Personal Data */}
              <section>
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-foreground uppercase text-xs tracking-widest">Informações Pessoais</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-secondary/5 p-6 rounded-2xl border border-secondary/20">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">CPF</p>
                    <p className="text-base font-bold text-foreground">{selectedMember?.cpf || "Não informado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Nascimento</p>
                    <p className="text-base font-bold text-foreground">
                      {selectedMember?.birth_date ? new Date(selectedMember.birth_date).toLocaleDateString('pt-BR') : "Não informada"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Gênero</p>
                    <p className="text-base font-bold text-foreground capitalize">{selectedMember?.sex || "Não informado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Estado Civil</p>
                    <p className="text-base font-bold text-foreground capitalize">{selectedMember?.marital_status || "Não informado"}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Contact Data */}
                <section>
                  <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-foreground uppercase text-xs tracking-widest">Contato</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6 bg-secondary/5 p-6 rounded-2xl border border-secondary/20 min-h-[140px]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">WhatsApp / Telefone</p>
                      <p className="text-base font-bold text-foreground">{selectedMember?.phone || "Não informado"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">E-mail</p>
                      <p className="text-base font-bold text-foreground truncate" title={selectedMember?.email}>{selectedMember?.email || "Não informado"}</p>
                    </div>
                  </div>
                </section>

                {/* Ecclesiastical Data */}
                <section>
                  <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    <Church className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-foreground uppercase text-xs tracking-widest">Dados Eclesiásticos</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6 bg-secondary/5 p-6 rounded-2xl border border-secondary/20 min-h-[140px]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Cargo / Função</p>
                      <p className="text-base font-bold text-foreground">{selectedMember?.role || "Membro"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Igreja de Origem</p>
                      <p className="text-base font-bold text-foreground">{selectedMember?.origin_church || "Esta Igreja"}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Family Data */}
              <section className="pb-8">
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-foreground uppercase text-xs tracking-widest">Família e Filiação</h4>
                </div>

                <div className="space-y-6">
                  {/* Parents and Spouse */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary uppercase font-black tracking-tighter">Pai</p>
                      <p className="text-base font-bold text-foreground leading-tight">
                        {selectedMember?.father?.name || selectedMember?.father_name || "Não informado"}
                      </p>
                      {selectedMember?.father?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10">Membro</Badge>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary uppercase font-black tracking-tighter">Mãe</p>
                      <p className="text-base font-bold text-foreground leading-tight">
                        {selectedMember?.mother?.name || selectedMember?.mother_name || "Não informada"}
                      </p>
                      {selectedMember?.mother?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10">Membro</Badge>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary uppercase font-black tracking-tighter">Cônjuge</p>
                      <p className="text-base font-bold text-foreground leading-tight">
                        {selectedMember?.spouse?.name || (selectedMember?.marital_status === 'casado' ? "Nome não vinculado" : "N/A")}
                      </p>
                      {selectedMember?.spouse?.name && <Badge variant="outline" className="text-[10px] h-4 bg-primary/10">Membro</Badge>}
                    </div>
                  </div>

                  {/* Children (Dynamic Discovery) */}
                  {members.filter((m: any) => m.father_id === selectedMember?.id || m.mother_id === selectedMember?.id).length > 0 && (
                    <div className="bg-success/5 p-6 rounded-2xl border border-success/20">
                      <p className="text-[10px] text-success uppercase font-black tracking-tighter mb-4">Filhos (Membros Cadastrados)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {members
                          .filter((m: any) => m.father_id === selectedMember?.id || m.mother_id === selectedMember?.id)
                          .map((filho: any) => (
                            <div key={filho.id} className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border/50">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-bold">
                                  {(filho.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">{filho.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{filho.role || "Membro"}</span>
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
          <div className="p-8 border-t bg-background flex justify-end gap-4">
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
    </MainLayout>
  );
}
