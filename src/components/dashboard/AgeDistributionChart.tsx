import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

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
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Distribuição por Faixa Etária</h3>
        <p className="text-sm text-muted-foreground">Total de membros ativos por idade</p>
      </div>

      <div className="h-64">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-4">
            <p className="text-sm font-medium">Nenhum dado de idade disponível.</p>
            <p className="text-xs">Certifique-se de cadastrar a data de nascimento dos membros.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ageData}
                cx="40%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="quantidade"
                nameKey="faixa"
              >
                {ageData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number) => [`${value} membros`, 'Quantidade']}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-xs font-semibold text-muted-foreground ml-2">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
