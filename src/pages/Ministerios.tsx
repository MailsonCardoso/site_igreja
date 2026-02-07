import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type EscalaMember = {
  name: string;
  pivot: {
    role: string;
  };
};

type Roster = {
  id: number;
  date: string;
  members: EscalaMember[];
};

type Ministry = {
  id: number;
  name: string;
};

function EscalaCard({ escala, index }: { escala: Roster; index: number }) {
  const eventDate = new Date(escala.date);
  const day = format(eventDate, "dd", { locale: ptBR });
  const month = format(eventDate, "MMM", { locale: ptBR }).toUpperCase();
  const dayName = format(eventDate, "EEEE", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
          <span className="text-lg font-semibold text-primary">{day}</span>
          <span className="text-[10px] font-medium uppercase">{month}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground capitalize">{dayName}</h3>
          <p className="text-sm text-muted-foreground">{format(eventDate, "dd/MM/yyyy")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {escala.members.map((pessoa, personIndex) => (
          <motion.div
            key={personIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 + personIndex * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                {pessoa.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{pessoa.name}</p>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              {pessoa.pivot.role}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Ministerios() {
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ministries
  const { data: ministries = [], isLoading: loadingMinistries } = useQuery<Ministry[]>({
    queryKey: ["ministries"],
    queryFn: async () => {
      const data = await api.get("/ministries");
      if (data && data.length > 0 && !selectedMinistryId) {
        setSelectedMinistryId(data[0].id.toString());
      }
      return data;
    },
  });

  // Fetch rosters for selected ministry
  const { data: rosters = [], isLoading: loadingRosters } = useQuery<Roster[]>({
    queryKey: ["rosters", selectedMinistryId],
    queryFn: () => api.get(`/ministries/${selectedMinistryId}/rosters`),
    enabled: !!selectedMinistryId,
  });

  // Mutation for generating rosters
  const generateMutation = useMutation({
    mutationFn: () => api.post(`/ministries/${selectedMinistryId}/generate-rosters`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rosters", selectedMinistryId] });
      toast({
        title: "Sucesso!",
        description: "As escalas foram geradas automaticamente para os próximos 30 dias.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a escala.",
        variant: "destructive",
      });
    },
  });

  return (
    <MainLayout title="Ministérios" breadcrumbs={[{ label: "Escalas" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-card p-6 shadow-card min-h-[600px]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Escalas de Serviço</h2>
            <p className="text-sm text-muted-foreground">Gerencie as escalas dos ministérios</p>
          </div>

          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedMinistryId}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Gerar Escala Automática
          </Button>
        </div>

        {loadingMinistries ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando ministérios...</p>
          </div>
        ) : ministries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">Nenhum ministério encontrado</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Cadastre ministérios no painel de configurações para começar a gerar escalas.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <Tabs
              value={selectedMinistryId || undefined}
              onValueChange={setSelectedMinistryId}
              className="w-full"
            >
              <TabsList className="mb-6 bg-secondary h-auto flex-wrap justify-start">
                {ministries.map((min) => (
                  <TabsTrigger
                    key={min.id}
                    value={min.id.toString()}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {min.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-0">
                {loadingRosters ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Carregando escalas...</p>
                  </div>
                ) : rosters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">Nenhuma escala para este ministério</p>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      Clique no botão "Gerar Escala Automática" para criar as escalas do mês.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {rosters.map((escala, index) => (
                      <EscalaCard key={escala.id} escala={escala} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

