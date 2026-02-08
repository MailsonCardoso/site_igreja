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
      className="rounded-[2rem] bg-card p-8 shadow-xl border-l-8 border-orange-500 relative overflow-hidden group"
    >
      <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none text-orange-500">
        <Cake className="h-48 w-48 -mr-10 -mt-10" />
      </div>

      <div className="mb-6 flex items-center gap-4 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-inner">
          <Cake className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Aniversariantes</h3>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{currentMonth}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : birthdays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-secondary/5 rounded-3xl border border-secondary/20 relative z-10">
          <Cake className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium opacity-50">Nenhum aniversariante este mês</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {birthdays.map((pessoa: any, index: number) => (
            <motion.div
              key={pessoa.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-4 rounded-2xl p-3 bg-secondary/5 border border-secondary/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group/item"
            >
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold">
                  {pessoa.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-foreground group-hover/item:text-orange-600 transition-colors">{pessoa.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Parabéns!</p>
              </div>
              <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-background shadow-sm border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-0.5">{currentMonth.slice(0, 3)}</span>
                <span className="text-sm font-black text-orange-500 leading-none">{pessoa.day}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
