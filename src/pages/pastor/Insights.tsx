import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PenTool, Quote, Plus, X, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockInsights = [
    { id: 1, type: "verse", content: "Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes...", reference: "Hebreus 4:12", tags: ["Bíblia", "Poder"] },
    { id: 2, type: "note", content: "A graça não é apenas o favor imerecido para salvação, mas o poder capacitador para vivermos a vida cristã.", title: "Definição de Graça", tags: ["Teologia", "Vida Cristã"] },
    { id: 3, type: "note", content: "Ilustração: O equilibrista nas Cataratas do Niágara. A multidão acreditava que ele podia, mas só quem subiu nas costas dele confiou de verdade.", title: "Fé vs Crença", tags: ["Ilustração", "Fé"] },
    { id: 4, type: "verse", content: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1", tags: ["Conforto", "Provisão"] },
    { id: 5, type: "note", content: "Lembrar de falar sobre a importância da oração comunitária no próximo domingo.", title: "Aviso", tags: ["Lembrete"] }
];

export default function Insights() {
    const [activeTab, setActiveTab] = useState("todos");

    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar", href: "/pastor" }, { label: "Insights" }]}>
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Widget de Entrada Rápida */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <h3 className="font-bold text-lg">Capturar Insight</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Tabs defaultValue="note" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="note">Anotação Rápida</TabsTrigger>
                                <TabsTrigger value="verse">Versículo</TabsTrigger>
                            </TabsList>
                            <TabsContent value="note" className="space-y-4">
                                <Input placeholder="Título (Opcional)" className="font-semibold" />
                                <Textarea placeholder="O que você está pensando?" className="min-h-[100px]" />
                            </TabsContent>
                            <TabsContent value="verse" className="space-y-4">
                                <Input placeholder="Referência (ex: João 3:16)" className="font-bold font-serif" />
                                <Textarea placeholder="Texto do versículo..." className="min-h-[100px] font-serif italic" />
                            </TabsContent>
                        </Tabs>
                        <div className="flex justify-end">
                            <Button className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20">Salvar no Banco</Button>
                        </div>
                    </div>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <Button variant={activeTab === 'todos' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('todos')} className="rounded-full">Todos</Button>
                        <Button variant={activeTab === 'note' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('note')} className="rounded-full">Anotações</Button>
                        <Button variant={activeTab === 'verse' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('verse')} className="rounded-full">Versículos</Button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Pesquisar..." className="pl-10 rounded-xl" />
                    </div>
                </div>

                {/* Masonry Grid (Simulado com Columns CSS) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {mockInsights
                        .filter(i => activeTab === 'todos' || i.type === activeTab)
                        .map((insight) => (
                            <div key={insight.id} className={`break-inside-avoid rounded-2xl p-6 shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md ${insight.type === 'verse' ? 'bg-background border-border/50' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${insight.type === 'verse' ? 'bg-secondary/50 text-secondary-foreground' : 'bg-yellow-200/50 text-yellow-800 dark:text-yellow-200'}`}>
                                        {insight.type === 'verse' ? 'Versículo' : 'Nota'}
                                    </span>
                                </div>

                                {insight.type === 'verse' ? (
                                    <>
                                        <p className="font-serif text-lg italic leading-relaxed mb-4 text-foreground/90">"{insight.content}"</p>
                                        <p className="text-sm font-bold text-primary text-right">— {insight.reference}</p>
                                    </>
                                ) : (
                                    <>
                                        {insight.title && <h4 className="font-bold text-lg mb-2">{insight.title}</h4>}
                                        <p className="text-sm leading-relaxed text-muted-foreground">{insight.content}</p>
                                    </>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                                    {insight.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-medium text-muted-foreground/70">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>

            </div>
        </MainLayout>
    );
}
