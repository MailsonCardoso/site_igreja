import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Upload, Trash2, UserPlus, Loader2, Shield, Mail, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper mask functions
const maskCNPJ = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

const maskPhone = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

export default function Configuracoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("geral");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Settings Tab State
  const [settingsForm, setSettingsForm] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    telefone: "",
    email: "",
    whatsapp_enabled: "0",
    google_calendar_enabled: "0",
    email_marketing_enabled: "0"
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    status: ""
  });

  // User Tab State
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Administrador",
    status: "Ativo",
    memberId: ""
  });
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch Settings
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings")
  });

  // Sincronizar dados carregados com o form e aplicar máscaras
  useEffect(() => {
    if (settings) {
      // Lidar com retorno direto ou aninhado em 'settings'
      const data = settings.settings || settings;

      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        setSettingsForm(prev => ({
          ...prev,
          nome: data.nome || prev.nome,
          cnpj: data.cnpj ? maskCNPJ(data.cnpj) : prev.cnpj,
          endereco: data.endereco || prev.endereco,
          cidade: data.cidade || prev.cidade,
          telefone: data.telefone ? maskPhone(data.telefone) : prev.telefone,
          email: data.email || prev.email,
          whatsapp_enabled: data.whatsapp_enabled || prev.whatsapp_enabled,
          google_calendar_enabled: data.google_calendar_enabled || prev.google_calendar_enabled,
          email_marketing_enabled: data.email_marketing_enabled || prev.email_marketing_enabled
        }));
      }
    }
  }, [settings]);

  // Fetch Users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users")
  });

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => api.post("/settings", { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: (data: any) => api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsUserModalOpen(false);
      setUserFormData({ name: "", email: "", password: "", role: "Administrador", status: "Ativo", memberId: "" });
      toast({
        title: "Sucesso!",
        description: "Novo usuário criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário.",
        variant: "destructive",
      });
    }
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: any) => api.put(`/users/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditModalOpen(false);
      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário.",
        variant: "destructive",
      });
    }
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteModalOpen(false);
      toast({
        title: "Removido!",
        description: "Usuário excluído do sistema.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário.",
        variant: "destructive",
      });
    }
  });

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let finalValue = value;

    if (id === "cnpj") finalValue = maskCNPJ(value);
    if (id === "telefone") finalValue = maskPhone(value);

    setSettingsForm({ ...settingsForm, [id]: finalValue });
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    const newVal = value ? "1" : "0";
    setSettingsForm(prev => ({ ...prev, [key]: newVal }));
    saveSettingsMutation.mutate({ [key]: newVal });
  };

  const onSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(settingsForm);
  };

  const onUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(userFormData);
  };

  const onEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(editFormData);
  };

  const openEditModal = (user: any) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "Administrador",
      status: user.status || "Ativo"
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const fetchMembersByRole = async (role: string) => {
    if (role === "Administrador") {
      setAvailableMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const members = await api.get(`/members/find-by-role?role=${role}`);
      setAvailableMembers(Array.isArray(members) ? members : []);
      if (!Array.isArray(members)) {
        toast({
          title: "Atenção",
          description: "Nenhum membro encontrado com este cargo ou cargo sem CPF.",
        });
      }
    } catch (error) {
      setAvailableMembers([]);
      toast({
        title: "Atenção",
        description: "Nenhum membro cadastrado com este cargo ou cargo sem CPF.",
        variant: "default",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    const member = availableMembers.find(m => m.id.toString() === memberId);
    if (member) {
      setUserFormData(prev => ({
        ...prev,
        memberId: member.id.toString(),
        name: member.name,
        email: member.email || "",
        password: member.cpf ? member.cpf.replace(/\D/g, '') : ""
      }));
      toast({
        title: "Membro Selecionado",
        description: `Dados de ${member.name} carregados com sucesso.`,
      });
    }
  };

  return (
    <MainLayout title="Configurações" breadcrumbs={[{ label: "Sistema" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-card p-1 shadow-xl overflow-hidden border border-white/10"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-secondary/30 p-4 pb-0">
            <TabsList className="mb-0 bg-secondary/50 h-14 rounded-2xl p-1 gap-2 border-none">
              <TabsTrigger value="geral" className="h-11 rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all">
                Geral
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="h-11 rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all">
                Usuários
              </TabsTrigger>
              <TabsTrigger value="integracoes" className="h-11 rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all">
                Integrações
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="geral" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-8 pb-8 border-b">
                <div className="relative group">
                  <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {settingsForm.nome ? settingsForm.nome.substring(0, 2).toUpperCase() : "IC"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-background shadow-lg text-primary border-primary/20 hover:bg-primary/5">
                    <Upload className="h-5 w-5" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Identidade da Igreja</h3>
                  <p className="text-muted-foreground font-medium max-w-md">
                    Personalize as informações básicas da sua igreja que aparecem em relatórios e no sistema.
                  </p>
                </div>
              </div>

              <form onSubmit={onSaveSettings} className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="nome" className="text-[10px] uppercase font-semibold tracking-wider text-primary ml-1">Nome da Igreja</Label>
                  <Input
                    id="nome"
                    value={settingsForm.nome}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="Nome Completo da Instituição"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cnpj" className="text-[10px] uppercase font-semibold tracking-wider text-primary ml-1">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={settingsForm.cnpj}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endereco" className="text-[10px] uppercase font-semibold tracking-wider text-primary ml-1">Endereço</Label>
                  <Input
                    id="endereco"
                    value={settingsForm.endereco}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="Av. Nome da Rua, 123"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cidade" className="text-[10px] uppercase font-semibold tracking-wider text-primary ml-1">Cidade / Estado</Label>
                  <Input
                    id="cidade"
                    value={settingsForm.cidade}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="Cidade - UF"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="telefone" className="text-[10px] uppercase font-semibold tracking-widest text-primary ml-1">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    value={settingsForm.telefone}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] uppercase font-semibold tracking-widest text-primary ml-1">E-mail Institucional</Label>
                  <Input
                    id="email"
                    value={settingsForm.email}
                    onChange={handleSettingsChange}
                    className="h-11 rounded-xl border-input bg-background font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    placeholder="contato@igreja.com"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end pt-8">
                  <Button
                    type="submit"
                    className="h-14 rounded-2xl px-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                    disabled={saveSettingsMutation.isPending}
                  >
                    {saveSettingsMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    SALVAR ALTERAÇÕES
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="usuarios" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Gestão de Acesso</h3>
                  <p className="text-muted-foreground font-medium">
                    Administre os usuários que possuem acesso ao painel de gestão.
                  </p>
                </div>
                <Button
                  onClick={() => setIsUserModalOpen(true)}
                  className="h-14 rounded-2xl px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  <UserPlus className="h-6 w-6" />
                  NOVO USUÁRIO
                </Button>
              </div>

              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-[2rem] border-2 border-dashed">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="font-bold text-muted-foreground">Carregando lista de administradores...</p>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-secondary/30 bg-background/50 overflow-hidden shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/40 hover:bg-secondary/40 border-b-2">
                        <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground p-6">Administrador</TableHead>
                        <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">E-mail</TableHead>
                        <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Papel</TableHead>
                        <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
                        <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {users.map((usuario: any, index: number) => (
                          <motion.tr
                            key={usuario.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-all border-b border-secondary/20"
                          >
                            <TableCell className="p-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg">
                                  <AvatarFallback className="bg-secondary text-primary font-bold text-base">
                                    {(usuario.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{usuario.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-bold">{usuario.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-semibold uppercase text-[9px] tracking-widest bg-secondary/20 px-3 py-1 rounded-lg">
                                {usuario.role || "Administrador"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                (usuario.status || "Ativo") === "Ativo"
                                  ? "bg-success/10 text-success border-success/20 transition-all font-semibold"
                                  : "bg-muted text-muted-foreground font-semibold"
                              }>
                                {(usuario.status || "Ativo").toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                  onClick={() => openEditModal(usuario)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                  onClick={() => openDeleteModal(usuario)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="integracoes" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-6">
                {[
                  {
                    id: "whatsapp_enabled",
                    name: "WhatsApp Multi-Agente",
                    desc: "Integração para envio de notificações e lembretes automáticos.",
                    icon: (
                      <div className="h-16 w-16 rounded-[1.5rem] bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-500" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                    )
                  },
                  {
                    id: "google_calendar_enabled",
                    name: "Google Calendar",
                    desc: "Sincronize sua agenda de eventos com o calendário oficial da igreja.",
                    icon: (
                      <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/20">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                      </div>
                    )
                  },
                  {
                    id: "email_marketing_enabled",
                    name: "E-mail Marketing",
                    desc: "Crie e envie newsletters para toda a congregação de forma centralizada.",
                    icon: (
                      <div className="h-16 w-16 rounded-[1.5rem] bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-purple-500" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                    )
                  }
                ].map((integ) => (
                  <div key={integ.id} className="flex items-center justify-between p-8 rounded-[2rem] bg-card border-2 border-secondary/20 shadow-lg hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-6">
                      {integ.icon}
                      <div>
                        <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{integ.name}</h4>
                        <p className="text-sm text-muted-foreground font-medium max-w-sm">{integ.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settingsForm[integ.id as keyof typeof settingsForm] === "1"}
                      onCheckedChange={(val) => handleSwitchChange(integ.id, val)}
                      className="data-[state=checked]:bg-primary scale-125"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      {/* Modal Novo Usuário */}
      <Dialog open={isUserModalOpen} onOpenChange={(open) => {
        setIsUserModalOpen(open);
        if (!open) {
          setUserFormData({ name: "", email: "", password: "", role: "Administrador", status: "Ativo", memberId: "" });
          setAvailableMembers([]);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 bg-primary/5 flex items-center gap-4 border-b">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Novo Acesso</DialogTitle>
              <DialogDescription className="text-xs font-bold text-primary">
                Libere a gestão para novos usuários.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={onUserSubmit} className="p-6 space-y-4 bg-card">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">Papel / Função</Label>
                  <Select
                    onValueChange={(v) => {
                      setUserFormData({ ...userFormData, role: v, memberId: "", name: "", email: "", password: "" });
                      fetchMembersByRole(v);
                    }}
                    value={userFormData.role}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Administrador" className="font-semibold">Administrador</SelectItem>
                      <SelectItem value="Pastor" className="font-semibold">Pastor</SelectItem>
                      <SelectItem value="Financeiro" className="font-semibold">Financeiro</SelectItem>
                      <SelectItem value="Secretaria" className="font-semibold">Secretaria</SelectItem>
                      <SelectItem value="Lider de pequeno grupo" className="font-semibold">Líder de Pequeno Grupo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">Status</Label>
                  <Select
                    onValueChange={(v) => setUserFormData({ ...userFormData, status: v })}
                    value={userFormData.status}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Ativo" className="font-semibold text-success">Ativo</SelectItem>
                      <SelectItem value="Inativo" className="font-semibold text-destructive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {availableMembers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-[10px] uppercase font-semibold tracking-wider text-primary ml-1">Selecionar Membro ({userFormData.role})</Label>
                  <Select
                    onValueChange={handleMemberSelect}
                    value={userFormData.memberId}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/30 font-semibold text-primary">
                      {isLoadingMembers ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Escolha um membro da lista" />}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {availableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()} className="font-medium">
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground ml-1 font-semibold italic">* Exibindo apenas membros com cargo '{userFormData.role}' e CPF cadastrado.</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">
                  Nome Completo
                  {userFormData.memberId && <Badge variant="secondary" className="ml-2 text-[8px] h-4 bg-primary/10 text-primary border-none">VINCULADO</Badge>}
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className={`h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30 transition-all ${userFormData.memberId ? 'bg-secondary/10' : ''}`}
                    required
                    readOnly={!!userFormData.memberId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">
                  E-mail de Login
                  {userFormData.memberId && <Badge variant="secondary" className="ml-2 text-[8px] h-4 bg-success/10 text-success border-none font-semibold">AUTOMÁTICO</Badge>}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="joao@igreja.com"
                    className={`h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30 transition-all ${userFormData.memberId ? 'bg-secondary/10 opacity-70' : ''}`}
                    required
                    readOnly={!!userFormData.memberId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">
                  Senha Provisória (CPF)
                  {userFormData.memberId && <Badge variant="secondary" className="ml-2 text-[8px] h-4 bg-success/10 text-success border-none font-semibold">GERADA PELO CPF</Badge>}
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Senha ou CPF sem pontos"
                    className={`h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30 transition-all ${userFormData.memberId ? 'bg-secondary/10 opacity-70' : ''}`}
                    required
                    readOnly={!!userFormData.memberId}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)} className="flex-1 font-semibold h-12 rounded-xl border-secondary/20 hover:bg-secondary/10">
                CANCELAR
              </Button>
              <Button
                type="submit"
                className="flex-1 font-semibold h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONCEDER ACESSO"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal Editar Usuário */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 bg-primary/5 flex items-center gap-4 border-b">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Editar Acesso</DialogTitle>
              <DialogDescription className="text-xs font-bold text-primary">
                Atualize os dados do usuário.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={onEditSubmit} className="p-6 space-y-4 bg-card">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">Papel / Função</Label>
                  <Select
                    onValueChange={(v) => setEditFormData({ ...editFormData, role: v })}
                    value={editFormData.role}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Administrador" className="font-semibold">Administrador</SelectItem>
                      <SelectItem value="Pastor" className="font-semibold">Pastor</SelectItem>
                      <SelectItem value="Financeiro" className="font-semibold">Financeiro</SelectItem>
                      <SelectItem value="Secretaria" className="font-semibold">Secretaria</SelectItem>
                      <SelectItem value="Lider de pequeno grupo" className="font-semibold">Líder de Pequeno Grupo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">Status</Label>
                  <Select
                    onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}
                    value={editFormData.status}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/5 font-semibold border-secondary/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Ativo" className="font-semibold text-success">Ativo</SelectItem>
                      <SelectItem value="Inativo" className="font-semibold text-destructive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground ml-1">E-mail de Login</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="h-12 pl-10 rounded-xl bg-secondary/5 font-semibold border-secondary/30"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground italic font-medium">* A senha não pode ser alterada por este painel por motivos de segurança.</p>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1 font-semibold h-12 rounded-xl border-secondary/20 hover:bg-secondary/10">
                CANCELAR
              </Button>
              <Button
                type="submit"
                className="flex-1 font-semibold h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "SALVAR ALTERAÇÕES"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-destructive/5 flex flex-col items-center text-center gap-4 border-b">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20 text-destructive">
              <Trash2 className="h-10 w-10" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">Remover Acesso?</DialogTitle>
              <DialogDescription className="font-semibold text-destructive mt-1">
                Esta ação é irreversível e o usuário perderá acesso imediato ao sistema.
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-card text-center">
            <p className="text-foreground font-medium">
              Tem certeza que deseja excluir o acesso de <span className="font-semibold text-primary">{userToDelete?.name}</span>?
            </p>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="w-full font-semibold h-12 rounded-xl border-secondary/20 hover:bg-secondary/10">
                MANTER ACESSO
              </Button>
              <Button
                type="button"
                className="w-full font-semibold h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
                onClick={() => deleteUserMutation.mutate(userToDelete?.id)}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "SIM, EXCLUIR"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
