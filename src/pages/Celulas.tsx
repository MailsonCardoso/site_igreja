import { useState } from "react";
import { motion } from "framer-motion";
import { User, Clock, Plus, Loader2, Save, X } from "lucide-react";
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

export default function Celulas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Cells
  const { data: celulasResponse, isLoading } = useQuery({
    queryKey: ["cells"],
    queryFn: async () => {
      const response = await api.get("/cells");
      return response.data;
    },
  });
  const celulas = Array.isArray(celulasResponse) ? celulasResponse : [];

  // Fetch Members (for Leader selection)
  const { data: membersResponse } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response.data;
    },
  });
  const members = Array.isArray(membersResponse) ? membersResponse : [];

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

  const { reset, setValue, watch } = form;

  // Create Cell Mutation
  const createCellMutation = useMutation({
    mutationFn: (newCell: any) => api.post("/cells", newCell),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cells"] });
      toast.success("Célula criada com sucesso!");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar célula");
    },
  });

  const onSubmit = (data: any) => {
    createCellMutation.mutate(data);
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
                  <div>
                    <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-none">{celula.name}</h3>
                    <Badge variant="outline" className="mt-2 border-primary/20 text-primary uppercase text-[8px] font-black tracking-widest px-2 py-0">
                      {celula.meeting_day || "Samba-feira"}
                    </Badge>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
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

      {/* Modal de Cadastro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 hover:bg-white/20 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-3xl font-black mb-2">Nova Célula</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 font-medium">
              Preencha os dados abaixo para criar um novo pequeno grupo.
            </DialogDescription>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nome da Célula</Label>
              <Input
                id="name"
                {...form.register("name", { required: true })}
                placeholder="Ex: Célula Esperança"
                className="h-12 rounded-xl border-secondary bg-secondary/10 focus:bg-background font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dia da Semana</Label>
                <Select onValueChange={(val) => setValue("meeting_day", val)} value={watch("meeting_day")}>
                  <SelectTrigger className="h-12 rounded-xl border-secondary bg-secondary/10 font-bold">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(dia => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_time" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Horário</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  {...form.register("meeting_time")}
                  className="h-12 rounded-xl border-secondary bg-secondary/10 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Líder da Célula</Label>
              <Select onValueChange={(val) => setValue("leader_id", val)} value={watch("leader_id")}>
                <SelectTrigger className="h-12 rounded-xl border-secondary bg-secondary/10 font-bold">
                  <SelectValue placeholder="Selecione um líder" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Capacidade Máxima</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity")}
                className="h-12 rounded-xl border-secondary bg-secondary/10 font-bold"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold border-secondary text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCellMutation.isPending}
                className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg"
              >
                {createCellMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Salvar Célula</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
