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
    Filter
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
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);

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
            reset();
            setSelectedItem(null);
        },
        onError: () => toast.error("Erro ao atualizar item"),
    });

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

    const filteredItems = items.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

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
                        <p className="text-sm text-muted-foreground">{items.length} itens catalogados no sistema</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setIsEditMode(false);
                            setSelectedItem(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <Plus className="h-5 w-5" />
                                Novo Equipamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-primary/5 p-8 border-b border-primary/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold">
                                            {isEditMode ? "Editar Equipamento" : "Novo Patrimônio"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Preencha os dados técnicos e contábeis do item.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </div>

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
                        </DialogContent>
                    </Dialog>
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
                            <p className="text-xl font-bold">{items.filter((i: any) => i.condition === 'ruim' || i.condition === 'regular').length}</p>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Carregando inventário...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map((item: any, index: number) => {
                            const Icon = getCategoryIcon(item.category);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group bg-card hover:bg-secondary/5 rounded-[2rem] border border-border/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="cursor-pointer text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={`rounded-full px-3 py-0 border-0 ${conditions[item.condition].class}`}>
                                                {conditions[item.condition].label}
                                            </Badge>
                                            <span className="text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{item.category}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-foreground leading-tight">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{item.description || "Sem descrição adicional."}</p>

                                        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {item.location || "Indefinido"}
                                            </div>
                                            <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                                <span className="text-xs font-bold text-primary">Qtd: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[3rem] border border-dashed border-secondary/20">
                        <Package className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Nenhum item encontrado</h3>
                        <p className="text-muted-foreground">Tente uma busca diferente ou adicione um novo item.</p>
                    </div>
                )}

                {/* Delete Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remover do Inventário?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação removerá permanentemente o item <strong>{selectedItem?.name}</strong>. Deseja continuar?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(selectedItem.id)} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Remover
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        </MainLayout>
    );
}
