import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    BookOpen,
    Mic2,
    Search,
    Plus,
    Calendar,
    Clock,
    MoreVertical,
    PenTool,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
export const mockSermons = [
    {
        id: 1,
        title: "Justificados pela Fé",
        series: "Estudos em Romanos",
        verse: "Romanos 5:1",
        date: "2026-02-15",
        status: "Planejado",
        color: "bg-amber-400",
        content: {
            intro: "A paz com Deus é o fundamento da nossa alegria...",
            topics: [
                "A natureza da justificação",
                "Paz com Deus vs Sentimento de Paz",
                "Acesso à Graça"
            ],
            conclusion: "Portanto, alegremo-nos na esperança da glória de Deus."
        }
    },
    {
        id: 2,
        title: "O Senhor é meu Pastor",
        series: "Salmos de Confiança",
        verse: "Salmos 23:1",
        date: "2026-02-08",
        status: "Pregado",
        color: "bg-green-500",
        content: {
            intro: "Neste salmo tão conhecido, Davi expressa...",
            topics: [],
            conclusion: ""
        }
    },
    {
        id: 3,
        title: "Vencendo a Ansiedade",
        series: "Avulsos",
        verse: "Filipenses 4:6-7",
        date: "2026-02-01",
        status: "Pregado",
        color: "bg-blue-500",
        content: { intro: "", topics: [], conclusion: "" }
    }
];

export default function Altar() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSermons = mockSermons.filter(sermon =>
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.series.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar" }]}>
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header e Ações */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-foreground">O Altar</h2>
                        <p className="text-muted-foreground">Central de preparação e pregação de sermões.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar sermão ou série..."
                                className="pl-10 bg-card rounded-xl border-border/50 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button className="bg-primary text-primary-foreground rounded-xl gap-2 shadow-lg hover:shadow-primary/20 h-10 font-semibold px-6">
                            <Plus className="h-4 w-4" /> Novo Sermão
                        </Button>
                    </div>
                </div>

                {/* Dashboard Rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary/10 to-transparent hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-widest">Próxima Pregação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="font-bold text-lg text-foreground">Domingo, 15 Fev</span>
                            </div>
                            <p className="text-muted-foreground font-medium">"Justificados pela Fé"</p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" className="w-full rounded-lg gap-2 font-semibold bg-background/50 hover:bg-background text-foreground border border-black/5 dark:border-white/10 shadow-sm">
                                <Play className="h-3 w-3" /> Preparar Púlpito
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Série Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-lg" />
                                <div>
                                    <h3 className="font-bold text-foreground">Estudos em Romanos</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Mensagem 4 de 12</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Banco de Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <PenTool className="h-8 w-8 text-amber-500 bg-amber-500/10 p-1.5 rounded-lg" />
                                <div>
                                    <h3 className="font-bold text-foreground">12 Notas Recentes</h3>
                                    <p className="text-xs text-muted-foreground font-medium">3 novos versículos salvos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Sermões */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Mic2 className="h-5 w-5 text-primary" /> Sermões Recentes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSermons.map(sermon => (
                            <Card key={sermon.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border-border/50 overflow-hidden bg-card">
                                <div className={`h-1.5 w-full ${sermon.color}`} />
                                <CardHeader className="pb-3 pt-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="rounded-md font-medium text-[10px] bg-secondary/30 border-secondary/50 text-foreground">
                                            {sermon.series}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                                <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardTitle className="text-xl leading-tight font-bold text-foreground">{sermon.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <p className="text-sm font-medium text-primary mb-5 italic font-serif border-l-2 border-primary/20 pl-3">
                                        "{sermon.verse}"
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(sermon.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {sermon.status === 'Planejado' ? 'Planejado' : 'Concluído'}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 pb-5 px-5">
                                    <Button className="w-full rounded-xl gap-2 font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-border/50 shadow-sm transition-all h-10">
                                        <Play className="h-3.5 w-3.5" /> Abrir no Púlpito
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* Card para Adicionar Novo */}
                        <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all h-[280px] group">
                            <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-foreground">Novo Sermão</h4>
                                <p className="text-xs text-muted-foreground px-8">Clique para começar um esboço do zero</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
