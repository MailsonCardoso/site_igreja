import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { escalasLouvor, escalasInfantil, escalasRecepcao } from "@/data/mockData";

type EscalaItem = {
  data: string;
  diaSemana: string;
  equipe: { nome: string; funcao: string; avatar: string }[];
};

function EscalaCard({ escala, index }: { escala: EscalaItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
          <span className="text-lg font-bold text-primary">{escala.data.split("/")[0]}</span>
          <span className="text-[10px] font-medium uppercase">
            {escala.data.split("/")[1] === "02" ? "FEV" : "MAR"}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{escala.diaSemana}</h3>
          <p className="text-sm text-muted-foreground">{escala.data}</p>
        </div>
      </div>

      <div className="space-y-3">
        {escala.equipe.map((pessoa, personIndex) => (
          <motion.div
            key={personIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 + personIndex * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                {pessoa.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{pessoa.nome}</p>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              {pessoa.funcao}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Ministerios() {
  const [activeTab, setActiveTab] = useState("louvor");

  const getEscalas = () => {
    switch (activeTab) {
      case "louvor":
        return escalasLouvor;
      case "infantil":
        return escalasInfantil;
      case "recepcao":
        return escalasRecepcao;
      default:
        return escalasLouvor;
    }
  };

  return (
    <MainLayout title="Ministérios" breadcrumbs={[{ label: "Escalas" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-card p-6 shadow-card"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Escalas de Serviço</h2>
            <p className="text-sm text-muted-foreground">Gerencie as escalas dos ministérios</p>
          </div>
          
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Wand2 className="h-4 w-4" />
            Gerar Escala Automática
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="louvor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Louvor
            </TabsTrigger>
            <TabsTrigger value="infantil" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Infantil
            </TabsTrigger>
            <TabsTrigger value="recepcao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recepção
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {getEscalas().map((escala, index) => (
                <EscalaCard key={index} escala={escala} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
