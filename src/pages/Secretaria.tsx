import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Loader2, User, Phone, MapPin, Church, Users } from "lucide-react";
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
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

export default function Secretaria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    },
  });

  const { watch, setValue } = form;
  const statusValue = watch("status");
  const maritalStatusValue = watch("marital_status");
  const cepValue = watch("cep");

  // Fetch Members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
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
      toast.success("Membro cadastrado com sucesso!");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar membro");
    },
  });

  const onSubmit = (data: any) => {
    // Process data to match backend expectations (enums, numbers, etc.)
    const processedData = {
      ...data,
      category: data.status === "membro" ? "membro" : "visitante", // Logic for existing category field
      baptism_date: data.status === "membro" ? data.baptism_date : null,
    };
    createMemberMutation.mutate(processedData);
  };

  const filteredMembros = members.filter((membro: any) => {
    const name = membro.name || membro.nome || "";
    const status = membro.status || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Secretaria" breadcrumbs={[{ label: "Membros" }]}>
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo membro da igreja em etapas.
                </DialogDescription>
              </DialogHeader>
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
                        <div className="space-y-2">
                          <Label htmlFor="sex">Sexo</Label>
                          <Select onValueChange={(val) => setValue("sex", val)} defaultValue="">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="marital_status">Estado Civil</Label>
                          <Select onValueChange={(val) => setValue("marital_status", val)} defaultValue="">
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
                        <div className="space-y-2">
                          <Label htmlFor="status">Situação / Status</Label>
                          <Select onValueChange={(val) => setValue("status", val)} defaultValue="visitante">
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
                        <div className="space-y-2">
                          <Label htmlFor="baptism_date" className={statusValue !== "membro" ? "text-muted-foreground" : ""}>
                            Data de Batismo
                          </Label>
                          <Input
                            id="baptism_date"
                            type="date"
                            {...form.register("baptism_date")}
                            disabled={statusValue !== "membro"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Função / Cargo</Label>
                          <Select onValueChange={(val) => setValue("role", val)} defaultValue="Membro">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Membro">Membro</SelectItem>
                              <SelectItem value="Diácono">Diácono</SelectItem>
                              <SelectItem value="Obreiro">Obreiro</SelectItem>
                              <SelectItem value="Ungido">Ungido</SelectItem>
                              <SelectItem value="Pastor">Pastor</SelectItem>
                              <SelectItem value="Instrumentista">Instrumentista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="origin_church">Igreja de Origem</Label>
                          <div className="relative">
                            <Church className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="origin_church" {...form.register("origin_church")} className="pl-10" />
                          </div>
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
                            <Select onValueChange={(val) => setValue("father_id", val)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um membro" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.map((m: any) => (
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
                            <Select onValueChange={(val) => setValue("mother_id", val)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um membro" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.map((m: any) => (
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
                              <Select onValueChange={(val) => setValue("spouse_id", val)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o cônjuge" />
                                </SelectTrigger>
                                <SelectContent>
                                  {members.map((m: any) => (
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
                  <Button type="submit" className="bg-primary text-primary-foreground min-w-[100px]" disabled={createMemberMutation.isPending}>
                    {createMemberMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
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
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
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
    </MainLayout>
  );
}

