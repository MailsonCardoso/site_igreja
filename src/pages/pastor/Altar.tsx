import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    Play,
    Trash2,
    Save,
    Copy
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

// Mock Data Inicial
const initialSermons = [
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
            topics: ["A provisão do Pastor", "O cuidado constante"],
            conclusion: "Bondade e misericórdia me seguirão todos os dias."
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
        content: {
            intro: "Paulo nos ensina sobre a paz que excede todo entendimento.",
            topics: ["Oração como antídoto", "A paz de Deus"],
            conclusion: "Não andeis ansiosos por coisa alguma."
        }
    }
];

export default function Altar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [sermons, setSermons] = useState(initialSermons);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentSermon, setCurrentSermon] = useState<any>(null);

    // Formulário
    const [formData, setFormData] = useState({
        title: "",
        series: "",
        verse: "",
        date: "",
        status: "Planejado",
        color: "bg-amber-400",
        content: {
            intro: "",
            topics: [""] as string[],
            conclusion: ""
        }
    });

    const handleOpenEditor = (sermon: any = null) => {
        if (sermon) {
            setCurrentSermon(sermon);
            setFormData({
                title: sermon.title,
                series: sermon.series,
                verse: sermon.verse,
                date: sermon.date,
                status: sermon.status,
                color: sermon.color || "bg-amber-400",
                content: {
                    intro: sermon.content.intro,
                    topics: sermon.content.topics.length ? sermon.content.topics : [""],
                    conclusion: sermon.content.conclusion
                }
            });
        } else {
            setCurrentSermon(null);
            setFormData({
                title: "",
                series: "",
                verse: "",
                date: "",
                status: "Planejado",
                color: "bg-amber-400",
                content: {
                    intro: "",
                    topics: [""],
                    conclusion: ""
                }
            });
        }
        setIsEditorOpen(true);
    };

    const handleSave = () => {
        // Validação
        if (!formData.title.trim()) {
            toast.error("O título é obrigatório!");
            return;
        }
        if (!formData.verse.trim()) {
            toast.error("O versículo base é obrigatório!");
            return;
        }

        if (currentSermon) {
            // Atualizar existente
            setSermons(sermons.map(s =>
                s.id === currentSermon.id
                    ? { ...currentSermon, ...formData }
                    : s
            ));
            toast.success("Sermão atualizado com sucesso!");
        } else {
            // Criar novo
            const newSermon = {
                id: Math.max(...sermons.map(s => s.id), 0) + 1,
                ...formData
            };
            setSermons([newSermon, ...sermons]);
            toast.success("Sermão criado com sucesso!");
        }

        setIsEditorOpen(false);
    };

    const handleDelete = (sermon: any) => {
        setCurrentSermon(sermon);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        setSermons(sermons.filter(s => s.id !== currentSermon.id));
        toast.success("Sermão excluído com sucesso!");
        setIsDeleteOpen(false);
        setCurrentSermon(null);
    };

    const handleDuplicate = (sermon: any) => {
        const duplicate = {
            ...sermon,
            id: Math.max(...sermons.map(s => s.id), 0) + 1,
            title: `${sermon.title} (Cópia)`,
            status: "Planejado",
            date: ""
        };
        setSermons([duplicate, ...sermons]);
        toast.success("Sermão duplicado com sucesso!");
    };

    const handleTopicChange = (index: number, value: string) => {
        const newTopics = [...formData.content.topics];
        newTopics[index] = value;
        setFormData({ ...formData, content: { ...formData.content, topics: newTopics } });
    };

    const addTopic = () => {
        setFormData({ ...formData, content: { ...formData.content, topics: [...formData.content.topics, ""] } });
    };

    const removeTopic = (index: number) => {
        const newTopics = formData.content.topics.filter((_, i) => i !== index);
        setFormData({ ...formData, content: { ...formData.content, topics: newTopics } });
    };

    const filteredSermons = sermons.filter(sermon =>
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
                        <Button onClick={() => handleOpenEditor()} className="bg-primary text-primary-foreground rounded-xl gap-2 shadow-lg hover:shadow-primary/20 h-10 font-semibold px-6">
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
                            <Button size="sm" className="w-full rounded-lg gap-2 font-semibold bg-background/50 hover:bg-background text-foreground border border-black/5 dark:border-white/10 shadow-sm" onClick={() => navigate('/pastor/pulpito/1')}>
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
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Sermões</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <PenTool className="h-8 w-8 text-amber-500 bg-amber-500/10 p-1.5 rounded-lg" />
                                <div>
                                    <h3 className="font-bold text-foreground text-3xl">{sermons.length}</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Mensagens cadastradas</p>
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
                                                <DropdownMenuItem onClick={() => handleOpenEditor(sermon)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(sermon)}>
                                                    <Copy className="h-3 w-3 mr-2" /> Duplicar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sermon)}>
                                                    <Trash2 className="h-3 w-3 mr-2" /> Excluir
                                                </DropdownMenuItem>
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
                                            {sermon.date ? new Date(sermon.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem data'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {sermon.status === 'Planejado' ? 'Planejado' : 'Concluído'}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 pb-5 px-5">
                                    <Button className="w-full rounded-xl gap-2 font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-border/50 shadow-sm transition-all h-10" onClick={() => navigate(`/pastor/pulpito/${sermon.id}`)}>
                                        <Play className="h-3.5 w-3.5" /> Abrir no Púlpito
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* Card para Adicionar Novo */}
                        <button onClick={() => handleOpenEditor()} className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all h-[280px] group">
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

                {/* Modal Editor */}
                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 rounded-2xl gap-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>{currentSermon ? "Editar Sermão" : "Novo Esboço"}</DialogTitle>
                            <DialogDescription>
                                Prepare sua mensagem com estrutura organizada.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="grid gap-6">
                                {/* Campos Principais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Título da Mensagem *</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: A Graça Abundante"
                                            className="font-bold text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Série (Opcional)</Label>
                                        <Input
                                            value={formData.series}
                                            onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                                            placeholder="Ex: Estudos em Romanos"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Versículo Base *</Label>
                                        <Input
                                            value={formData.verse}
                                            onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                                            placeholder="Ex: Romanos 8:1"
                                            className="font-serif italic"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data Planejada</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Estrutura do Sermão */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Estrutura</h3>

                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">Introdução</Label>
                                        <Textarea
                                            value={formData.content.intro}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, intro: e.target.value } })}
                                            placeholder="Capture a atenção e apresente o tema..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                        <Label className="text-primary font-bold">Tópicos</Label>
                                        {formData.content.topics.map((topic, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mt-2">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={topic}
                                                        onChange={(e) => handleTopicChange(index, e.target.value)}
                                                        placeholder={`Tópico ${index + 1}`}
                                                        className="font-semibold"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeTopic(index)} disabled={formData.content.topics.length === 1} className="mt-2 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={addTopic} className="ml-8 border-dashed border-primary/30 text-primary">
                                            <Plus className="h-3 w-3 mr-2" /> Adicionar Tópico
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">Conclusão</Label>
                                        <Textarea
                                            value={formData.content.conclusion}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, conclusion: e.target.value } })}
                                            placeholder="Fechamento e apelo..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
                            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
                            <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
                                <Save className="h-4 w-4" /> Salvar Esboço
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* AlertDialog de Exclusão */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O sermão "{currentSermon?.title}" será excluído permanentemente.
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
