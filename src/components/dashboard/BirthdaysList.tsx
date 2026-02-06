import { motion } from "framer-motion";
import { Cake, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function BirthdaysList() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  const birthdays = dashboardData?.birthdays || [];
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Aniversariantes do Mês</h3>
          <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Cake className="h-5 w-5 text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : birthdays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Cake className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nenhum aniversariante este mês</p>
        </div>
      ) : (
        <div className="space-y-3">
          {birthdays.map((pessoa: any, index: number) => (
            <motion.div
              key={pessoa.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary/50"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                  {pessoa.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{pessoa.name}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-sm font-bold text-primary">{pessoa.day}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
