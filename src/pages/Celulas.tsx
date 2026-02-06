import { useState } from "react";
import { motion } from "framer-motion";
import { User, Clock, Plus, Loader2, Save, X, Users, Pencil, Trash2, Eye } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
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

export default function Celulas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch Cells
  const { data: celulas = [], isLoading } = useQuery({
    queryKey: ["cells"],
    queryFn: () => api.get("/cells"),
  });

  // Fetch Members (for Leader selection)
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
  });

  // Filtrar membros que são líderes
  const leaders = members.filter((m: any) =>
    (m.role || "").toLowerCase().includes("lider") ||
    (m.role || "").toLowerCase().includes("líder") ||
    (m.role || "").toLowerCase().includes("lider de pequeno grupo") ||
    (m.role || "").toLowerCase().includes("líder de pequeno grupo")
  );

  const form = useForm({
    defaultValues: {
      name: "",
      leader_id: "",
      meeting_day: "",
      meeting_time: "",
      capacity: 15,
      description: ""
    }
  });

  const { reset, setValue, watch, handleSubmit } = form;

  // Create/Update Cell Mutation
  const saveCellMutation = useMutation({
    mutationFn: (data: any) => isEditMode && selectedCell
      ? api.put(`/cells/${selectedCell.id}`, data)
      : api.post("/cells", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success(isEditMode ? "Célula atualizada!" : "Célula criada!");
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCell(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar célula");
    },
  });

  // Delete Cell Mutation
  const deleteCellMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/cells/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Célula excluída!");
      setIsDeleteOpen(false);
      setSelectedCell(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir célula");
    },
  });

  const onSubmit = (data: any) => {
    saveCellMutation.mutate(data);
  };

  const handleEdit = (celula: any) => {
    setSelectedCell(celula);
    setIsEditMode(true);
    reset({
      name: celula.name || "",
      leader_id: celula.leader_id?.toString() || "",
      meeting_day: celula.meeting_day || "",
      meeting_time: celula.meeting_time || "",
      capacity: celula.capacity || 15,
      description: celula.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleView = (celula: any) => {
    setSelectedCell(celula);
    setIsViewOpen(true);
  };

  const handleDelete = (celula: any) => {
    setSelectedCell(celula);
    setIsDeleteOpen(true);
  };

  return (
    <MainLayout
      title="Células"
      breadcrumbs={[{ label: "Grupos" }]}
    >
      {/* Botão reposicionado para dentro do conteúdo principal para melhor visual e funcionamento */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Pequenos Grupos</h2>
          <p className="text-muted-foreground">Acompanhe a lotação e liderança de cada célula</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 h-11 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Nova Célula</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : celulas.length === 0 ? (
        <div className="flex h-[450px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-primary/10 bg-primary/5 p-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-black text-foreground">Nenhuma célula cadastrada</h3>
          <p className="mt-2 max-w-sm text-muted-foreground text-lg leading-relaxed">
            Organize sua igreja criando pequenos grupos. Comece agora mesmo!
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="mt-8 border-primary text-primary hover:bg-primary hover:text-white rounded-xl h-12 px-8 font-bold transition-all"
          >
            Cadastrar Primeira Célula
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {celulas.map((celula: any, index: number) => {
            const numMembros = celula.members?.length || 0;
            const capacidade = celula.capacity || 15;
            const ocupacao = (numMembros / capacidade) * 100;

            return (
              <motion.div
                key={celula.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group rounded-[2rem] bg-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/50 hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-none truncate pr-2">{celula.name}</h3>
                    <Badge variant="outline" className="mt-2 border-primary/20 text-primary uppercase text-[8px] font-black tracking-widest px-2 py-0">
                      {celula.meeting_day || "Não definido"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(celula)}
                      className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(celula)}
                      className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(celula)}
                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 transition-transform group-hover:rotate-6">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">Líder do Grupo</span>
                      <span className="text-md font-bold text-foreground block">{celula.leader?.name || "Não atribuído"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 transition-transform group-hover:-rotate-6">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">Dia e Horário</span>
                      <span className="text-md font-bold text-foreground block">{celula.meeting_day} às {celula.meeting_time || "19:30"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Ocupação Atual</span>
                    <span className="text-sm font-black text-foreground">
                      {numMembros}/{capacidade} <span className="text-primary ml-1">({Math.round(ocupacao)}%)</span>
                    </span>
                  </div>
                  <div className="relative h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(ocupacao, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${ocupacao > 90 ? 'bg-destructive' : ocupacao > 70 ? 'bg-orange-500' : 'bg-primary'}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-8 border-b relative">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                {isEditMode ? <Pencil className="h-8 w-8 text-primary" /> : <Users className="h-8 w-8 text-primary" />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-foreground">
                  {isEditMode ? "Editar Célula" : "Nova Célula"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Preencha os dados abaixo para organizar seu pequeno grupo.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Célula</Label>
              <Input
                id="name"
                {...form.register("name", { required: true })}
                placeholder="Ex: Célula Esperança"
                className="h-12 rounded-xl border-secondary/30 bg-secondary/5 focus:bg-background font-bold transition-all focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dia da Semana</Label>
                <Select onValueChange={(val) => setValue("meeting_day", val)} value={watch("meeting_day")}>
                  <SelectTrigger className="h-12 rounded-xl border-secondary/30 bg-secondary/5 font-bold focus:border-primary/50">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-primary/10">
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(dia => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_time" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horário</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  {...form.register("meeting_time")}
                  className="h-12 rounded-xl border-secondary/30 bg-secondary/5 font-bold focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Líder da Célula</Label>
              <Select onValueChange={(val) => setValue("leader_id", val)} value={watch("leader_id")}>
                <SelectTrigger className="h-12 rounded-xl border-secondary/30 bg-secondary/5 font-bold focus:border-primary/50">
                  <SelectValue placeholder="Selecione um líder" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/10">
                  {leaders.length === 0 ? (
                    <div className="p-4 text-xs text-center text-muted-foreground">Nenhum líder cadastrado nos membros</div>
                  ) : (
                    leaders.map((m: any) => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.name || m.nome}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacidade Máxima</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity")}
                className="h-12 rounded-xl border-secondary/30 bg-secondary/5 font-bold focus:border-primary/50"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedCell(null);
                  reset();
                }}
                className="flex-1 h-12 rounded-xl font-bold border-secondary/50 text-muted-foreground hover:bg-secondary/5 transition-all"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saveCellMutation.isPending}
                className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {saveCellMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> {isEditMode ? "Atualizar" : "Salvar"} Célula</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Excluir Célula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a célula <strong>{selectedCell?.name}</strong>?
              Esta ação removerá o vínculo de todos os membros deste grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCell && deleteCellMutation.mutate(selectedCell.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
            >
              {deleteCellMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalhes da Célula */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
          <div className="bg-primary/5 p-5 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground leading-tight">{selectedCell?.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes informativos sobre a célula e seus membros.
                </DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary text-white hover:bg-primary text-[10px] h-5 px-2">
                    {selectedCell?.meeting_day || "Não definido"}
                  </Badge>
                  <span className="text-muted-foreground font-bold text-xs">•</span>
                  <span className="text-muted-foreground font-bold text-xs">{selectedCell?.meeting_time || "19:30"}h</span>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              {/* Liderança e Capacidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-0.5">Líder</span>
                  <span className="text-md font-bold text-foreground block truncate">{selectedCell?.leader?.name || "Não atribuído"}</span>
                </div>
                <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-0.5">Capacidade</span>
                  <span className="text-md font-bold text-foreground block">{selectedCell?.capacity || 15} pessoas</span>
                </div>
              </div>

              {/* Lista de Membros */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Membros ({selectedCell?.members?.length || 0})
                  </h4>
                </div>

                <div className="grid gap-2.5">
                  {(!selectedCell?.members || selectedCell.members.length === 0) ? (
                    <div className="text-center py-8 bg-secondary/5 rounded-2xl border border-dashed border-secondary/20">
                      <p className="text-xs text-muted-foreground font-medium italic">Nenhum membro vinculado ainda.</p>
                    </div>
                  ) : (
                    selectedCell.members.map((membro: any) => (
                      <div key={membro.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:bg-secondary/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                              {(membro.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-foreground leading-none mb-1">{membro.name}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">{membro.role || "Membro"}</p>
                          </div>
                        </div>
                        <Badge variant="ghost" className="text-[9px] text-muted-foreground border-secondary/20">
                          {membro.phone || "---"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl font-bold border-secondary/50 text-muted-foreground hover:bg-secondary/5 transition-all text-sm"
              onClick={() => setIsViewOpen(false)}
            >
              Fechar Detalhes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
