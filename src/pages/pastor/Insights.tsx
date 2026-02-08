import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PenTool, Quote, Plus, X, Search, Lightbulb, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PastoralStore, Sermon } from "@/data/pastoral-store";

interface Insight {
    id: number;
    type: string;
    content: string;
    title?: string;
    reference?: string;
    tags: string[];
    sermonId?: number;
}

const initialInsights: Insight[] = [
    { id: 1, type: "verse", content: "Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes...", reference: "Hebreus 4:12", tags: ["Bíblia", "Poder"] },
    { id: 2, type: "note", content: "A graça não é apenas o favor imerecido para salvação, mas o poder capacitador para vivermos a vida cristã.", title: "Definição de Graça", tags: ["Teologia", "Vida Cristã"] },
    { id: 3, type: "note", content: "Ilustração: O equilibrista nas Cataratas do Niágara. O público acreditava que ele podia, mas só quem subiu nas costas dele confiou de verdade.", title: "Fé vs Crença", tags: ["Ilustração", "Fé"] },
    { id: 4, type: "verse", content: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1", tags: ["Conforto", "Provisão"] },
    { id: 5, type: "note", content: "Lembrar de falar sobre a importância da oração comunitária no próximo domingo.", title: "Aviso", tags: ["Lembrete"] }
];

export default function Insights() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [activeTab, setActiveTab] = useState("todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [insightToDelete, setInsightToDelete] = useState<Insight | null>(null);

    // Carregar dados
    useEffect(() => {
        const savedInsights = PastoralStore.getInsights();
        if (savedInsights.length > 0) {
            setInsights(savedInsights);
        } else {
            setInsights(initialInsights);
        }
    }, []);

    // Form States
    const [newType, setNewType] = useState("note");
    const [sermonsList] = useState<Sermon[]>(PastoralStore.getSermons());
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        reference: "",
        tags: "",
        sermonId: "none"
    });

    const handleSave = () => {
        if (!formData.content.trim()) {
            toast.error("O conteúdo é obrigatório!");
            return;
        }

        if (newType === 'verse' && !formData.reference.trim()) {
            toast.error("A referência é obrigatória para versículos!");
            return;
        }

        const newInsight: Insight = {
            id: Date.now(),
            type: newType,
            content: formData.content,
            ...(newType === 'note' ? { title: formData.title } : { reference: formData.reference }),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
            sermonId: formData.sermonId === "none" ? undefined : Number(formData.sermonId)
        };

        const updatedInsights = [newInsight, ...insights];
        setInsights(updatedInsights);
        PastoralStore.saveInsights(updatedInsights);
        toast.success("Insight salvo com sucesso!");

        // Reset Form
        setFormData({
            title: "",
            content: "",
            reference: "",
            tags: "",
            sermonId: "none"
        });
    };

    const handleDelete = (insight: any) => {
        setInsightToDelete(insight);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        const updatedInsights = insights.filter(i => i.id !== (insightToDelete?.id || 0));
        setInsights(updatedInsights);
        PastoralStore.saveInsights(updatedInsights);
        toast.success("Insight removido!");
        setIsDeleteOpen(false);
        setInsightToDelete(null);
    };

    const filteredInsights = insights.filter(i => {
        const matchesTab = activeTab === 'todos' || i.type === activeTab;
        const term = searchTerm.toLowerCase().replace("#", "");
        const matchesSearch = i.content.toLowerCase().includes(term) ||
            (i.title?.toLowerCase().includes(term) ?? false) ||
            (i.reference?.toLowerCase().includes(term) ?? false) ||
            i.tags.some(tag => tag.toLowerCase().includes(term));
        return matchesTab && matchesSearch;
    });

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
                        <Tabs value={newType} onValueChange={setNewType} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="note">Anotação Rápida</TabsTrigger>
                                <TabsTrigger value="verse">Versículo</TabsTrigger>
                            </TabsList>
                            <TabsContent value="note" className="space-y-4">
                                <Input
                                    placeholder="Título (Opcional)"
                                    className="font-semibold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <Textarea
                                    placeholder="O que você está pensando?"
                                    className="min-h-[100px]"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </TabsContent>
                            <TabsContent value="verse" className="space-y-4">
                                <Input
                                    placeholder="Referência (ex: João 3:16)"
                                    className="font-bold font-serif"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Texto do versículo..."
                                    className="min-h-[100px] font-serif italic"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Vincular à Pregação (Opcional)</p>
                                <Select
                                    value={formData.sermonId}
                                    onValueChange={(val) => setFormData({ ...formData, sermonId: val })}
                                >
                                    <SelectTrigger className="h-10 rounded-xl border-input bg-background font-medium">
                                        <SelectValue placeholder="Nenhuma / Insight Avulso" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-primary/10 shadow-xl max-h-[300px]">
                                        <SelectItem value="none">Nenhuma (Insight Avulso)</SelectItem>
                                        {sermonsList.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tags (Separe por vírgula)</p>
                                <Input
                                    placeholder="Ex: Teologia, Fé, Oração"
                                    className="h-10 rounded-xl"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} className="w-full sm:w-auto rounded-xl px-12 h-11 font-semibold shadow-lg shadow-primary/20">
                                Salvar no Banco de Insights
                            </Button>
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
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Pesquisar por conteúdo, título ou #tags..."
                            className="pl-10 rounded-xl h-11 bg-background border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Masonry Grid (Simulado com Columns CSS) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredInsights.map((insight) => (
                        <div key={insight.id} className={`group break-inside-avoid rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${insight.type === 'verse' ? 'bg-background border-border/50' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${insight.type === 'verse' ? 'bg-secondary/50 text-secondary-foreground' : 'bg-yellow-200/50 text-yellow-800 dark:text-yellow-200'}`}>
                                    {insight.type === 'verse' ? 'Versículo' : 'Nota'}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(insight)}
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
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

                            {insight.sermonId && (
                                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded-md w-fit">
                                    <BookOpen className="h-3 w-3" />
                                    {sermonsList.find(s => s.id === insight.sermonId)?.title || 'Pregação Vinculada'}
                                </div>
                            )}

                            {insight.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                                    {insight.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-medium text-muted-foreground/70">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* AlertDialog de Exclusão */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Insight?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O insight selecionado será removido permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </MainLayout>
    );
}
