import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Plus, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Financeiro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_name: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: transacoes = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.get("/transactions"),
  });

  const createMutation = useMutation({
    mutationFn: (newTransaction: any) => api.post("/transactions", newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Transação registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar transação.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category_name: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const openModal = (type: "entrada" | "saida") => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      type: transactionType,
      amount: parseFloat(formData.amount.replace(",", ".")),
    });
  };

  const totalEntradas = transacoes
    .filter((t: any) => t.type === "entrada" || t.tipo === "entrada")
    .reduce((acc: number, t: any) => acc + Number(t.amount || t.valor || 0), 0);

  const totalSaidas = transacoes
    .filter((t: any) => t.type === "saida" || t.tipo === "saida")
    .reduce((acc: number, t: any) => acc + Number(t.amount || t.valor || 0), 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <MainLayout title="Financeiro" breadcrumbs={[{ label: "Transações" }]}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-card p-6 shadow-card border-l-4 border-success"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <ArrowUpRight className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalEntradas)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-2xl bg-card p-6 shadow-card border-l-4 border-destructive"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <ArrowDownRight className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saídas</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card border-l-4 border-primary"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-xl font-bold text-primary">R$</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(saldo)}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transactions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Transações</h2>
                <p className="text-sm text-muted-foreground">Histórico de movimentações financeiras</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-success text-success hover:bg-success/10"
                  onClick={() => openModal("entrada")}
                >
                  <Plus className="h-4 w-4" />
                  Nova Entrada
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => openModal("saida")}
                >
                  <Plus className="h-4 w-4" />
                  Nova Saída
                </Button>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-semibold w-12">Tipo</TableHead>
                    <TableHead className="font-semibold">Descrição</TableHead>
                    <TableHead className="font-semibold">Categoria</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Data</TableHead>
                    <TableHead className="font-semibold text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma transação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transacoes.map((transacao: any, index: number) => {
                      const tipo = transacao.type || transacao.tipo;
                      const valor = Number(transacao.amount || transacao.valor || 0);
                      const dataStr = transacao.date || transacao.data;

                      return (
                        <motion.tr
                          key={transacao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.2 + index * 0.03 }}
                          className={`border-b hover:bg-secondary/30 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                            }`}
                        >
                          <TableCell>
                            {tipo === "entrada" ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                                <ArrowUpRight className="h-4 w-4 text-success" />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {transacao.description || transacao.descricao}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal capitalize">
                              {transacao.category_name || transacao.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {format(new Date(dataStr), "dd MMM yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${tipo === "entrada" ? "text-success" : "text-destructive"
                            }`}>
                            {tipo === "entrada" ? "+" : "-"} {formatCurrency(valor)}
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </>
      )}

      {/* New Transaction Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {transactionType === "entrada" ? "Nova Entrada" : "Nova Saída"}
            </DialogTitle>
            <DialogDescription>
              Registre uma nova movimentação financeira no sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Oferta de Domingo, Aluguel"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  onValueChange={(v) => setFormData({ ...formData, category_name: v })}
                  value={formData.category_name}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionType === "entrada" ? (
                      <>
                        <SelectItem value="Dízimo">Dízimo</SelectItem>
                        <SelectItem value="Oferta">Oferta</SelectItem>
                        <SelectItem value="Doação">Doação</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                        <SelectItem value="Luz/Água">Luz/Água</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Missões">Missões</SelectItem>
                        <SelectItem value="Salários">Salários</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className={transactionType === "entrada" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar {transactionType === "entrada" ? "Entrada" : "Saída"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

