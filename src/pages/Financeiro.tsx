import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Plus, Loader2, Calendar, ArrowUpDown, FileText, Printer, ChevronDown, Download, Receipt, Edit2, Trash2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const meses = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const anos = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

export default function Financeiro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada");

  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: churchSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings"),
  });

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_name: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: transacoes = [], isLoading } = useQuery({
    queryKey: ["transactions", selectedMonth, selectedYear],
    queryFn: () => api.get(`/transactions?month=${selectedMonth}&year=${selectedYear}`),
  });

  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", selectedMonth, selectedYear],
    queryFn: () => api.get(`/transactions/report?month=${selectedMonth}&year=${selectedYear}`),
    enabled: isReportOpen,
  });

  const createMutation = useMutation({
    mutationFn: (newTransaction: any) => api.post("/transactions", newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
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

  const updateMutation = useMutation({
    mutationFn: (transaction: any) => api.put(`/transactions/${transaction.id}`, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      setIsModalOpen(false);
      resetForm();
      setEditingId(null);
      toast({
        title: "Sucesso!",
        description: "Transação atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar transação.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      toast({
        title: "Sucesso!",
        description: "Transação excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir transação.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEditingId(null);
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
    const payload = {
      ...formData,
      type: transactionType,
      amount: parseFloat(formData.amount.replace(",", ".")),
    };

    if (editingId) {
      updateMutation.mutate({ ...payload, id: editingId });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEditModal = (transacao: any) => {
    setEditingId(transacao.id);
    setTransactionType(transacao.type || transacao.tipo);
    setFormData({
      description: transacao.description || transacao.descricao,
      amount: String(transacao.amount || transacao.valor).replace(".", ","),
      category_name: transacao.category_name || transacao.categoria,
      date: format(new Date(transacao.date || transacao.data), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente excluir esta transação?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTransactions = [...transacoes].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    let valA = a[key] || (key === 'date' ? a.data : a.valor);
    let valB = b[key] || (key === 'date' ? b.data : b.valor);

    if (key === 'amount') {
      valA = Number(valA);
      valB = Number(valB);
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalEntradas = transacoes
    .filter((t: any) => t.type === "entrada" || t.tipo === "entrada")
    .reduce((acc: number, t: any) => acc + Number(t.amount || t.valor || 0), 0);

  const totalSaidas = transacoes
    .filter((t: any) => t.type === "saida" || t.tipo === "saida")
    .reduce((acc: number, t: any) => acc + Number(t.amount || t.valor || 0), 0);

  const saldoMensal = totalEntradas - totalSaidas;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-report");
    if (!printContent) return;

    // Criar um iframe temporário
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Injetar o conteúdo e os estilos necessários
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Balancete Mensal</title>
          <style>
            @page { margin: 1.5cm; size: A4; }
            body { font-family: sans-serif; padding: 0; margin: 0; background: white; color: black; line-height: 1.5; }
            .p-10 { padding: 40px; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .font-bold { font-weight: bold; }
            .text-3xl { font-size: 24px; }
            .text-lg { font-size: 18px; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .text-2xl { font-size: 20px; }
            
            /* Grids */
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; gap: 32px; }
            .gap-8 { gap: 32px; }
            .gap-10 { gap: 40px; }
            .gap-20 { gap: 80px; }
            
            /* Spacing */
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .space-y-12 > * + * { margin-top: 48px; }
            .pt-4 { padding-top: 16px; }
            .pt-10 { padding-top: 40px; }
            .pt-20 { padding-top: 80px; }
            .pb-8 { padding-bottom: 32px; }
            .pb-10 { padding-bottom: 40px; }
            .mb-12 { margin-bottom: 48px; }
            
            /* Colors & Backgrounds */
            .text-success { color: #16a34a !important; }
            .text-destructive { color: #dc2626 !important; }
            .bg-primary\\/5 { background-color: rgba(59, 130, 246, 0.05); }
            .bg-primary\\/10 { background-color: rgba(59, 130, 246, 0.1); }
            .bg-secondary\\/5 { background-color: rgba(100, 116, 139, 0.05); }
            .bg-success\\/5 { background-color: rgba(22, 163, 74, 0.05); }
            .bg-destructive\\/5 { background-color: rgba(220, 38, 38, 0.05); }
            
            /* Borders */
            .border-b-4 { border-bottom: 4px solid #3b82f6; }
            .border-b-2 { border-bottom: 2px solid #e2e8f0; }
            .border-t { border-top: 1px solid #e2e8f0; }
            .border-dashed { border-style: dashed; }
            .border-black { border-color: black; }
            .border-success { border-color: #16a34a; }
            .border-destructive { border-color: #dc2626; }
            
            /* Shapes */
            .rounded-lg { border-radius: 8px; }
            .rounded-xl { border-radius: 12px; }
            .rounded-\\[2rem\\] { border-radius: 2rem; }
            
            /* Components */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .flex-col { flex-direction: column; }
            .tabular-nums { font-variant-numeric: tabular-nums; }
            .opacity-60 { opacity: 0.6; }
            .opacity-40 { opacity: 0.4; }
            .opacity-30 { opacity: 0.3; }
            
            .no-print { display: none !important; }
            .lucide { display: none !important; }
          </style>
        </head>
        <body>
          <div class="p-10">
            ${printContent.innerHTML}
          </div>
          <script>
            // Limpeza de ícones Lucide que foram copiados
            document.querySelectorAll('svg').forEach(s => s.remove());

            setTimeout(() => {
              window.print();
              window.onafterprint = () => {
                window.parent.document.body.removeChild(window.frameElement);
              };
            }, 500);
          <\/script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <MainLayout title="Financeiro" breadcrumbs={[{ label: "Transações" }]}>
      {/* Header com Filtros */}
      <div className="flex flex-col gap-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gestão de Período</h2>
            <p className="text-muted-foreground font-medium text-xs">Selecione o mês para visualizar o balanço</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] h-11 rounded-xl font-bold bg-card border-secondary/30">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {meses.map(m => (
                <SelectItem key={m.value} value={m.value} className="font-medium">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[110px] h-11 rounded-xl font-semibold bg-card border-secondary/30">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {anos.map(y => (
                <SelectItem key={y} value={y} className="font-medium">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setIsReportOpen(true)}
            variant="outline"
            className="h-11 rounded-xl border-primary text-primary hover:bg-primary/10 font-semibold px-6 flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            Balancete
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] shadow-card">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-bold">Consolidando dados financeiros...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] bg-card p-6 shadow-xl border-l-8 border-success relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-32 w-32 -mr-8 -mt-8" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
                  <ArrowUpRight className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Entradas</p>
                  <p className="text-2xl font-bold text-success tabular-nums">{formatCurrency(totalEntradas)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-[2rem] bg-card p-6 shadow-xl border-l-8 border-destructive relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform">
                <ArrowDownRight className="h-32 w-32 -mr-8 -mt-8" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
                  <ArrowDownRight className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Saídas</p>
                  <p className="text-2xl font-bold text-destructive tabular-nums">{formatCurrency(totalSaidas)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-[2rem] bg-card p-6 shadow-xl border-l-8 border-primary relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform">
                <Calendar className="h-32 w-32 -mr-8 -mt-8" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <span className="text-xl font-semibold">R$</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Saldo do Período</p>
                  <p className={`text-2xl font-bold tabular-nums ${saldoMensal >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {formatCurrency(saldoMensal)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transactions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-[2rem] bg-card p-8 shadow-card border border-border/50"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Fluxo de Caixa</h2>
                <p className="text-sm text-muted-foreground font-medium">Listagem detalhada das movimentações de {meses.find(m => m.value === selectedMonth)?.label}/{selectedYear}</p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="gap-2 h-11 border-success/30 bg-success/5 text-success hover:bg-success/10 font-bold rounded-xl px-5"
                  onClick={() => openModal("entrada")}
                >
                  <Plus className="h-5 w-5" />
                  Nova Entrada
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-11 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 font-bold rounded-xl px-5"
                  onClick={() => openModal("saida")}
                >
                  <Plus className="h-5 w-5" />
                  Nova Saída
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-b-2">
                    <TableHead className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground text-center w-20">Tipo</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">Descrição</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">Categoria</TableHead>
                    <TableHead
                      className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground cursor-pointer group w-40"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                        Data <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground text-right cursor-pointer group w-44"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-2 group-hover:text-primary transition-colors">
                        Valor <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground text-right w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3 opacity-50">
                          <Receipt className="h-12 w-12" />
                          <p className="font-bold text-muted-foreground">Nenhuma transação para este período.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedTransactions.map((transacao: any, index: number) => {
                      const tipo = transacao.type || transacao.tipo;
                      const valor = Number(transacao.amount || transacao.valor || 0);
                      const dataStr = transacao.date || transacao.data;

                      return (
                        <motion.tr
                          key={transacao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="border-b border-border/30 hover:bg-secondary/20 transition-all group"
                        >
                          <TableCell className="text-center">
                            {tipo === "entrada" ? (
                              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success shadow-inner group-hover:scale-110 transition-transform">
                                <ArrowUpRight className="h-5 w-5" />
                              </div>
                            ) : (
                              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-inner group-hover:scale-110 transition-transform">
                                <ArrowDownRight className="h-5 w-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {transacao.description || transacao.descricao}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold uppercase text-[11px] tracking-wider bg-card border-secondary/50">
                              {transacao.category_name || transacao.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-bold text-sm">
                            {format(new Date(dataStr), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className={`text-right font-semibold tabular-nums text-lg ${tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                            <span className="text-[10px] opacity-50 mr-1">{tipo === "entrada" ? "+" : "-"}</span>
                            {formatCurrency(valor)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
                                onClick={() => openEditModal(transacao)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                                onClick={() => handleDelete(transacao.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Modal de Balancete para Impressão */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary/5 border-b shrink-0 flex flex-row items-center justify-between no-print">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-foreground">Balancete Mensal</DialogTitle>
                <DialogDescription className="font-semibold text-primary">
                  {meses.find(m => m.value === selectedMonth)?.label} / {selectedYear}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl font-semibold gap-2">
                <Printer className="h-4 w-4" /> Imprimir / PDF
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 print:overflow-visible">
            {isLoadingReport ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                <p className="font-semibold text-muted-foreground">Gerando relatório...</p>
              </div>
            ) : reportData ? (
              <div id="printable-report" className="p-10 space-y-12 bg-white text-black min-h-full">
                <div className="text-center space-y-2 pb-8 border-b-4 border-primary">
                  <h1 className="text-3xl font-bold uppercase tracking-tight">{churchSettings?.nome || 'IPR JAGUAREMA'}</h1>
                  <p className="text-sm font-semibold opacity-60">Relatório Consolidado de Transações Financeiras</p>
                  <p className="text-lg font-bold bg-primary/10 py-1 rounded-lg inline-block px-4">
                    FECHAMENTO: {meses.find(m => m.value === selectedMonth)?.label.toUpperCase()} / {selectedYear}
                  </p>
                </div>

                {/* Resumo Consolidado */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b-2 border-dashed">
                      <span className="font-semibold uppercase text-xs">Saldo Inicial (Anterior):</span>
                      <span className="font-semibold tabular-nums">{formatCurrency(reportData.previous_balance)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b-2 border-dashed text-success">
                      <span className="font-semibold uppercase text-xs">Total de Entradas:</span>
                      <span className="font-bold tabular-nums">+ {formatCurrency(reportData.total_income)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b-2 border-dashed text-destructive">
                      <span className="font-semibold uppercase text-xs">Total de Saídas:</span>
                      <span className="font-bold tabular-nums">- {formatCurrency(reportData.total_expense)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-primary/5 px-4 rounded-xl">
                      <span className="font-semibold uppercase text-sm">Saldo Final do Mês:</span>
                      <span className="text-2xl font-bold tabular-nums">{formatCurrency(reportData.previous_balance + (reportData.total_income - reportData.total_expense))}</span>
                    </div>
                  </div>

                  <div className="bg-secondary/5 p-6 rounded-[2rem] border-2 border-secondary/20 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-2">Desempenho no Mês</p>
                    <div className={`text-3xl font-bold tabular-nums ${reportData.current_balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {reportData.current_balance > 0 ? '+' : ''}{formatCurrency(reportData.current_balance)}
                    </div>
                    <p className="text-[10px] font-medium mt-2 leading-tight">Este valor representa a diferença entre o que entrou e o que saiu exclusivamente neste mês.</p>
                  </div>
                </div>

                {/* Detalhamento por Categoria */}
                <div className="grid grid-cols-2 gap-10 pt-4">
                  {/* Entradas Grouped */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 font-semibold uppercase tracking-wider text-success border-b-2 border-success pb-2 text-sm">
                      <ArrowUpRight className="h-5 w-5" /> Entradas por Categoria
                    </h3>
                    <div className="space-y-3">
                      {reportData.grouped_data?.entrada ? Object.entries(reportData.grouped_data.entrada).map(([cat, data]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center bg-success/5 p-3 rounded-xl border border-success/10">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{cat}</span>
                            <span className="text-[9px] font-semibold uppercase opacity-40">{data.count} Lançamento(s)</span>
                          </div>
                          <span className="font-semibold tabular-nums text-success">{formatCurrency(data.total)}</span>
                        </div>
                      )) : <p className="text-xs italic opacity-40">Sem registros de entrada.</p>}
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>SUBTOTAL:</span>
                        <span>{formatCurrency(reportData.total_income)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Saidas Grouped */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 font-semibold uppercase tracking-wider text-destructive border-b-2 border-destructive pb-2 text-sm">
                      <ArrowDownRight className="h-5 w-5" /> Saídas por Categoria
                    </h3>
                    <div className="space-y-3">
                      {reportData.grouped_data?.saida ? Object.entries(reportData.grouped_data.saida).map(([cat, data]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{cat}</span>
                            <span className="text-[9px] font-semibold uppercase opacity-40">{data.count} Lançamento(s)</span>
                          </div>
                          <span className="font-semibold tabular-nums text-destructive">{formatCurrency(data.total)}</span>
                        </div>
                      )) : <p className="text-xs italic opacity-40">Sem registros de saída.</p>}
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>SUBTOTAL:</span>
                        <span>{formatCurrency(reportData.total_expense)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-20 pt-20 pb-10">
                  <div className="text-center space-y-2">
                    <div className="border-b-2 border-black w-full h-10"></div>
                    <p className="text-[10px] font-semibold uppercase">Responsável Tesouraria</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="border-b-2 border-black w-full h-10"></div>
                    <p className="text-[10px] font-semibold uppercase">Conselho Fiscal / Pastor</p>
                  </div>
                </div>

                <div className="text-center text-[9px] opacity-30 pt-10 border-t">
                  Gerado automaticamente pelo Sistema de Gestão Eclesiástica - {format(new Date(), "PPpp", { locale: ptBR })}
                </div>
              </div>
            ) : null}
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-card no-print">
            <Button variant="outline" className="h-12 rounded-xl font-semibold px-8" onClick={() => setIsReportOpen(false)}>Fechar Fechamento</Button>
            <Button onClick={handlePrint} className="h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold px-10 gap-2 shadow-xl shadow-primary/20">
              <Printer className="h-5 w-5" /> Imprimir Balancete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Transaction Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header Fixo */}
          <div className={`p-8 border-b flex items-center gap-4 shrink-0 ${transactionType === 'entrada' ? 'bg-success/5' : 'bg-destructive/5'}`}>
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 ${transactionType === 'entrada' ? 'bg-success/10 border-success/20 text-success' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {transactionType === 'entrada' ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownRight className="h-8 w-8" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {editingId ? (transactionType === "entrada" ? "Editar Entrada" : "Editar Saída") : (transactionType === "entrada" ? "Registrar Entrada" : "Registrar Saída")}
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground italic">
                {transactionType === "entrada" ? "Adicione dízimos, ofertas ou doações recebidas." : "Registre pagamentos de contas, salários e manutenções."}
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-card">
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Descrição</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="description"
                        name="description"
                        placeholder="Ex: Oferta de Culto de Domingo"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl border-input bg-background font-semibold transition-all focus:border-primary/50 pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Valor (R$)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">R$</span>
                        <Input
                          id="amount"
                          name="amount"
                          type="text"
                          placeholder="0,00"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className="h-11 rounded-xl border-input bg-background font-semibold text-lg text-foreground pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data da Operação</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl border-input bg-background font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Categoria Financeira</Label>
                    <Select
                      onValueChange={(v) => setFormData({ ...formData, category_name: v })}
                      value={formData.category_name}
                      required
                    >
                      <SelectTrigger id="category" className="h-11 rounded-xl border-input bg-background font-semibold">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {transactionType === "entrada" ? (
                          <>
                            <SelectItem value="Dízimo" className="font-semibold text-success">Dízimo</SelectItem>
                            <SelectItem value="Oferta" className="font-semibold">Oferta</SelectItem>
                            <SelectItem value="Doação" className="font-semibold">Doação</SelectItem>
                            <SelectItem value="Evento" className="font-semibold">Evento</SelectItem>
                            <SelectItem value="Outros" className="font-semibold">Outros</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Aluguel" className="font-semibold text-destructive">Aluguel</SelectItem>
                            <SelectItem value="Luz/Água" className="font-semibold">Luz/Água</SelectItem>
                            <SelectItem value="Manutenção" className="font-semibold">Manutenção</SelectItem>
                            <SelectItem value="Missões" className="font-semibold">Missões</SelectItem>
                            <SelectItem value="Salários" className="font-semibold">Salários</SelectItem>
                            <SelectItem value="Outros" className="font-semibold">Outros</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-8 border-t border-secondary/10 flex gap-4 shrink-0 bg-card">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 h-12 rounded-xl font-semibold gap-2 shadow-xl ${transactionType === "entrada" ? "bg-success hover:bg-success/90 shadow-success/20" : "bg-destructive hover:bg-destructive/90 shadow-destructive/20"}`}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {editingId ? "Atualizar Lançamento" : "Efetivar Lançamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </MainLayout>
  );
}

function Save(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
