import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2, PieChart as PieChartIcon, FileDown, User, Users } from "lucide-react";
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
    const summaryRef = useRef<HTMLDivElement>(null);
    const listsRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Filter lists
    const membrosList = members.filter(m => m.status !== 'visitante' && m.status !== 'afastado' && m.status !== 'inativo');
    const visitantesList = members.filter(m => m.status === 'visitante');

    // Sort alphabetically
    membrosList.sort((a, b) => (a.name || a.nome || "").localeCompare(b.name || b.nome || ""));
    visitantesList.sort((a, b) => (a.name || a.nome || "").localeCompare(b.name || b.nome || ""));

    // Calculate age distribution (only for active members)
    const ageDistribution = [
        { faixa: "0-12 Anos", quantidade: 0, fill: "#3b82f6" },
        { faixa: "13-17 Anos", quantidade: 0, fill: "#22c55e" },
        { faixa: "18-30 Anos", quantidade: 0, fill: "#f59e0b" },
        { faixa: "31-45 Anos", quantidade: 0, fill: "#ec4899" },
        { faixa: "46-60 Anos", quantidade: 0, fill: "#8b5cf6" },
        { faixa: "61+ Anos", quantidade: 0, fill: "#64748b" },
    ];

    let totalMembers = membrosList.length;
    let totalVisitors = visitantesList.length;

    membrosList.forEach((member) => {
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
        if (!summaryRef.current || !listsRef.current) return;
        setIsExporting(true);
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const dateStr = new Date().toLocaleDateString('pt-BR');
            const margin = 14;
            const contentWidth = pdfWidth - (2 * margin);

            // --- PAGE 1: Summary ---
            const canvasSummary = await html2canvas(summaryRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgDataSummary = canvasSummary.toDataURL('image/png');

            pdf.setFontSize(18);
            pdf.setTextColor(40, 40, 40);
            pdf.text("Relatório de Membros", margin, 20);
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Resumo Demográfico - Gerado em: ${dateStr}`, margin, 28);

            const imgHeightCap = (canvasSummary.height * contentWidth) / canvasSummary.width;
            pdf.addImage(imgDataSummary, 'PNG', margin, 35, contentWidth, imgHeightCap);

            // --- PAGE 2+: Nominal Lists (Improved Multi-page) ---
            const canvasLists = await html2canvas(listsRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true
            });

            const imgDataLists = canvasLists.toDataURL('image/png');
            const imgWidthLists = canvasLists.width;
            const imgHeightLists = canvasLists.height;
            const pxToMm = contentWidth / imgWidthLists;

            // Height of the header we add on each page
            const headerHeightMm = 35;
            // Available vertical space for the list image on each page (mm)
            const availableSpaceMm = pdfHeight - headerHeightMm - 20; // 20mm total top/bottom extra margin

            // Total height of the list image in mm
            const totalListHeightMm = imgHeightLists * pxToMm;

            let currentYMm = 0;
            let pageNum = 1;

            while (currentYMm < totalListHeightMm) {
                pdf.addPage();

                // Header
                pdf.setFontSize(18);
                pdf.setTextColor(40, 40, 40);
                pdf.text("Lista Nominal", margin, 20);
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Membros e Visitantes - Página ${pageNum} - Gerado em: ${dateStr}`, margin, 28);

                // Calculate the slice to show
                // We show a piece of the image starting at currentYMm/pxToMm
                const sliceHeightMm = Math.min(availableSpaceMm, totalListHeightMm - currentYMm);
                const sliceHeightPx = sliceHeightMm / pxToMm;
                const sliceYPx = currentYMm / pxToMm;

                const canvasSlice = document.createElement('canvas');
                canvasSlice.width = imgWidthLists;
                canvasSlice.height = sliceHeightPx;

                const ctx = canvasSlice.getContext('2d');
                if (ctx) {
                    // Fill background to avoid transparency issues
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvasSlice.width, canvasSlice.height);

                    ctx.drawImage(
                        canvasLists,
                        0, sliceYPx, imgWidthLists, sliceHeightPx, // Source
                        0, 0, imgWidthLists, sliceHeightPx // Destination
                    );
                    const sliceData = canvasSlice.toDataURL('image/png');
                    pdf.addImage(sliceData, 'PNG', margin, headerHeightMm, contentWidth, sliceHeightMm);
                }

                currentYMm += availableSpaceMm;
                pageNum++;
            }

            pdf.save(`relatorio-igreja-${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card overflow-y-auto">
            <div className="p-8 pb-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Relatório Administrativo</h2>
                        <p className="text-muted-foreground">Visão geral e listagem completa</p>
                    </div>
                    <Button
                        onClick={exportPDF}
                        disabled={isExporting || isLoading || totalMembers + totalVisitors === 0}
                        className="bg-primary hover:bg-primary/90 gap-2 rounded-xl"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Baixar Relatório (PDF)
                    </Button>
                </div>

                {/* Section 1: Summary (Page 1) */}
                <div ref={summaryRef} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Membros Ativos</p>
                                <h3 className="text-4xl font-black text-foreground mt-1">{totalMembers}</h3>
                            </div>
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                        </div>

                        <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Visitantes</p>
                                <h3 className="text-4xl font-black text-foreground mt-1">{totalVisitors}</h3>
                            </div>
                            <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                <User className="h-8 w-8 text-amber-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <PieChartIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold">Distribuição por Idade (Membros)</h3>
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
                                        <Tooltip formatter={(value: number) => [`${value} pessoas`, 'Quantidade']} />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            iconType="circle"
                                            formatter={(value) => (
                                                <span className="text-sm font-medium text-slate-700 ml-1">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Nominal Lists (Page 2) */}
                <div ref={listsRef} className="mt-10 space-y-8 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-bold text-foreground">Lista de Membros</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-white rounded-2xl border p-6">
                            {membrosList.length > 0 ? (
                                membrosList.map((m, i) => (
                                    <div key={m.id} className="flex items-center gap-3 py-1 border-b border-dashed border-slate-100 last:border-0">
                                        <span className="text-xs font-mono text-muted-foreground w-6">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className="text-sm font-medium text-slate-700 uppercase">{m.name || m.nome}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhum membro ativo encontrado.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2">
                            <User className="h-5 w-5 text-amber-500" />
                            <h3 className="text-xl font-bold text-foreground">Lista de Visitantes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-white rounded-2xl border p-6">
                            {visitantesList.length > 0 ? (
                                visitantesList.map((m, i) => (
                                    <div key={m.id} className="flex items-center gap-3 py-1 border-b border-dashed border-slate-100 last:border-0">
                                        <span className="text-xs font-mono text-muted-foreground w-6">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className="text-sm font-medium text-slate-700 uppercase">{m.name || m.nome}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhum visitante encontrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
