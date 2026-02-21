import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2, PieChart as PieChartIcon, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { differenceInYears, parseISO } from "date-fns";

interface MembersReportProps {
    members: any[];
    isLoading: boolean;
}

export function MembersReport({ members, isLoading }: MembersReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Calculate age distribution
    const ageDistribution = [
        { faixa: "0-12 Anos", quantidade: 0, fill: "#3b82f6" },
        { faixa: "13-17 Anos", quantidade: 0, fill: "#22c55e" },
        { faixa: "18-30 Anos", quantidade: 0, fill: "#f59e0b" },
        { faixa: "31-45 Anos", quantidade: 0, fill: "#ec4899" },
        { faixa: "46-60 Anos", quantidade: 0, fill: "#8b5cf6" },
        { faixa: "61+ Anos", quantidade: 0, fill: "#64748b" },
    ];

    let totalMembers = 0;

    members.forEach((member) => {
        // We only count members and congregados for this report
        if (member.status === 'afastado' || member.status === 'visitante') return;

        totalMembers++;

        if (member.birth_date) {
            const age = differenceInYears(new Date(), parseISO(member.birth_date));
            if (age <= 12) ageDistribution[0].quantidade++;
            else if (age <= 17) ageDistribution[1].quantidade++;
            else if (age <= 30) ageDistribution[2].quantidade++;
            else if (age <= 45) ageDistribution[3].quantidade++;
            else if (age <= 60) ageDistribution[4].quantidade++;
            else ageDistribution[5].quantidade++;
        }
    });

    const hasData = ageDistribution.some(d => d.quantidade > 0);

    const exportPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add a header
            pdf.setFontSize(20);
            pdf.setTextColor(40, 40, 40);
            pdf.text("Relatório de Membros", 14, 20);
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

            pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);
            pdf.save('relatorio-membros.pdf');
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="p-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Resumo Demográfico</h2>
                        <p className="text-muted-foreground">Distribuição e quantidade de membros</p>
                    </div>
                    <Button
                        onClick={exportPDF}
                        disabled={isExporting || isLoading || totalMembers === 0}
                        className="bg-primary hover:bg-primary/90 gap-2 rounded-xl"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Baixar PDF
                    </Button>
                </div>

                {/* The content to be exported */}
                <div ref={reportRef} className="p-6 bg-card border rounded-2xl shadow-sm mb-4">
                    <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total de Pessoas</p>
                            <h3 className="text-4xl font-black text-foreground mt-1">{totalMembers}</h3>
                        </div>
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl font-black text-primary">I</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <PieChartIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold">Faixa Etária</h3>
                        </div>

                        <div className="h-72">
                            {isLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : !hasData ? (
                                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                    <p className="text-sm font-medium">Nenhum dado de idade cadastrado.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ageDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="quantidade"
                                            nameKey="faixa"
                                        >
                                            {ageDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke="#ffffff" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value} pessoas`, 'Quantidade']}
                                        />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            iconType="circle"
                                            formatter={(value, entry: any) => (
                                                <span className="text-sm font-medium text-slate-700 ml-1">
                                                    {value} <span className="text-muted-foreground ml-2 font-bold">({entry.payload.quantidade})</span>
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* List format */}
                        {hasData && (
                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-6">
                                {ageDistribution.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase">{item.faixa}</p>
                                            <p className="text-lg font-black">{item.quantidade} <span className="text-xs font-medium text-muted-foreground normal-case">pessoas</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
