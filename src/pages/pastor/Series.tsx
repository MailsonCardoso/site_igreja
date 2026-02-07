import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Folder, Plus, BookOpen, MoreVertical, Calendar, Trash2, Edit, Save } from "lucide-react";
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

const initialSeries = [
    {
        id: 1,
        title: "Estudos em Romanos",
        description: "Uma jornada expositiva pela epístola de Paulo.",
        total: 12,
        completed: 4,
        color: "bg-blue-500",
        coverColor: "from-blue-500/20 to-blue-500/5",
        startDate: "2024-01-15"
    },
    {
        id: 2,
        title: "Salmos de Confiança",
        description: "Encontrando paz em meio às tormentas da vida.",
        total: 5,
        completed: 5,
        color: "bg-green-500",
        coverColor: "from-green-500/20 to-green-500/5",
        startDate: "2023-12-01"
    },
    {
        id: 3,
        title: "Família Cristã",
        description: "Princípios bíblicos para o lar.",
        total: 8,
        completed: 0,
        color: "bg-amber-500",
        coverColor: "from-amber-500/20 to-amber-500/5",
        startDate: "2024-03-10"
    }
];

export default function Series() {
    const [series, setSeries] = useState(initialSeries);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentSerie, setCurrentSerie] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        total: 1,
        completed: 0,
        color: "bg-blue-500",
        coverColor: "from-blue-500/20 to-blue-500/5",
        startDate: ""
    });

    const handleOpenEditor = (serie: any = null) => {
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
            // Atualizar
            setSeries(series.map(s =>
                s.id === currentSerie.id
                    ? { ...currentSerie, ...formData }
                    : s
            ));
            toast.success("Série atualizada com sucesso!");
        } else {
            // Criar
            const newSerie = {
                id: Math.max(...series.map(s => s.id), 0) + 1,
                ...formData
            };
            setSeries([newSerie, ...series]);
            toast.success("Série criada com sucesso!");
        }

        setIsEditorOpen(false);
    };

    const handleDelete = (serie: any) => {
        setCurrentSerie(serie);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        setSeries(series.filter(s => s.id !== currentSerie.id));
        toast.success("Série excluída com sucesso!");
        setIsDeleteOpen(false);
        setCurrentSerie(null);
    };

    const colorOptions = [
        { value: "bg-blue-500", label: "Azul", gradient: "from-blue-500/20 to-blue-500/5" },
        { value: "bg-green-500", label: "Verde", gradient: "from-green-500/20 to-green-500/5" },
        { value: "bg-amber-500", label: "Âmbar", gradient: "from-amber-500/20 to-amber-500/5" },
        { value: "bg-purple-500", label: "Roxo", gradient: "from-purple-500/20 to-purple-500/5" },
        { value: "bg-red-500", label: "Vermelho", gradient: "from-red-500/20 to-red-500/5" },
        { value: "bg-pink-500", label: "Rosa", gradient: "from-pink-500/20 to-pink-500/5" },
    ];

    return (
        <MainLayout title="Pastoral" breadcrumbs={[{ label: "O Altar", href: "/pastor" }, { label: "Séries" }]}>
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-foreground">Séries de Mensagens</h2>
                        <p className="text-muted-foreground">Organize suas pregações em jornadas temáticas.</p>
                    </div>
                    <Button onClick={() => handleOpenEditor()} className="font-semibold gap-2 shadow-lg h-10 px-6 rounded-xl">
                        <Plus className="h-4 w-4" /> Nova Série
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {series.map((serie) => {
                        const progress = serie.total > 0 ? (serie.completed / serie.total) * 100 : 0;

                        return (
                            <Card key={serie.id} className="group hover:shadow-xl transition-all duration-300 rounded-2xl border-border/50 overflow-hidden bg-card hover:-translate-y-1">
                                <div className={`h-32 w-full bg-gradient-to-br ${serie.coverColor} flex items-center justify-center relative`}>
                                    <BookOpen className={`h-12 w-12 ${serie.color.replace('bg-', 'text-')}`} />

                                    {/* Dropdown de Ações */}
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
                                        {progress === 100 && (
                                            <Badge className="bg-green-500 hover:bg-green-600 border-none ml-2">Concluída</Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <span>Progresso</span>
                                            <span>{serie.completed} de {serie.total} Pregadas</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
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

                    {/* Card Nova Série Placeholder */}
                    <button onClick={() => handleOpenEditor()} className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-muted bg-muted/5 hover:bg-muted/10 transition-all min-h-[300px] text-muted-foreground hover:text-foreground group">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="font-semibold">Criar Nova Série</span>
                    </button>
                </div>

                {/* Modal Editor */}
                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>{currentSerie ? "Editar Série" : "Nova Série"}</DialogTitle>
                            <DialogDescription>
                                Organize suas mensagens em séries temáticas.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Título da Série *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Estudos em Romanos"
                                    className="font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Breve descrição da série..."
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total de Mensagens</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.total}
                                        onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Já Pregadas</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={formData.total}
                                        value={formData.completed}
                                        onChange={(e) => setFormData({ ...formData, completed: Math.min(parseInt(e.target.value) || 0, formData.total) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Data de Início</Label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Cor da Série</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value, coverColor: color.gradient })}
                                            className={`h-10 rounded-lg ${color.value} transition-all ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} className="gap-2">
                                <Save className="h-4 w-4" /> Salvar
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
                                Esta ação não pode ser desfeita. A série "{currentSerie?.title}" será excluída permanentemente.
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
