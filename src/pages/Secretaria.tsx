import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label";

type MemberStatus = "ativo" | "inativo" | "disciplina";

const statusStyles: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  inativo: "bg-muted text-muted-foreground border-muted",
  disciplina: "bg-destructive/10 text-destructive border-destructive/20",
  Ativo: "bg-success/10 text-success border-success/20",
  Inativo: "bg-muted text-muted-foreground border-muted",
  Disciplina: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Secretaria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
  });

  // Create Member Mutation
  const createMemberMutation = useMutation({
    mutationFn: (newMember: any) => api.post("/members", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membro cadastrado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar membro");
    },
  });

  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      category: formData.get("category"),
      status: "ativo",
    };
    createMemberMutation.mutate(newMember);
  };

  const filteredMembros = members.filter((membro: any) => {
    const name = membro.name || membro.nome || "";
    const status = membro.status || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Secretaria" breadcrumbs={[{ label: "Membros" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-card p-6 shadow-card"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Membros</h2>
            <p className="text-sm text-muted-foreground">{filteredMembros.length} pessoas encontradas</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo membro da igreja.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" name="name" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" defaultValue="membro">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMemberMutation.isPending}>
                    {createMemberMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="disciplina">Disciplina</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table/Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Carregando membros...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Erro ao carregar dados. Verifique a conexão com o servidor.</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembros.map((membro: any, index: number) => (
                    <motion.tr
                      key={membro.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b hover:bg-secondary/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                              {(membro.name || membro.nome || "??").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{membro.name || membro.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal capitalize">
                          {membro.category || membro.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {membro.phone || membro.telefone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[membro.status] || "bg-muted text-muted-foreground"}>
                          {membro.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}

