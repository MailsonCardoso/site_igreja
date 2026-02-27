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
    Cell,
    Legend
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

    // Busca do Histórico Real (Sempre os 12 meses do ano selecionado)
    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["report", "history", selectedYear], // Chave fixa no ano para não mudar ao trocar o mês
        queryFn: async () => {
            // Buscamos sempre os 12 meses para o gráfico ficar fixo
            const promises = Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString();
                return api.get(`/transactions/report?month=${month}&year=${selectedYear}`);
            });

            const results = await Promise.all(promises);

            return results.map((data, index) => ({
                name: meses[index].label.substring(0, 3),
                valor: data?.total_expense || 0,
                receita: data?.total_income || 0,
                fullValue: data?.total_expense || 0,
                monthIndex: index + 1
            }));
        },
    });

    const chartData = historyData || [];
    const maxExpense = chartData.length > 0 ? Math.max(...chartData.map(d => d.valor)) : 0;

    const handlePrint = () => {
        const printContent = document.getElementById("analytics-page");
        if (!printContent) return;

        // Captura as seções marcadas para quebra de página
        const sections = Array.from(printContent.querySelectorAll('.print-section'));

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

        const churchName = churchSettings?.nome || 'IPR JAGUAREMA';
        const periodLabel = `${meses.find(m => m.value === selectedMonth)?.label} / ${selectedYear}`;
        const generationDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

        doc.open();
        doc.write(`
      <html>
        <head>
          <title>Análise Financeira - ${churchName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            
            @media print {
              @page { size: landscape; margin: 0; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }

            body { 
              font-family: 'Inter', sans-serif; 
              color: #1e293b; 
              background: white; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
            }
            
            .print-page {
              break-after: page;
              page-break-after: always;
              min-height: 190mm; /* Força altura mínima próxima ao A4 paisagem */
              padding: 1.5cm;
              box-sizing: border-box;
              display: block; /* Voltar para block para evitar bugs de flex em quebras de página */
              position: relative;
              overflow: hidden;
            }
            
            .print-page:last-child {
              page-break-after: auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }

            .header .title { font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
            .header .subtitle { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
            .header .page-info { font-size: 11px; font-weight: 800; color: #94a3b8; margin-top: 4px; }

            .section-content {
              width: 100%;
              margin-top: 20px;
            }

            .footer {
              position: absolute;
              bottom: 0.8cm;
              left: 1.5cm;
              right: 1.5cm;
              border-top: 1px solid #f1f5f9;
              padding-top: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-weight: 600;
              color: #94a3b8;
            }

            /* Tailwind Utility Emulation */
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .items-center { align-items: center !important; }
            .items-end { align-items: flex-end !important; }
            .gap-2 { gap: 8px !important; }
            .gap-3 { gap: 12px !important; }
            .gap-4 { gap: 16px !important; }
            .gap-6 { gap: 24px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .space-y-6 > * + * { margin-top: 24px !important; }
            .w-full { width: 100% !important; }
            .h-full { height: 100% !important; }
            .text-center { text-align: center !important; }
            .font-bold { font-weight: 700 !important; }
            .font-extrabold { font-weight: 800 !important; }
            .font-black { font-weight: 900 !important; }
            .uppercase { text-transform: uppercase !important; }
            .italic { font-style: italic !important; }
            .tracking-widest { letter-spacing: 0.1em !important; }
            .leading-none { line-height: 1 !important; }
            
            /* Component Fixes */
            .rounded-\[2\.5rem\] { border-radius: 2rem !important; border: 1px solid #e2e8f0 !important; background: white !important; overflow: hidden; page-break-inside: avoid; }
            .bg-card { background: white !important; }
            .p-8 { padding: 2rem !important; }
            .p-10 { padding: 2.5rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .pl-8 { padding-left: 2rem !important; }
            .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
            .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
            .mt-6 { margin-top: 1.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mb-10 { margin-bottom: 2.5rem !important; }

            .grid { display: grid !important; gap: 30px !important; }
            .md\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            
            .h-\[350px\] { height: 380px !important; width: 100% !important; margin-top: 20px; }
            
            .text-emerald-600 { color: #059669 !important; }
            .text-rose-600 { color: #dc2626 !important; }
            .text-muted-foreground { color: #64748b !important; }
            .text-foreground { color: #0f172a !important; }
            .text-xs { font-size: 12px !important; }
            .text-sm { font-size: 14px !important; }
            .text-lg { font-size: 18px !important; }
            .text-xl { font-size: 20px !important; }
            .text-2xl { font-size: 24px !important; }
            .text-3xl { font-size: 30px !important; }

            /* Progress Bar Fix */
            .h-2 { height: 8px !important; border-radius: 9999px !important; position: relative; width: 100% !important; overflow: hidden; }
            .bg-emerald-500\/10 { background-color: #ecfdf5 !important; }
            .bg-rose-500\/10 { background-color: #fff1f2 !important; }
            .bg-emerald-500 { background-color: #10b981 !important; border-radius: 9999px !important; }
            .bg-rose-500 { background-color: #ef4444 !important; border-radius: 9999px !important; }
            
            /* DRE and Result Boxes */
            .bg-blue-50 { background-color: #eff6ff !important; border-radius: 1rem !important; }
            .bg-rose-50 { background-color: #fff1f2 !important; border-radius: 1rem !important; }
            .border-blue-100 { border: 1px solid #dbeafe !important; }
            .border-rose-100 { border: 1px solid #ffe4e6 !important; }
            .text-blue-900 { color: #1e3a8a !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-rose-900 { color: #881337 !important; }
            .border-b-2 { border-bottom: 2px solid #f1f5f9 !important; }
            .border-b { border-bottom: 1px solid #f1f5f9 !important; }

            /* Ajuste para itens de lista e DRE */
            .item-row { 
              display: flex !important; 
              justify-content: space-between !important; 
              align-items: center !important; 
              width: 100% !important;
              padding: 8px 0 !important;
            }
            
            .item-label { font-weight: 700 !important; color: #1e293b !important; }
            .item-value { font-weight: 900 !important; text-align: right !important; min-width: 120px !important; }

            canvas { max-width: 100% !important; height: auto !important; }
            .recharts-responsive-container { width: 100% !important; height: 100% !important; }
            
            /* Garantir que as barras de progresso não sumam */
            progress, .h-2 div { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${sections.map((section, index) => `
            <div class="print-page">
              <div class="header">
                <div class="titles">
                  <div class="title">${churchName}</div>
                  <div class="subtitle">Análise Financeira Inteligente</div>
                </div>
                <div style="text-align: right">
                  <div class="subtitle" style="color: #3b82f6">${periodLabel}</div>
                  <div class="page-info">PÁGINA ${index + 1} DE ${sections.length}</div>
                </div>
              </div>
              
              <div class="section-content">
                ${section.innerHTML}
              </div>

              <div class="footer">
                <div>Relatório Gerencial - Sistema de Gestão Eclesiástica</div>
                <div>Gerado em ${generationDate}</div>
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => {
                  window.parent.document.body.removeChild(window.frameElement);
                };
              }, 800);
            };
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
                    className="rounded-[2.5rem] bg-card p-8 shadow-card border border-border/50 relative overflow-hidden print-section"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Equilíbrio Financeiro</h3>
                            <p className="text-sm text-muted-foreground font-medium">Comparativo anual: Entradas vs Saídas</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-600 text-[10px] font-extrabold uppercase">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Entradas
                            </div>
                            <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 text-rose-600 text-[10px] font-extrabold uppercase">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Saídas
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative">
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
                                                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 space-y-3">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payload[0].payload.name}</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Receita</span>
                                                            </div>
                                                            <span className="text-sm font-black text-emerald-600">{formatCurrency(payload[0].payload.receita)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Despesa</span>
                                                            </div>
                                                            <span className="text-sm font-black text-rose-600">{formatCurrency(payload[0].payload.valor)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="receita"
                                    fill="#10b981"
                                    radius={[6, 6, 0, 0]}
                                    barSize={20}
                                    name="Receita"
                                />
                                <Bar
                                    dataKey="valor"
                                    radius={[6, 6, 0, 0]}
                                    barSize={20}
                                    name="Despesa"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.valor === maxExpense && entry.valor > 0 ? '#f43f5e' : '#fda4af'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Detalhamento por Categoria (Lado a Lado) */}
                <div className="grid gap-6 md:grid-cols-2 print-section">
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
                                    <div key={cat} className="space-y-4">
                                        <div className="item-row">
                                            <div className="flex flex-col">
                                                <span className="text-sm item-label">{cat}</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold">{percentage}% da arrecadação</span>
                                            </div>
                                            <span className="text-sm item-value text-emerald-600">{formatCurrency(value)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-emerald-500/10 rounded-full">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                                        </div>
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
                                    <div key={cat} className="space-y-4">
                                        <div className="item-row">
                                            <div className="flex flex-col">
                                                <span className="text-sm item-label">{cat}</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold">{percentage}% do custeio</span>
                                            </div>
                                            <span className="text-sm item-value text-rose-600">{formatCurrency(value)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-rose-500/10 rounded-full">
                                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${percentage}%` }} />
                                        </div>
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
                    className="rounded-[2.5rem] bg-card p-10 shadow-card border border-border/50 overflow-hidden print-section"
                >
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-bold text-foreground">Demonstrativo de Resultado (DRE)</h3>
                        <p className="text-muted-foreground font-medium">Resumo consolidado operacional</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="item-row border-b-2 border-slate-100">
                            <span className="font-bold text-emerald-600 uppercase text-xs tracking-widest leading-none flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> (+) Receita Total
                            </span>
                            <span className="item-value text-emerald-600">{formatCurrency(reportData?.total_income || 0)}</span>
                        </div>

                        <div className="item-row pl-8 text-muted-foreground italic">
                            <span className="text-xs font-semibold">Dízimos</span>
                            <span className="text-sm font-bold">{formatCurrency(reportData?.grouped_data?.entrada?.["Dízimo"]?.total || 0)}</span>
                        </div>

                        <div className="item-row pl-8 text-muted-foreground italic border-b border-slate-50">
                            <span className="text-xs font-semibold">Ofertas</span>
                            <span className="text-sm font-bold">{formatCurrency(reportData?.grouped_data?.entrada?.["Oferta"]?.total || 0)}</span>
                        </div>

                        <div className="item-row border-b-2 border-slate-100">
                            <span className="font-bold text-rose-600 uppercase text-xs tracking-widest flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" /> (-) Despesas Totais
                            </span>
                            <span className="item-value text-rose-600">{formatCurrency(reportData?.total_expense || 0)}</span>
                        </div>

                        <div className={`mt-6 item-row p-6 rounded-2xl ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'bg-blue-50 border border-blue-100' : 'bg-rose-50 border border-rose-100'}`}>
                            <span className={`text-lg font-black uppercase tracking-tighter ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'text-blue-900' : 'text-rose-900'}`}>
                                (=) Resultado Líquido (Saldo)
                            </span>
                            <span className={`text-3xl font-black tabular-nums ${reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                {formatCurrency(reportData?.previous_balance + (reportData?.total_income - reportData?.total_expense) || 0)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
}
