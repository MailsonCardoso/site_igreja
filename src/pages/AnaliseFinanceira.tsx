import { useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    FileDown,
    Calendar,
    Package,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp as TrendingUpIcon,
    Loader2
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

const meses = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
];

const anos = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

// Categorias obrigatórias conforme solicitado
const incomeCategories = ["Dízimo", "Oferta", "Doação", "Evento", "Outros"];
const expenseCategories = ["Aluguel", "Luz/Água", "Manutenção", "Missões", "Salários", "Outros"];

export default function AnaliseFinanceira() {
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // Dados da Igreja para o PDF
    const { data: churchSettings } = useQuery({
        queryKey: ["settings"],
        queryFn: () => api.get("/settings"),
    });

    // Relatório do mês selecionado (DRE e Listas)
    const { data: reportData, isLoading: isLoadingCurrent } = useQuery({
        queryKey: ["report", "analytics", selectedMonth, selectedYear],
        queryFn: () => api.get(`/transactions/report?month=${selectedMonth}&year=${selectedYear}`),
    });

    // Busca do Histórico Real (Janeiro até o mês selecionado)
    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["report", "history", selectedYear, selectedMonth],
        queryFn: async () => {
            const currentMonthInt = parseInt(selectedMonth);
            const history = [];

            // Criamos uma lista de promessas para buscar todos os meses de Jan até o selecionado
            const promises = Array.from({ length: currentMonthInt }, (_, i) => {
                const month = (i + 1).toString();
                return api.get(`/transactions/report?month=${month}&year=${selectedYear}`);
            });

            const results = await Promise.all(promises);

            return results.map((data, index) => ({
                name: meses[index].label.substring(0, 3),
                valor: data?.total_expense || 0,
                fullValue: data?.total_expense || 0
            }));
        },
    });

    const chartData = historyData || [];
    const maxExpense = chartData.length > 0 ? Math.max(...chartData.map(d => d.valor)) : 0;

    const handlePrint = () => {
        const printContent = document.getElementById("analytics-page");
        if (!printContent) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
      <html>
        <head>
          <title>Análise Financeira - ${churchSettings?.nome || 'Igreja'}</title>
          <style>
             @page { margin: 1cm; size: A4 landscape; }
             body { font-family: sans-serif; padding: 20px; color: #333; }
             .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
             .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
             .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
             .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
             .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
             .dre-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
             .dre-table th, .dre-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
             .dre-table th { background: #f8f9fa; }
             .total-row { font-weight: bold; background: #f1f5f9; }
             .text-success { color: #16a34a; }
             .text-destructive { color: #dc2626; }
             .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${churchSettings?.nome || 'IGREJA COMUNIDADE CRISTÃ'}</div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">ANÁLISE E INTELIGÊNCIA FINANCEIRA - ${meses.find(m => m.value === selectedMonth)?.label} / ${selectedYear}</div>
          </div>
          ${printContent.innerHTML}
          <script>
            setTimeout(() => {
              window.print();
              window.onafterprint = () => {
                window.parent.document.body.removeChild(window.frameElement);
              };
            }, 500);
          </script>
        </body>
      </html>
    `);
        doc.close();
    };

    const getPercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <MainLayout title="Análise Financeira" breadcrumbs={[{ label: "Financeiro", href: "/financeiro" }, { label: "Análise" }]}>
            {/* Barra de Controle */}
            <div className="flex flex-col gap-6 mb-8 sm:flex-row sm:items-center sm:justify-between no-print">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                        <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Inteligência Estratégica</h2>
                        <p className="text-muted-foreground font-medium text-xs">Visualize tendências e performance do período</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[160px] h-11 rounded-xl font-bold bg-card border-secondary/30">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {meses.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[110px] h-11 rounded-xl font-semibold bg-card border-secondary/30">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {anos.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handlePrint}
                        variant="default"
                        className="h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold px-6 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <FileDown className="h-5 w-5" />
                        Gerar PDF
                    </Button>
                </div>
            </div>

            <div id="analytics-page" className="space-y-8 pb-10">
                {/* Gráfico de Evolução */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] bg-card p-8 shadow-card border border-border/50 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Evolução das Despesas</h3>
                            <p className="text-sm text-muted-foreground font-medium">Comparativo dos últimos 6 meses</p>
                        </div>
                        <div className="bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20 text-rose-600 text-[10px] font-extrabold uppercase tracking-wider">
                            Destaque Mensal
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative">
                        {isLoadingHistory ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm z-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                <p className="text-xs font-bold text-muted-foreground uppercase">Sincronizando Histórico...</p>
                            </div>
                        ) : null}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{payload[0].payload.name}</p>
                                                    <p className="text-sm font-extrabold text-slate-900">{formatCurrency(payload[0].value as number)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="valor"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.valor === maxExpense ? '#f43f5e' : '#fda4af'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Detalhamento por Categoria (Lado a Lado) */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Receitas */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2.5rem] bg-card p-8 shadow-card border border-border/50"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Receitas por Categoria</h3>
                        </div>

                        <div className="space-y-6">
                            {incomeCategories.map((cat, i) => {
                                const totalIncome = reportData?.total_income || 0;
                                const value = reportData?.grouped_data?.entrada?.[cat]?.total || 0;
                                const percentage = getPercentage(value, totalIncome);

                                return (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{cat}</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold">{percentage}% da arrecadação</span>
                                            </div>
                                            <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(value)}</span>
                                        </div>
                                        <Progress value={percentage} className="h-2 bg-emerald-500/10">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                                        </Progress>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Despesas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2.5rem] bg-card p-8 shadow-card border border-border/50"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                                <ArrowDownRight className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Despesas por Categoria</h3>
                        </div>

                        <div className="space-y-6">
                            {expenseCategories.map((cat, i) => {
                                const totalExpense = reportData?.total_expense || 0;
                                const value = reportData?.grouped_data?.saida?.[cat]?.total || 0;
                                const percentage = getPercentage(value, totalExpense);

                                return (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{cat}</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold">{percentage}% do custeio</span>
                                            </div>
                                            <span className="text-sm font-extrabold text-rose-600">{formatCurrency(value)}</span>
                                        </div>
                                        <Progress value={percentage} className="h-2 bg-rose-500/10">
                                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${percentage}%` }} />
                                        </Progress>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Demonstrativo de Resultado (DRE) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-[2.5rem] bg-card p-10 shadow-card border border-border/50 overflow-hidden"
                >
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-bold text-foreground">Demonstrativo de Resultado (DRE)</h3>
                        <p className="text-muted-foreground font-medium">Resumo consolidado operacional</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-2">
                        <div className="flex justify-between py-4 border-b-2 border-slate-100">
                            <span className="font-bold text-emerald-600 uppercase text-xs tracking-widest leading-none flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> (+) Receita Total
                            </span>
                            <span className="font-extrabold text-emerald-600">{formatCurrency(reportData?.total_income || 0)}</span>
                        </div>

                        <div className="flex justify-between py-2 pl-8 text-muted-foreground italic">
                            <span className="text-xs font-semibold">Dízimos</span>
                            <span className="text-sm font-bold">{formatCurrency(reportData?.grouped_data?.entrada?.["Dízimo"]?.total || 0)}</span>
                        </div>

                        <div className="flex justify-between py-2 pl-8 text-muted-foreground italic border-b border-slate-50">
                            <span className="text-xs font-semibold">Ofertas</span>
                            <span className="text-sm font-bold">{formatCurrency(reportData?.grouped_data?.entrada?.["Oferta"]?.total || 0)}</span>
                        </div>

                        <div className="flex justify-between py-4 border-b-2 border-slate-100">
                            <span className="font-bold text-rose-600 uppercase text-xs tracking-widest flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" /> (-) Despesas Totais
                            </span>
                            <span className="font-extrabold text-rose-600">{formatCurrency(reportData?.total_expense || 0)}</span>
                        </div>

                        <div className={`mt-6 flex justify-between items-center p-6 rounded-2xl ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-rose-50 border border-rose-100'}`}>
                            <span className={`text-lg font-black uppercase tracking-tighter ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'text-indigo-900' : 'text-rose-900'}`}>
                                (=) Resultado Líquido (Saldo)
                            </span>
                            <span className={`text-3xl font-black tabular-nums ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                {formatCurrency(reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) || 0)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
}
