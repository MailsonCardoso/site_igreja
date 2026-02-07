import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Folder, Plus, BookOpen, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const mockSeries = [
    {
        id: 1,
        title: "Estudos em Romanos",
        description: "Uma jornada expositiva pela epístola de Paulo.",
        progress: 33, // 4 de 12
        total: 12,
        completed: 4,
        color: "bg-blue-500",
        coverColor: "from-blue-500/20 to-blue-500/5",
        startDate: "Jan 2024"
    },
    {
        id: 2,
        title: "Salmos de Confiança",
        description: "Encontrando paz em meio às tormentas da vida.",
        progress: 100, // 5 de 5
        total: 5,
        completed: 5,
        color: "bg-green-500",
        coverColor: "from-green-500/20 to-green-500/5",
        startDate: "Dez 2023"
    },
    {
        id: 3,
        title: "Família Cristã",
        description: "Princípios bíblicos para o lar.",
        progress: 0,
        total: 8,
        completed: 0,
        color: "bg-amber-500",
        coverColor: "from-amber-500/20 to-amber-500/5",
        startDate: "Mar 2024"
    }
];

export default function Series() {
    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar", href: "/pastor" }, { label: "Séries" }]}>
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-foreground">Séries de Mensagens</h2>
                        <p className="text-muted-foreground">Organize suas pregações em jornadas temáticas.</p>
                    </div>
                    <Button className="font-semibold gap-2 shadow-lg h-10 px-6 rounded-xl">
                        <Plus className="h-4 w-4" /> Nova Série
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockSeries.map((serie) => (
                        <Card key={serie.id} className="group hover:shadow-xl transition-all duration-300 rounded-2xl border-border/50 overflow-hidden bg-card cursor-pointer hover:-translate-y-1">
                            <div className={`h-32 w-full bg-gradient-to-br ${serie.coverColor} flex items-center justify-center`}>
                                <BookOpen className={`h-12 w-12 ${serie.color.replace('bg-', 'text-')}`} />
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl font-bold">{serie.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1">{serie.description}</CardDescription>
                                    </div>
                                    {serie.progress === 100 && (
                                        <Badge className="bg-green-500 hover:bg-green-600 border-none">Concluída</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <span>Progresso</span>
                                        <span>{serie.completed} de {serie.total} Pregadas</span>
                                    </div>
                                    <Progress value={serie.progress} className="h-2" indicatorClassName={serie.color} />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between items-center text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Folder className="h-3.5 w-3.5" /> {serie.total} Arquivos
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Início: {serie.startDate}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Card Nova Série Placeholder */}
                    <button className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-muted bg-muted/5 hover:bg-muted/10 transition-all min-h-[300px] text-muted-foreground hover:text-foreground">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="font-semibold">Criar Nova Série</span>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
