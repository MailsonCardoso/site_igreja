import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
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
import { transacoes } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Financeiro() {
  const totalEntradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((acc, t) => acc + t.valor, 0);
  
  const totalSaidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((acc, t) => acc + t.valor, 0);
  
  const saldo = totalEntradas - totalSaidas;

  return (
    <MainLayout title="Financeiro" breadcrumbs={[{ label: "Transações" }]}>
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
            <Button variant="outline" className="gap-2 border-success text-success hover:bg-success/10">
              <Plus className="h-4 w-4" />
              Nova Entrada
            </Button>
            <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
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
              {transacoes.map((transacao, index) => (
                <motion.tr
                  key={transacao.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + index * 0.03 }}
                  className={`border-b hover:bg-secondary/30 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                  }`}
                >
                  <TableCell>
                    {transacao.tipo === "entrada" ? (
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
                    {transacao.descricao}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {transacao.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {format(new Date(transacao.data), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    transacao.tipo === "entrada" ? "text-success" : "text-destructive"
                  }`}>
                    {transacao.tipo === "entrada" ? "+" : "-"} {formatCurrency(transacao.valor)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </MainLayout>
  );
}
