import { motion } from "framer-motion";
import { User, Clock, Plus, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Celulas() {
  const { data: celulas = [], isLoading } = useQuery({
    queryKey: ["cells"],
    queryFn: async () => {
      const response = await api.get("/cells");
      return response.data;
    },
  });

  return (
    <MainLayout
      title="Células"
      breadcrumbs={[{ label: "Grupos" }]}
      actions={
        <Button className="bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Nova Célula
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : celulas.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-secondary/20 bg-secondary/5 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Nenhuma célula encontrada</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Comece criando sua primeira célula para organizar os pequenos grupos da sua igreja.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group rounded-3xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 hover:border-primary/20"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">{celula.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mt-0.5">Pequeno Grupo</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase text-[10px] font-black">
                    {celula.meeting_day || "S/D"}
                  </Badge>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 transition-transform group-hover:scale-110">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Líder</span>
                      <span className="text-sm font-bold text-foreground truncate">{celula.leader?.name || "Não atribuído"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-110">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Horário</span>
                      <span className="text-sm font-bold text-foreground">{celula.meeting_time || "Não definido"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Lotação</span>
                    <span className="text-sm font-black text-foreground">
                      {numMembros}/{capacidade} <span className="text-primary ml-1">({Math.round(ocupacao)}%)</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
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
    </MainLayout>
  );
}
