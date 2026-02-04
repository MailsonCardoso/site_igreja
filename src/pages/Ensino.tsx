import { motion } from "framer-motion";
import { BookOpen, Users, ClipboardCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cursos } from "@/data/mockData";

export default function Ensino() {
  return (
    <MainLayout title="Ensino" breadcrumbs={[{ label: "EBD / Cursos" }]}>
      <div className="space-y-4">
        {cursos.map((curso, index) => {
          const progresso = (curso.aulasConcluidas / curso.aulasTotal) * 100;
          const concluido = progresso === 100;
          
          return (
            <motion.div
              key={curso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{curso.nome}</h3>
                      {concluido && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Concluído
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{curso.turma}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {curso.alunos} alunos
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{curso.professor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 sm:min-w-48">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Progresso</span>
                      <span className="text-sm font-bold text-foreground">
                        {curso.aulasConcluidas}/{curso.aulasTotal} aulas
                      </span>
                    </div>
                    <Progress value={progresso} className="h-2" />
                  </div>
                  
                  <Button
                    variant={concluido ? "outline" : "default"}
                    size="sm"
                    className={concluido 
                      ? "gap-2" 
                      : "gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    }
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {concluido ? "Ver Relatório" : "Realizar Chamada"}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </MainLayout>
  );
}
