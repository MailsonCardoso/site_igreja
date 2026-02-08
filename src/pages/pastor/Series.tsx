import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Folder, Plus, BookOpen, MoreVertical, Calendar, Trash2, Edit, Save, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PastoralStore, Series, Sermon } from "@/data/pastoral-store";

export default function SeriesPage() {
    const [series, setSeries] = useState<Series[]>(PastoralStore.getSeries());
    const [sermons] = useState<Sermon[]>(PastoralStore.getSermons());
    const [searchTerm, setSearchTerm] = useState("");

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentSerie, setCurrentSerie] = useState<Series | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        total: 1,
        completed: 0,
        color: "bg-blue-500",
        coverColor: "from-blue-500/20 to-blue-500/5",
        startDate: ""
    });

    // Sincronizar com LocalStorage
    useEffect(() => {
        PastoralStore.saveSeries(series);
    }, [series]);

    const handleOpenEditor = (serie: Series | null = null) => {
        if (serie) {
            setCurrentSerie(serie);
            setFormData({
                title: serie.title,
                description: serie.description,
                total: serie.total,
                completed: serie.completed,
                color: serie.color,
                coverColor: serie.coverColor,
                startDate: serie.startDate
            });
        } else {
            setCurrentSerie(null);
            setFormData({
                title: "",
                description: "",
                total: 1,
                completed: 0,
                color: "bg-blue-500",
                coverColor: "from-blue-500/20 to-blue-500/5",
                startDate: ""
            });
        }
        setIsEditorOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error("O título é obrigatório!");
            return;
        }

        if (currentSerie) {
            setSeries(series.map(s =>
                s.id === currentSerie.id
                    ? { ...currentSerie, ...formData }
                    : s
            ));
            toast.success("Série atualizada com sucesso!");
        } else {
            const newSerie: Series = {
                id: Math.max(...series.map(s => s.id), 0) + 1,
                ...formData
            };
            setSeries([newSerie, ...series]);
            toast.success("Série criada com sucesso!");
        }

        setIsEditorOpen(false);
    };

    const handleDelete = (serie: Series) => {
        setCurrentSerie(serie);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (currentSerie) {
            setSeries(series.filter(s => s.id !== currentSerie.id));
            toast.success("Série excluída com sucesso!");
            setIsDeleteOpen(false);
            setCurrentSerie(null);
        }
    };

    const getSeriesSermons = (seriesTitle: string) => {
        return sermons.filter(s => s.series === seriesTitle);
    };

    const colorOptions: { value: string; label: string; gradient: string; hex: string; }[] = [
        { value: "bg-blue-500", label: "Azul", gradient: "from-blue-500/20 to-blue-500/5", hex: "#3b82f6" },
        { value: "bg-green-500", label: "Verde", gradient: "from-green-500/20 to-green-500/5", hex: "#22c55e" },
        { value: "bg-amber-500", label: "Âmbar", gradient: "from-amber-500/20 to-amber-500/5", hex: "#f59e0b" },
        { value: "bg-purple-500", label: "Roxo", gradient: "from-purple-500/20 to-purple-500/5", hex: "#a855f7" },
        { value: "bg-red-500", label: "Vermelho", gradient: "from-red-500/20 to-red-500/5", hex: "#ef4444" },
        { value: "bg-pink-500", label: "Rosa", gradient: "from-pink-500/20 to-pink-500/5", hex: "#ec4899" },
    ];

    const filteredSeries = series.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar", href: "/pastor" }, { label: "Séries" }]}>
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-foreground">Séries de Mensagens</h2>
                        <p className="text-muted-foreground">Organize suas pregações em jornadas temáticas.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="Filtrar séries por título ou descrição..."
                                className="pl-10 rounded-xl h-11 bg-background border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => handleOpenEditor()} className="font-semibold gap-2 shadow-lg h-10 px-6 rounded-xl shrink-0">
                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova Série</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSeries.map((serie) => {
                        const linkedSermons = getSeriesSermons(serie.title);
                        const completedFromSermons = linkedSermons.filter(s => s.status === "Pregado").length;
                        const progress = serie.total > 0 ? (completedFromSermons / serie.total) * 100 : 0;

                        return (
                            <Card key={serie.id} className="group hover:shadow-xl transition-all duration-300 rounded-2xl border-border/50 overflow-hidden bg-card hover:-translate-y-1">
                                <div className={`h-32 w-full bg-gradient-to-br ${serie.coverColor} flex items-center justify-center relative`}>
                                    <BookOpen className={`h-12 w-12 ${serie.color.replace('bg-', 'text-')}`} />

                                    <div className="absolute top-3 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem onClick={() => handleOpenEditor(serie)}>
                                                    <Edit className="h-3 w-3 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(serie)}>
                                                    <Trash2 className="h-3 w-3 mr-2" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl font-bold">{serie.title}</CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1">{serie.description}</CardDescription>
                                        </div>
                                        {progress >= 100 && serie.total > 0 && (
                                            <Badge className="bg-green-500 hover:bg-green-600 border-none ml-2">Concluída</Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <span>Progresso</span>
                                                <span>{completedFromSermons} de {serie.total} Pregadas</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        {linkedSermons.length > 0 && (
                                            <div className="pt-2">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                                    <List className="h-3 w-3" /> Sermões Vinculados
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {linkedSermons.slice(0, 3).map(s => (
                                                        <Badge key={s.id} variant="secondary" className="text-[9px] px-1.5 py-0 h-5 max-w-[100px] truncate">
                                                            {s.title}
                                                        </Badge>
                                                    ))}
                                                    {linkedSermons.length > 3 && (
                                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5">
                                                            +{linkedSermons.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between items-center text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Folder className="h-3.5 w-3.5" /> {serie.total} Mensagens
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> {serie.startDate ? new Date(serie.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Sem data'}
                                    </span>
                                </CardFooter>
                            </Card>
                        );
                    })}

                    <button onClick={() => handleOpenEditor()} className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-muted bg-muted/5 hover:bg-muted/10 transition-all min-h-[300px] text-muted-foreground hover:text-foreground group">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="font-semibold">Criar Nova Série</span>
                    </button>
                </div>

                {/* Modal Editor */}
                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogContent className="sm:max-w-[750px] rounded-[2rem] border-none bg-background shadow-2xl p-0 overflow-hidden">
                        <div className="bg-primary/5 p-6 border-b relative">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Folder className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-semibold text-foreground">
                                        {currentSerie ? "Editar Série" : "Nova Série"}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium text-xs">
                                        Organize suas mensagens em jornadas temáticas consistentes.
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5 bg-card">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Coluna Esquerda */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 ml-1">Título da Série *</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Estudos em Romanos"
                                            className="h-11 rounded-xl border-input bg-background font-semibold transition-all focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 ml-1">Total Planejado</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={formData.total}
                                                onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) || 1 })}
                                                className="h-11 rounded-xl border-input bg-background font-bold px-4 focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 ml-1">Data de Início</Label>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="h-11 rounded-xl border-input bg-background font-medium px-4 focus:border-primary/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna Direita */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 ml-1">Descrição Breve</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Qual o objetivo central desta série?"
                                            className="min-h-[100px] rounded-xl border-input bg-background p-4 leading-relaxed focus:border-primary/50 resize-none text-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 ml-1">Identidade Visual (Cor)</Label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color: color.value, coverColor: color.gradient })}
                                                    className={`h-9 w-9 rounded-xl border-4 transition-all ${formData.color === color.value ? 'border-primary shadow-lg scale-110' : 'border-transparent opacity-50'}`}
                                                    style={{ backgroundColor: color.hex || '#ecb318' }}
                                                    title={color.label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border/50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditorOpen(false)}
                                    className="flex-1 h-11 rounded-xl font-semibold border-secondary/50 text-muted-foreground hover:bg-secondary/5 transition-all"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                                >
                                    <Save className="h-5 w-5" /> Salvar Série
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-[450px]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-bold text-foreground">Excluir Série?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base font-medium text-muted-foreground pt-2">
                                Esta ação removerá permanentemente a série <span className="text-foreground font-bold italic">"{currentSerie?.title}"</span>. Os sermões vinculados não serão excluídos, mas perderão a referência à série.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3 sm:flex-row">
                            <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted hover:bg-muted/80 h-11 px-6">Voltar</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground h-11 px-6" onClick={confirmDelete}>
                                Confirmar Exclusão
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
