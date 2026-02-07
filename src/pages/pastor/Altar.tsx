import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Plus,
    Search,
    Calendar,
    BookOpen,
    MoreVertical,
    Trash2,
    Edit,
    Copy,
    PenTool,
    Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PastoralStore, Sermon, Series } from "@/data/pastoral-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Altar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // Estados do Store
    const [sermons, setSermons] = useState<Sermon[]>(PastoralStore.getSermons());
    const [seriesList] = useState<Series[]>(PastoralStore.getSeries());

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        series: "Avulso",
        verse: "",
        date: new Date().toISOString().split('T')[0],
        status: "Planejado" as Sermon['status'],
        color: "bg-amber-400",
        content: {
            intro: "",
            topics: ["", "", ""],
            conclusion: ""
        }
    });

    // Sincronizar com LocalStorage quando mudar
    useEffect(() => {
        PastoralStore.saveSermons(sermons);
    }, [sermons]);

    const handleOpenEditor = (sermon: Sermon | null = null) => {
        if (sermon) {
            setCurrentSermon(sermon);
            setFormData({
                title: sermon.title,
                series: sermon.series,
                verse: sermon.verse,
                date: sermon.date,
                status: sermon.status,
                color: sermon.color || "bg-amber-400",
                content: { ...sermon.content }
            });
        } else {
            setCurrentSermon(null);
            setFormData({
                title: "",
                series: "Avulso",
                verse: "",
                date: new Date().toISOString().split('T')[0],
                status: "Planejado",
                color: "bg-amber-400",
                content: {
                    intro: "",
                    topics: ["", "", ""],
                    conclusion: ""
                }
            });
        }
        setIsEditorOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error("O título é obrigatório!");
            return;
        }

        if (currentSermon) {
            setSermons(sermons.map(s =>
                s.id === currentSermon.id
                    ? { ...currentSermon, ...formData }
                    : s
            ));
            toast.success("Sermão atualizado com sucesso!");
        } else {
            const newSermon: Sermon = {
                id: Math.max(...sermons.map(s => s.id), 0) + 1,
                title: formData.title,
                series: formData.series,
                verse: formData.verse,
                date: formData.date,
                status: formData.status,
                color: formData.color,
                content: formData.content
            };
            setSermons([newSermon, ...sermons]);
            toast.success("Sermão criado com sucesso!");
        }
        setIsEditorOpen(false);
    };

    const handleDelete = (sermon: Sermon) => {
        setCurrentSermon(sermon);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (currentSermon) {
            setSermons(sermons.filter(s => s.id !== currentSermon.id));
            toast.success("Sermão excluído com sucesso!");
            setIsDeleteOpen(false);
            setCurrentSermon(null);
        }
    };

    const duplicateSermon = (sermon: Sermon) => {
        const duplicated: Sermon = {
            ...sermon,
            id: Math.max(...sermons.map(s => s.id), 0) + 1,
            title: `${sermon.title} (Cópia)`,
            date: new Date().toISOString().split('T')[0],
            status: "Rascunho"
        };
        setSermons([duplicated, ...sermons]);
        toast.success("Sermão duplicado!");
    };

    const handleTopicChange = (index: number, value: string) => {
        const newTopics = [...formData.content.topics];
        newTopics[index] = value;
        setFormData({
            ...formData,
            content: { ...formData.content, topics: newTopics }
        });
    };

    const filteredSermons = sermons.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.series.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Estatísticas
    const stats = {
        total: sermons.length,
        preached: sermons.filter(s => s.status === "Pregado").length,
        planned: sermons.filter(s => s.status === "Planejado").length,
        drafts: sermons.filter(s => s.status === "Rascunho").length,
    };

    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar" }]}>
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Dashboard Rápido */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-none shadow-sm bg-primary/5">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Total de Mensagens</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-black">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-green-500/5">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Pregadas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-black text-green-600 dark:text-green-400">{stats.preached}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-amber-500/5">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Planejadas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.planned}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-blue-500/5">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Em Rascunho</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.drafts}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar sermão ou série..."
                            className="pl-10 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenEditor()} className="w-full sm:w-auto font-semibold gap-2 shadow-lg h-10 px-6 rounded-xl">
                        <Plus className="h-4 w-4" /> Novo Sermão
                    </Button>
                </div>

                {/* Grid de Sermões */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSermons.map((sermon) => (
                        <Card key={sermon.id} className="group hover:shadow-xl transition-all duration-300 rounded-2xl border-border/50 overflow-hidden bg-card cursor-pointer hover:-translate-y-1">
                            <div className={`h-1.5 w-full ${sermon.color}`} />
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div onClick={() => navigate(`/pastor/pulpito/${sermon.id}`)}>
                                        <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-widest font-bold">
                                            {sermon.series}
                                        </Badge>
                                        <CardTitle className="text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight">
                                            {sermon.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1 font-medium">
                                            <Badge variant="secondary" className="px-2 py-0 text-[10px] h-5">{sermon.status}</Badge>
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => navigate(`/pastor/pulpito/${sermon.id}`)}>
                                                <BookOpen className="h-4 w-4 mr-2" /> Modo Púlpito
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenEditor(sermon)}>
                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => duplicateSermon(sermon)}>
                                                <Copy className="h-4 w-4 mr-2" /> Duplicar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sermon)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent onClick={() => navigate(`/pastor/pulpito/${sermon.id}`)}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(sermon.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-serif italic">
                                        <PenTool className="h-4 w-4" /> {sermon.verse}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Editor Modal */}
                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-8 pb-4 bg-primary/5">
                            <DialogTitle className="text-2xl font-bold font-display">
                                {currentSermon ? 'Editar Mensagem' : 'Nova Mensagem'}
                            </DialogTitle>
                            <DialogDescription className="font-medium">
                                Estruture sua pregação para o próximo culto.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-8">
                            {/* Campos Básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Título da Mensagem</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: O Poder da Ressurreição"
                                        className="h-11 rounded-xl bg-muted/20 border-none font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Série de Mensagens</Label>
                                    <Select
                                        value={formData.series}
                                        onValueChange={(val) => setFormData({ ...formData, series: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-none font-medium">
                                            <SelectValue placeholder="Selecione uma série" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Avulso">Nenhuma (Mensagem Avulsa)</SelectItem>
                                            {seriesList.map(s => (
                                                <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Data</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="h-11 rounded-xl bg-muted/20 border-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-none font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Planejado">Planejado</SelectItem>
                                            <SelectItem value="Pregado">Pregado</SelectItem>
                                            <SelectItem value="Rascunho">Rascunho</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Versículo Base</Label>
                                    <Input
                                        value={formData.verse}
                                        onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                                        placeholder="Ex: João 3:16"
                                        className="h-11 rounded-xl bg-muted/20 border-none font-serif italic"
                                    />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="space-y-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Introdução / Gancho</Label>
                                    <Textarea
                                        value={formData.content.intro}
                                        onChange={(e) => setFormData({ ...formData, content: { ...formData.content, intro: e.target.value } })}
                                        placeholder="Como você vai começar a mensagem?"
                                        className="min-h-[100px] rounded-2xl bg-muted/20 border-none p-4"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Tópicos Principais</Label>
                                    {formData.content.topics.map((topic, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex items-center justify-center w-8 h-10 rounded-lg bg-primary/10 text-primary font-black text-xs">
                                                {index + 1}
                                            </div>
                                            <Input
                                                value={topic}
                                                onChange={(e) => handleTopicChange(index, e.target.value)}
                                                placeholder={`Tópico ${index + 1}`}
                                                className="flex-1 h-10 rounded-xl bg-muted/20 border-none font-bold"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Conclusão / Apelo</Label>
                                    <Textarea
                                        value={formData.content.conclusion}
                                        onChange={(e) => setFormData({ ...formData, content: { ...formData.content, conclusion: e.target.value } })}
                                        placeholder="Qual é o desafio final para a igreja?"
                                        className="min-h-[80px] rounded-2xl bg-muted/20 border-none p-4 font-medium italic"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/30 gap-3">
                            <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                            <Button onClick={handleSave} className="rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20">
                                <Save className="h-4 w-4" /> Salvar Mensagem
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* AlertDialog de Exclusão */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent className="rounded-3xl border-none p-8">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black">Excluir Mensagem?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base font-medium">
                                Esta ação removerá permanentemente o sermão "{currentSermon?.title}". Você não poderá desfazer isso.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3">
                            <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted hover:bg-muted/80">Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={confirmDelete}>
                                Sim, excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
