import { motion } from "framer-motion";
import { User, Clock, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Progress } from "@/components/ui/progress";
import { celulas } from "@/data/mockData";

export default function Celulas() {
  return (
    <MainLayout title="Células" breadcrumbs={[{ label: "Grupos" }]}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {celulas.map((celula, index) => {
          const ocupacao = (celula.membros / celula.capacidade) * 100;
          
          return (
            <motion.div
              key={celula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{celula.nome}</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{celula.lider}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{celula.horario}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{celula.bairro}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Lotação</span>
                  <span className="text-xs font-bold text-foreground">
                    {celula.membros}/{celula.capacidade}%
                  </span>
                </div>
                <Progress value={ocupacao} className="h-2" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </MainLayout>
  );
}
