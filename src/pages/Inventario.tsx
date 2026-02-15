import { useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Package,
    Smartphone,
    Monitor,
    Car,
    Music,
    Utensils,
    Box,
    MapPin,
    AlertCircle,
    Loader2,
    Filter,
    RefreshCcw,
    Eye,
    Info,
    Calendar,
    ClipboardList
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const itemCategories = [
    { value: "eletronicos", label: "Eletrônicos", icon: Smartphone },
    { value: "moveis", label: "Móveis", icon: Box },
    { value: "som", label: "Equipamentos de Som", icon: Music },
    { value: "informatica", label: "Informática", icon: Monitor },
    { value: "cozinha", label: "Cozinha", icon: Utensils },
    { value: "veiculos", label: "Veículos", icon: Car },
    { value: "outros", label: "Outros", icon: Package },
];

const conditions: Record<string, { label: string; class: string }> = {
    novo: { label: "Novo", class: "bg-success/10 text-success border-success/20" },
    bom: { label: "Bom", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    regular: { label: "Regular", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    ruim: { label: "Ruim", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Inventario() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("todas");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDisposeDialogOpen, setIsDisposeDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [disposeReason, setDisposeReason] = useState("");

    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: {
            name: "",
            category: "outros",
            quantity: 1,
            location: "",
            condition: "bom",
            description: "",
        },
    });

    const { setValue, reset, watch } = form;

    // Fetch Items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["inventory"],
        queryFn: async () => {
            try {
                const res = await api.get("/inventory");
                return res;
            } catch (e) {
                // Fallback mock data if API is not ready
                return [
                    { id: 1, name: "Microfone SM58", category: "som", quantity: 4, location: "Sala de Som", condition: "bom", description: "Microfones com fio Shure" },
                    { id: 2, name: "Cadeira Estofada", category: "moveis", quantity: 200, location: "Santuário", condition: "novo", description: "Cadeiras azuis IPB" },
                    { id: 3, name: "Notebook Dell", category: "informatica", quantity: 1, location: "Secretaria", condition: "regular", description: "Core i5, 8GB RAM" },
                    { id: 4, name: "Ar Condicionado 24kBTU", category: "eletronicos", quantity: 2, location: "Santuário", condition: "bom", description: "Samsung Digital Inverter" },
                    { id: 5, name: "Mesa de Som Berhinger", category: "som", quantity: 1, location: "Sala de Som", condition: "regular", description: "32 canais" },
                ];
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: (newItem: any) => api.post("/inventory", newItem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            toast.success("Item adicionado ao inventário!");
            setIsDialogOpen(false);
            reset();
        },
        onError: () => toast.error("Erro ao adicionar item"),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/inventory/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            toast.success("Item atualizado!");
            setIsDialogOpen(false);
            setIsDisposeDialogOpen(false);
            reset();
            setSelectedItem(null);
            setDisposeReason("");
        },
        onError: () => toast.error("Erro ao atualizar item"),
    });

    const handleDisposeConfirm = () => {
        if (!selectedItem) return;

        updateMutation.mutate({
            id: selectedItem.id,
            status: 'disposed',
            disposal_reason: disposeReason,
            disposal_date: new Date().toISOString().split('T')[0]
        });
    };

    const handleReactivate = (item: any) => {
        updateMutation.mutate({
            ...item,
            status: 'active',
            disposal_reason: null,
            disposal_date: null
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/inventory/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            toast.success("Item removido do inventário");
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        },
        onError: () => toast.error("Erro ao remover item"),
    });

    const onSubmit = (data: any) => {
        if (isEditMode && selectedItem) {
            updateMutation.mutate({ ...data, id: selectedItem.id });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsEditMode(true);
        reset(item);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (item: any) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleDisposeClick = (item: any) => {
        setSelectedItem(item);
        setDisposeReason("");
        setIsDisposeDialogOpen(true);
    };

    const handleViewClick = (item: any) => {
        setSelectedItem(item);
        setIsViewDialogOpen(true);
    };

    const filteredItems = items.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const activeItems = filteredItems.filter((i: any) => i.status !== 'disposed');
    const disposedItems = filteredItems.filter((i: any) => i.status === 'disposed');

    const getCategoryIcon = (category: string) => {
        const cat = itemCategories.find(c => c.value === category);
        return cat ? cat.icon : Package;
    };

    return (
        <MainLayout title="Inventário" breadcrumbs={[{ label: "Inventário" }]}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Top Header & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-6 rounded-2xl shadow-sm border border-border/40">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Gestão de Patrimônio</h2>
                        <p className="text-sm text-muted-foreground">{activeItems.length} itens ativos • {disposedItems.length} baixados</p>
                    </div>

                    <Sheet open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setIsEditMode(false);
                            setSelectedItem(null);
                            reset();
                        }
                    }}>
                        <SheetTrigger asChild>
                            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <Plus className="h-5 w-5" />
                                Novo Equipamento
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="sm:max-w-xl w-full h-full flex flex-col p-0 border-none shadow-2xl">
                            <div className="bg-primary/5 p-8 border-b border-primary/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-xl font-bold">
                                            {isEditMode ? "Editar Equipamento" : "Novo Patrimônio"}
                                        </SheetTitle>
                                        <SheetDescription>
                                            Preencha os dados técnicos e contábeis do item.
                                        </SheetDescription>
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2 space-y-2">
                                            <Label htmlFor="name">Nome do Item</Label>
                                            <Input id="name" {...form.register("name", { required: true })} placeholder="Ex: Cadeira Estofada" className="h-12 rounded-xl" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Categoria</Label>
                                            <Select onValueChange={(val) => setValue("category", val)} defaultValue={watch("category")}>
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {itemCategories.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantidade</Label>
                                            <Input id="quantity" type="number" {...form.register("quantity", { valueAsNumber: true })} className="h-12 rounded-xl" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Localização na Igreja</Label>
                                            <Input id="location" {...form.register("location")} placeholder="Ex: Santuário" className="h-12 rounded-xl" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Estado de Conservação</Label>
                                            <Select onValueChange={(val) => setValue("condition", val)} defaultValue={watch("condition")}>
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="novo">Novo</SelectItem>
                                                    <SelectItem value="bom">Bom</SelectItem>
                                                    <SelectItem value="regular">Regular</SelectItem>
                                                    <SelectItem value="ruim">Necessita Manutenção / Ruim</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="sm:col-span-2 space-y-2">
                                            <Label htmlFor="description">Observações</Label>
                                            <Input id="description" {...form.register("description")} placeholder="Detalhes adicionais..." className="h-12 rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-xl">Cancelar</Button>
                                        <Button type="submit" className="h-12 px-8 rounded-xl bg-primary text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
                                            {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Item"}
                                        </Button>
                                    </div>
                                </form>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Filters & Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="md:col-span-3 flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar no inventário..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-12 rounded-2xl border-none bg-card shadow-sm"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-64 h-12 rounded-2xl border-none bg-card shadow-sm">
                                <Filter className="h-4 w-4 mr-2 opacity-50" />
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas as Categorias</SelectItem>
                                {itemCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/40 flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground opacity-60">Manutenção</p>
                            <p className="text-xl font-bold">{activeItems.filter((i: any) => i.condition === 'ruim').length}</p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-xl h-auto">
                        <TabsTrigger
                            value="active"
                            className="rounded-lg py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
                        >
                            Em Estoque ({activeItems.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="disposed"
                            className="rounded-lg py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
                        >
                            Histórico / Baixados ({disposedItems.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-0">
                        {/* Items Grid - Active */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Carregando inventário...</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {activeItems.map((item: any, index: number) => {
                                    const Icon = getCategoryIcon(item.category);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            onClick={() => handleViewClick(item)}
                                            className="group bg-card hover:bg-secondary/5 rounded-[1.5rem] border border-border/40 p-4 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-secondary -mr-2 -mt-2">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 bg-popover/95 backdrop-blur-sm shadow-xl">
                                                        <DropdownMenuItem onClick={() => handleViewClick(item)} className="cursor-pointer rounded-lg font-medium">
                                                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer rounded-lg font-medium">
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDisposeClick(item)} className="cursor-pointer rounded-lg font-medium text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                                                            <Box className="mr-2 h-4 w-4" /> Dar Baixa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-border/50" />
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="cursor-pointer rounded-lg font-medium text-destructive focus:text-destructive focus:bg-destructive/10">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className={`rounded-full px-2 py-0 border-0 text-[10px] h-5 ${conditions[item.condition].class}`}>
                                                        {conditions[item.condition].label}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{item.category}</span>
                                                </div>

                                                <h3 className="text-base font-bold text-foreground leading-tight">{item.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{item.description || "Sem descrição adicional."}</p>

                                                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {item.location || "Indefinido"}
                                                    </div>
                                                    <div className="bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                                        <span className="text-[10px] font-bold text-primary">Qtd: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                        {!isLoading && activeItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[3rem] border border-dashed border-secondary/20">
                                <Package className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">Nenhum item em estoque</h3>
                                <p className="text-muted-foreground">Adicione novos itens ou verifique os baixados.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="disposed" className="mt-0">
                        {/* Items Grid - Disposed */}
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {disposedItems.map((item: any, index: number) => {
                                const Icon = getCategoryIcon(item.category);
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        onClick={() => handleViewClick(item)}
                                        className="group bg-muted/30 rounded-[2rem] border border-border/40 p-6 opacity-80 hover:opacity-100 transition-all flex flex-col cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-4 items-start">
                                                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                                                    <Icon className="h-7 w-7 text-muted-foreground" />
                                                </div>
                                                <Badge variant="secondary" className="bg-muted text-muted-foreground mt-1">Baixado</Badge>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted -mr-2">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 bg-popover/95 backdrop-blur-sm shadow-xl">
                                                    <DropdownMenuItem onClick={() => handleViewClick(item)} className="cursor-pointer rounded-lg font-medium">
                                                        <Eye className="mr-2 h-4 w-4" /> Visualizar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleReactivate(item)} className="cursor-pointer rounded-lg font-medium text-primary">
                                                        <RefreshCcw className="mr-2 h-4 w-4" /> Reativar Item
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer rounded-lg font-medium">
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border/50" />
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="cursor-pointer rounded-lg font-medium text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir permanentemente
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            <h3 className="text-lg font-bold text-muted-foreground line-through decoration-destructive/50">{item.name}</h3>

                                            <div className="bg-destructive/5 p-3 rounded-xl space-y-1">
                                                <p className="text-xs font-bold text-destructive uppercase tracking-wider">Motivo da Baixa</p>
                                                <p className="text-sm text-foreground font-medium">{item.disposal_reason || "Não informado"}</p>
                                                <p className="text-xs text-muted-foreground pt-1">
                                                    Data: {item.disposal_date ? new Date(item.disposal_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                                                </p>
                                            </div>

                                            <div className="pt-4 mt-auto border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{item.category}</span>
                                                <span>Qtd anterior: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {!isLoading && disposedItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[3rem] border border-dashed border-secondary/20">
                                <Trash2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">Histórico Limpo</h3>
                                <p className="text-muted-foreground">Nenhum item foi baixado ou descartado ainda.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Dispose Sheet */}
                <Sheet open={isDisposeDialogOpen} onOpenChange={setIsDisposeDialogOpen}>
                    <SheetContent side="right" className="sm:max-w-md w-full h-full p-0 flex flex-col border-none shadow-2xl overflow-hidden">
                        <SheetHeader className="p-8 bg-amber-500/5 border-b">
                            <SheetTitle className="text-xl font-bold">Dar Baixa no Item</SheetTitle>
                            <SheetDescription className="font-semibold text-amber-600">
                                Informe o motivo para remover <strong>{selectedItem?.name}</strong> do estoque ativo.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-card">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Motivo da Baixa</Label>
                                    <Select onValueChange={setDisposeReason}>
                                        <SelectTrigger className="h-12 rounded-xl border-input bg-background font-semibold">
                                            <SelectValue placeholder="Selecione o motivo" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Danificado/Sem Conserto">Danificado (Sem Conserto)</SelectItem>
                                            <SelectItem value="Doado">Doado</SelectItem>
                                            <SelectItem value="Vendido">Vendido</SelectItem>
                                            <SelectItem value="Roubo/Perda">Roubo ou Perda</SelectItem>
                                            <SelectItem value="Obsoleto">Obsoleto / Substituído</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t bg-card flex gap-4 shrink-0">
                            <Button variant="outline" onClick={() => setIsDisposeDialogOpen(false)} className="flex-1 h-12 rounded-xl font-semibold">Cancelar</Button>
                            <Button onClick={handleDisposeConfirm} disabled={!disposeReason || updateMutation.isPending} className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xl shadow-amber-600/20">
                                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Baixa"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Delete Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    {/* ... (existing content) ... */}
                </AlertDialog>

                {/* Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                        {selectedItem && (
                            <div className="flex flex-col">
                                <div className={`p-8 ${selectedItem.status === 'disposed' ? 'bg-muted/50' : 'bg-primary/5'} border-b flex items-center justify-between`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`h-16 w-16 rounded-2xl ${selectedItem.status === 'disposed' ? 'bg-muted' : 'bg-primary/10'} flex items-center justify-center border border-primary/10 shadow-inner`}>
                                            {(() => {
                                                const Icon = getCategoryIcon(selectedItem.category);
                                                return <Icon className={`h-8 w-8 ${selectedItem.status === 'disposed' ? 'text-muted-foreground' : 'text-primary'}`} />;
                                            })()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest">{selectedItem.category}</Badge>
                                                {selectedItem.status === 'disposed' && (
                                                    <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-widest">Baixado</Badge>
                                                )}
                                            </div>
                                            <DialogTitle className="text-2xl font-black text-foreground">{selectedItem.name}</DialogTitle>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsViewDialogOpen(false)} className="rounded-full h-10 w-10">
                                        <Plus className="h-6 w-6 rotate-45" />
                                    </Button>
                                </div>

                                <ScrollArea className="max-h-[70vh]">
                                    <div className="p-8 space-y-8">
                                        {/* Main Specs Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="bg-secondary/5 p-4 rounded-2xl border border-border/40">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Quantidade</p>
                                                <p className="text-xl font-black text-foreground">{selectedItem.quantity}</p>
                                            </div>
                                            <div className="bg-secondary/5 p-4 rounded-2xl border border-border/40">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Localização</p>
                                                <div className="flex items-center gap-1.5 font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                                    {selectedItem.location || "---"}
                                                </div>
                                            </div>
                                            <div className="bg-secondary/5 p-4 rounded-2xl border border-border/40">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Condição</p>
                                                <Badge variant="outline" className={`rounded-lg border-0 px-2 py-0.5 h-6 font-bold ${conditions[selectedItem.condition].class}`}>
                                                    {conditions[selectedItem.condition].label}
                                                </Badge>
                                            </div>
                                            <div className="bg-secondary/5 p-4 rounded-2xl border border-border/40">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">ID Item</p>
                                                <p className="text-sm font-bold text-foreground">#{selectedItem.id}</p>
                                            </div>
                                        </div>

                                        {/* Disposal Info if applicable */}
                                        {selectedItem.status === 'disposed' && (
                                            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[1.5rem] space-y-4">
                                                <div className="flex items-center gap-2 text-amber-600 font-bold">
                                                    <Info className="h-5 w-5" />
                                                    Detalhamento da Baixa
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Motivo</Label>
                                                        <p className="text-lg font-bold text-amber-700">{selectedItem.disposal_reason}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Data da Baixa</Label>
                                                        <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                                            {new Date(selectedItem.disposal_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Observations Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border/40">
                                                <ClipboardList className="h-5 w-5 text-primary" />
                                                Observações e Notas
                                            </div>
                                            <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-border/60 min-h-[120px]">
                                                {selectedItem.description ? (
                                                    <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                                                        {selectedItem.description}
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-4 text-muted-foreground italic">
                                                        <p>Nenhuma observação cadastrada para este item.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-8 bg-muted/20 border-t flex justify-end">
                                    <Button onClick={() => setIsViewDialogOpen(false)} className="px-8 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold">
                                        Fechar Visualização
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </motion.div>
        </MainLayout >
    );
}
