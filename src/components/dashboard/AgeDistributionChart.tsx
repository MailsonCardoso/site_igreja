import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";

export function AgeDistributionChart() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  const ageData = dashboardData?.age_distribution || [];
  const hasData = ageData.some((item: any) => item.quantidade > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-[2rem] bg-card p-8 shadow-xl border-l-8 border-blue-500 relative overflow-hidden group"
    >
      <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none text-blue-500">
        <PieChartIcon className="h-48 w-48 -mr-10 -mt-10" />
      </div>

      <div className="mb-6 flex items-center gap-4 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-inner">
          <PieChartIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Distribuição por Faixa Etária</h3>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Membros Ativos por Idade</p>
        </div>
      </div>

      <div className="h-64 relative z-10">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-4 bg-secondary/5 rounded-3xl border border-secondary/20">
            <PieChartIcon className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Nenhum dado de idade disponível.</p>
            <p className="text-[10px] opacity-60">Certifique-se de cadastrar a data de nascimento dos membros.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="quantidade"
                nameKey="faixa"
              >
                {ageData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke="hsl(var(--card))" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '13px' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}
                formatter={(value: number) => [`${value} membros`, 'Quantidade']}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[11px] font-bold text-muted-foreground ml-2 uppercase tracking-wide">
                    {value}
                  </span>
                )}
                wrapperStyle={{ paddingLeft: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
