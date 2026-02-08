import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, TrendingUp, Users } from "lucide-react";

const allMonths = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MemberGrowthChart() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => api.get("/dashboard"),
    });

    // Processar dados para garantir todos os meses do ano
    const rawData = dashboardData?.member_growth || [];
    const currentYear = new Date().getFullYear();

    // Normalizar dados da API
    const memberGrowthData = allMonths.map((mes, index) => {
        const monthNumber = index + 1; // 1 para Jan, 2 para Fev, etc.

        // Tenta encontrar o mês nos dados da API com várias possibilidades
        const found = rawData.find((item: any) => {
            // Se vier como número (ex: 1, 2, 12)
            if (typeof item.mes === 'number') return item.mes === monthNumber;
            if (typeof item.month === 'number') return item.month === monthNumber;

            // Se vier como string numérica (ex: "01", "1")
            if (item.mes && !isNaN(parseInt(item.mes))) return parseInt(item.mes) === monthNumber;

            // Se vier como nome abreviado (ex: "Jan", "Fev")
            if (typeof item.mes === 'string') return item.mes.toLowerCase().includes(mes.toLowerCase());

            return false;
        });

        return {
            mes,
            novos: found ? (Number(found.novos) || Number(found.count) || Number(found.total) || 0) : 0
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-[2rem] bg-card p-6 shadow-xl border-l-8 border-primary relative overflow-hidden group"
        >
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none text-primary">
                <TrendingUp className="h-40 w-40 -mr-8 -mt-8" />
            </div>

            <div className="mb-6 flex items-center gap-4 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">
                        Crescimento Anual
                    </h3>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Novos Membros ({currentYear})</p>
                </div>
            </div>

            <div className="h-[250px] relative z-10">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={memberGrowthData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted)/0.1)" vertical={false} />
                            <XAxis
                                dataKey="mes"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px',
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: '13px' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
                            />
                            <Bar
                                dataKey="novos"
                                name="Novos Membros"
                                fill="hsl(var(--primary))"
                                radius={[8, 8, 0, 0]}
                                activeBar={{ fill: 'hsl(var(--primary))', opacity: 0.8 }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}
