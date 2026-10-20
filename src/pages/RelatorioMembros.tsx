import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  User,
  Baby,
  Heart,
  Search,
  FileDown,
  Printer,
  ArrowLeft,
  Calendar,
  Phone,
  Church,
  Cake,
  Download,
  Loader2,
  CheckCircle2,
  Filter,
  Sparkles,
  UserCheck,
  Building2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { differenceInYears, parseISO, isValid } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function RelatorioMembros() {
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filtros
  const [activeTab, setActiveTab] = useState("resumo");
  const [searchTerm, setSearchTerm] = useState("");
  const [congregacaoFilter, setCongregacaoFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("membro"); // 'membro', 'todos', 'visitante'
  const [isExporting, setIsExporting] = useState(false);

  // Buscar membros
  const { data: members = [], isLoading } = useQuery<any[]>({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
  });

  // Função utilitária para calcular idade
  const getAge = (birthDateString?: string | null): number | null => {
    if (!birthDateString) return null;
    try {
      const parsed = parseISO(birthDateString);
      if (!isValid(parsed)) return null;
      return differenceInYears(new Date(), parsed);
    } catch {
      return null;
    }
  };

  // Formatador de data de nascimento (DD/MM)
  const formatBirthDay = (birthDateString?: string | null): string => {
    if (!birthDateString) return "-";
    try {
      const parts = birthDateString.split("T")[0].split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return "-";
    } catch {
      return "-";
    }
  };

  // Base filtrada por congregação e status
  const baseMembers = useMemo(() => {
    return members.filter((m) => {
      // Filtro de congregação
      if (
        congregacaoFilter !== "todas" &&
        m.congregacao?.toLowerCase() !== congregacaoFilter.toLowerCase()
      ) {
        return false;
      }
      // Filtro de status
      if (statusFilter === "membro") {
        return m.status === "membro" || !m.status;
      }
      if (statusFilter === "visitante") {
        return m.status === "visitante";
      }
      if (statusFilter === "afastado") {
        return m.status === "afastado";
      }
      return true; // todos
    });
  }, [members, congregacaoFilter, statusFilter]);

  // Lista de Mulheres (Adultas / Jovens com sexo feminino)
  const mulheresList = useMemo(() => {
    return baseMembers
      .filter((m) => {
        const isFem =
          m.sex?.toLowerCase() === "feminino" ||
          m.sex?.toLowerCase() === "f" ||
          m.sex?.toLowerCase() === "mulher";
        const age = getAge(m.birth_date);
        // Exclui crianças <= 12 que vão para a aba Crianças
        const isNotChild = age === null || age > 12;
        const matchesSearch =
          !searchTerm ||
          (m.name || m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.phone || "").includes(searchTerm) ||
          (m.role || "").toLowerCase().includes(searchTerm.toLowerCase());
        return isFem && isNotChild && matchesSearch;
      })
      .sort((a, b) =>
        (a.name || a.nome || "").localeCompare(b.name || b.nome || "")
      );
  }, [baseMembers, searchTerm]);

  // Lista de Homens (Adultos / Jovens com sexo masculino)
  const homensList = useMemo(() => {
    return baseMembers
      .filter((m) => {
        const isMasc =
          m.sex?.toLowerCase() === "masculino" ||
          m.sex?.toLowerCase() === "m" ||
          m.sex?.toLowerCase() === "homem";
        const age = getAge(m.birth_date);
        // Exclui crianças <= 12 que vão para a aba Crianças
        const isNotChild = age === null || age > 12;
        const matchesSearch =
          !searchTerm ||
          (m.name || m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.phone || "").includes(searchTerm) ||
          (m.role || "").toLowerCase().includes(searchTerm.toLowerCase());
        return isMasc && isNotChild && matchesSearch;
      })
      .sort((a, b) =>
        (a.name || a.nome || "").localeCompare(b.name || b.nome || "")
      );
  }, [baseMembers, searchTerm]);

  // Lista de Crianças (Idade <= 12 anos)
  const criancasList = useMemo(() => {
    return baseMembers
      .filter((m) => {
        const age = getAge(m.birth_date);
        const isChild = age !== null && age <= 12;
        const matchesSearch =
          !searchTerm ||
          (m.name || m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.father_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.mother_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        return isChild && matchesSearch;
      })
      .sort((a, b) => {
        // Ordena por idade crescente
        const ageA = getAge(a.birth_date) ?? 0;
        const ageB = getAge(b.birth_date) ?? 0;
        return ageA - ageB;
      });
  }, [baseMembers, searchTerm]);

  // Mapa de membros por ID para busca rápida
  const membersById = useMemo(() => {
    const map = new Map<number | string, any>();
    members.forEach((m) => map.set(m.id?.toString(), m));
    return map;
  }, [members]);

  // Lista de Casais (Agrupados em Pares)
  const casaisList = useMemo(() => {
    const processedIds = new Set<string>();
    const couples: Array<{
      id: string;
      marido?: any;
      esposa?: any;
      membro1: any;
      membro2?: any;
      temConjugeCadastrado: boolean;
      nomeCasal: string;
    }> = [];

    const marriedMembers = baseMembers.filter(
      (m) =>
        m.marital_status?.toLowerCase() === "casado" ||
        m.marital_status?.toLowerCase() === "casada"
    );

    marriedMembers.forEach((member) => {
      const memberId = member.id?.toString();
      if (processedIds.has(memberId)) return;

      const spouseId = member.spouse_id?.toString();
      const spouse = spouseId ? membersById.get(spouseId) : null;

      if (spouse) {
        // Ambos cadastrados!
        processedIds.add(memberId);
        processedIds.add(spouseId);

        const isMemberMale =
          member.sex?.toLowerCase() === "masculino" ||
          member.sex?.toLowerCase() === "m";
        const marido = isMemberMale ? member : spouse;
        const esposa = isMemberMale ? spouse : member;

        const nomeMarido = marido.name || marido.nome || "Esposo";
        const nomeEsposa = esposa.name || esposa.nome || "Esposa";

        if (
          !searchTerm ||
          nomeMarido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nomeEsposa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (marido.phone || "").includes(searchTerm) ||
          (esposa.phone || "").includes(searchTerm)
        ) {
          couples.push({
            id: `couple-${marido.id}-${esposa.id}`,
            marido,
            esposa,
            membro1: marido,
            membro2: esposa,
            temConjugeCadastrado: true,
            nomeCasal: `${nomeMarido} & ${nomeEsposa}`,
          });
        }
      } else {
        // Membro casado, porém cônjuge não vinculado diretamente no sistema
        processedIds.add(memberId);
        const name = member.name || member.nome || "Membro";
        if (
          !searchTerm ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.phone || "").includes(searchTerm)
        ) {
          couples.push({
            id: `single-couple-${member.id}`,
            membro1: member,
            temConjugeCadastrado: false,
            nomeCasal: name,
          });
        }
      }
    });

    return couples.sort((a, b) => a.nomeCasal.localeCompare(b.nomeCasal));
  }, [baseMembers, membersById, searchTerm]);

  // Estatísticas Demográficas
  const stats = useMemo(() => {
    const total = baseMembers.length;
    const totalMulheres = baseMembers.filter((m) => {
      const isFem =
        m.sex?.toLowerCase() === "feminino" ||
        m.sex?.toLowerCase() === "f" ||
        m.sex?.toLowerCase() === "mulher";
      const age = getAge(m.birth_date);
      return isFem && (age === null || age > 12);
    }).length;

    const totalHomens = baseMembers.filter((m) => {
      const isMasc =
        m.sex?.toLowerCase() === "masculino" ||
        m.sex?.toLowerCase() === "m" ||
        m.sex?.toLowerCase() === "homem";
      const age = getAge(m.birth_date);
      return isMasc && (age === null || age > 12);
    }).length;

    const totalCriancas = baseMembers.filter((m) => {
      const age = getAge(m.birth_date);
      return age !== null && age <= 12;
    }).length;

    const totalCasaisPares = casaisList.filter((c) => c.temConjugeCadastrado).length;

    return {
      total,
      totalMulheres,
      totalHomens,
      totalCriancas,
      totalCasais: totalCasaisPares,
      pctMulheres: total > 0 ? Math.round((totalMulheres / total) * 100) : 0,
      pctHomens: total > 0 ? Math.round((totalHomens / total) * 100) : 0,
      pctCriancas: total > 0 ? Math.round((totalCriancas / total) * 100) : 0,
    };
  }, [baseMembers, casaisList]);

  // Gráficos demográficos
  const genderChartData = useMemo(() => {
    return [
      { name: "Mulheres", value: stats.totalMulheres, color: "#ec4899" },
      { name: "Homens", value: stats.totalHomens, color: "#0284c7" },
      { name: "Crianças", value: stats.totalCriancas, color: "#10b981" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const ageChartData = useMemo(() => {
    const brackets = [
      { faixa: "0 a 12 (Crianças)", qtd: 0, fill: "#10b981" },
      { faixa: "13 a 17 (Adolescentes)", qtd: 0, fill: "#06b6d4" },
      { faixa: "18 a 30 (Jovens)", qtd: 0, fill: "#3b82f6" },
      { faixa: "31 a 50 (Adultos)", qtd: 0, fill: "#f59e0b" },
      { faixa: "51+ (Melhor Idade)", qtd: 0, fill: "#64748b" },
    ];

    baseMembers.forEach((m) => {
      const age = getAge(m.birth_date);
      if (age !== null) {
        if (age <= 12) brackets[0].qtd++;
        else if (age <= 17) brackets[1].qtd++;
        else if (age <= 30) brackets[2].qtd++;
        else if (age <= 50) brackets[3].qtd++;
        else brackets[4].qtd++;
      }
    });

    return brackets;
  }, [baseMembers]);

  // Exportar PDF
  const handleExportPDF = async (title: string, elementId?: string) => {
    try {
      setIsExporting(true);
      toast.info(`Gerando relatório de ${title}...`);

      const target = elementId
        ? document.getElementById(elementId)
        : printAreaRef.current;

      if (!target) {
        toast.error("Área de impressão não encontrada.");
        return;
      }

      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pdfWidth - 2 * margin;

      const dateStr = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Cabeçalho Oficial
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pdfWidth, 24, "F");

      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RELATÓRIO DE MEMBROS - ${title.toUpperCase()}`, margin, 12);

      pdf.setFontSize(9);
      pdf.setTextColor(203, 213, 225); // slate-300
      pdf.text(
        `Congregação: ${congregacaoFilter.toUpperCase()} | Gerado em: ${dateStr}`,
        margin,
        18
      );

      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const availableSpace = pdfHeight - 34;

      if (imgHeight <= availableSpace) {
        pdf.addImage(imgData, "PNG", margin, 28, contentWidth, imgHeight);
      } else {
        // Multi-page slicing
        let currentY = 0;
        let page = 1;
        while (currentY < canvas.height) {
          if (page > 1) {
            pdf.addPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pdfWidth, 16, "F");
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text(
              `RELATÓRIO: ${title.toUpperCase()} (Pág. ${page})`,
              margin,
              11
            );
          }

          const sliceHeight = Math.min(
            (availableSpace * canvas.width) / contentWidth,
            canvas.height - currentY
          );
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;

          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              currentY,
              canvas.width,
              sliceHeight,
              0,
              0,
              canvas.width,
              sliceHeight
            );
            const sliceData = sliceCanvas.toDataURL("image/png");
            const renderedHeight = (sliceHeight * contentWidth) / canvas.width;
            pdf.addImage(
              sliceData,
              "PNG",
              margin,
              page === 1 ? 28 : 20,
              contentWidth,
              renderedHeight
            );
          }

          currentY += sliceHeight;
          page++;
        }
      }

      pdf.save(`relatorio-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
      toast.success("Relatório gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const congregacoesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.congregacao) set.add(m.congregacao);
    });
    return Array.from(set);
  }, [members]);

  return (
    <MainLayout
      title="Relatórios de Membros"
      breadcrumbs={[
        { label: "Membros", href: "/secretaria" },
        { label: "Relatórios" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/secretaria")}
            className="gap-2 rounded-xl border-border/60 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Membros
          </Button>
          <Button
            size="sm"
            onClick={() => handleExportPDF(activeTab)}
            disabled={isExporting || isLoading}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Exportar PDF ({activeTab.toUpperCase()})
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-12">
        {/* Banner de Topo com KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total Geral */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Ativos
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {stats.total}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                membros
              </span>
            </div>
          </motion.div>

          {/* Mulheres */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => setActiveTab("mulheres")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:border-pink-500/50 ${
              activeTab === "mulheres"
                ? "border-pink-500 bg-pink-500/5 ring-2 ring-pink-500/20"
                : "border-border/50 bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Mulheres
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {stats.totalMulheres}
              </span>
              <Badge
                variant="outline"
                className="border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold"
              >
                {stats.pctMulheres}%
              </Badge>
            </div>
          </motion.div>

          {/* Homens */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setActiveTab("homens")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:border-sky-500/50 ${
              activeTab === "homens"
                ? "border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/20"
                : "border-border/50 bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Homens
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {stats.totalHomens}
              </span>
              <Badge
                variant="outline"
                className="border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold"
              >
                {stats.pctHomens}%
              </Badge>
            </div>
          </motion.div>

          {/* Crianças */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setActiveTab("criancas")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:border-emerald-500/50 ${
              activeTab === "criancas"
                ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
                : "border-border/50 bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Crianças (0-12)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Baby className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {stats.totalCriancas}
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold"
              >
                {stats.pctCriancas}%
              </Badge>
            </div>
          </motion.div>

          {/* Casais */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setActiveTab("casais")}
            className={`col-span-2 cursor-pointer rounded-2xl border p-5 shadow-sm transition-all sm:col-span-1 hover:border-amber-500/50 ${
              activeTab === "casais"
                ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                : "border-border/50 bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Casais (Pares)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {stats.totalCasais}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                uniões vinculadas
              </span>
            </div>
          </motion.div>
        </div>

        {/* Barra de Filtros Globais */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl border-border/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Congregação */}
            <Select
              value={congregacaoFilter}
              onValueChange={setCongregacaoFilter}
            >
              <SelectTrigger className="w-[180px] rounded-xl border-border/60">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Congregação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Congregações</SelectItem>
                <SelectItem value="IPR JAGUAREMA">IPR JAGUAREMA</SelectItem>
                <SelectItem value="IPR PARANÃ">IPR PARANÃ</SelectItem>
                {congregacoesDisponiveis
                  .filter(
                    (c) =>
                      c !== "IPR JAGUAREMA" &&
                      c !== "IPR PARANÃ" &&
                      Boolean(c)
                  )
                  .map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Filtro Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-xl border-border/60">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="membro">Membros Ativos</SelectItem>
                <SelectItem value="visitante">Visitantes</SelectItem>
                <SelectItem value="afastado">Afastados</SelectItem>
                <SelectItem value="todos">Todos os Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Abas Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-muted/60 p-1.5 h-auto">
            <TabsTrigger
              value="resumo"
              className="rounded-xl py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Visão</span> Geral
            </TabsTrigger>

            <TabsTrigger
              value="mulheres"
              className="rounded-xl py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-pink-600 data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4 text-pink-500" />
              Mulheres ({mulheresList.length})
            </TabsTrigger>

            <TabsTrigger
              value="homens"
              className="rounded-xl py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-sky-600 data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4 text-sky-500" />
              Homens ({homensList.length})
            </TabsTrigger>

            <TabsTrigger
              value="criancas"
              className="rounded-xl py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
            >
              <Baby className="h-4 w-4 text-emerald-500" />
              Crianças ({criancasList.length})
            </TabsTrigger>

            <TabsTrigger
              value="casais"
              className="rounded-xl py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
            >
              <Heart className="h-4 w-4 text-amber-500" />
              Casais ({casaisList.length})
            </TabsTrigger>
          </TabsList>

          {/* ========================================================= */}
          {/* ABA 1: VISÃO GERAL / RESUMO DEMOGRÁFICO                   */}
          {/* ========================================================= */}
          <TabsContent value="resumo" className="space-y-6">
            <div
              id="report-resumo-container"
              ref={printAreaRef}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Distribuição por Gênero */}
                <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-foreground">
                        Composição da Congregação
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stats.total} Total
                    </Badge>
                  </div>

                  <div className="h-64">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : genderChartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Nenhum registro para exibir
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {genderChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(val: number) => [
                              `${val} pessoas`,
                              "Quantidade",
                            ]}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Faixa Etária */}
                <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <Cake className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-foreground">
                        Distribuição por Faixa Etária
                      </h3>
                    </div>
                  </div>

                  <div className="h-64">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={ageChartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis
                            dataKey="faixa"
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <RechartsTooltip
                            formatter={(val: number) => [
                              `${val} membros`,
                              "Quantidade",
                            ]}
                          />
                          <Bar
                            dataKey="qtd"
                            radius={[6, 6, 0, 0]}
                            name="Membros"
                          >
                            {ageChartData.map((entry, idx) => (
                              <Cell key={`bar-${idx}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Quadro Rápido de Acesso aos Grupos */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  onClick={() => setActiveTab("mulheres")}
                  className="cursor-pointer rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-700 dark:text-pink-300">
                      Ministério Feminino
                    </span>
                    <User className="h-5 w-5 text-pink-500" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-pink-600 dark:text-pink-400">
                    {stats.totalMulheres}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ver listagem de mulheres e contatos →
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("homens")}
                  className="cursor-pointer rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-700 dark:text-sky-300">
                      Ministério Masculino
                    </span>
                    <User className="h-5 w-5 text-sky-500" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
                    {stats.totalHomens}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ver listagem de homens e contatos →
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("criancas")}
                  className="cursor-pointer rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      Departamento Infantil
                    </span>
                    <Baby className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.totalCriancas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crianças até 12 anos e responsáveis →
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("casais")}
                  className="cursor-pointer rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      Ministério de Casais
                    </span>
                    <Heart className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {stats.totalCasais} pares
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ver casais vinculados lado a lado →
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================= */}
          {/* ABA 2: MULHERES                                           */}
          {/* ========================================================= */}
          <TabsContent value="mulheres" className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Lista de Mulheres ({mulheresList.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Membros e congregadas do sexo feminino (jovens e adultas)
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF("Mulheres", "mulheres-print-area")}
                className="gap-2 border-pink-500/30 text-pink-600 hover:bg-pink-500/10 rounded-xl"
              >
                <Download className="h-4 w-4" />
                Baixar Lista em PDF
              </Button>
            </div>

            <div
              id="mulheres-print-area"
              className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm"
            >
              {mulheresList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma mulher encontrada com os filtros atuais.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {mulheresList.map((m, index) => {
                    const age = getAge(m.birth_date);
                    const bday = formatBirthDay(m.birth_date);
                    return (
                      <div
                        key={m.id || index}
                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-xs font-mono text-muted-foreground font-semibold">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <Avatar className="h-10 w-10 border border-pink-500/20">
                            <AvatarFallback className="bg-pink-500/10 text-pink-600 font-bold text-xs">
                              {(m.name || m.nome || "M").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {m.name || m.nome}
                              </span>
                              {m.role && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 font-medium"
                                >
                                  {m.role}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {bday !== "-" && (
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                  <Cake className="h-3 w-3 text-pink-500" />
                                  {bday} {age !== null && `(${age} anos)`}
                                </span>
                              )}
                              {m.congregacao && (
                                <span className="flex items-center gap-1">
                                  <Church className="h-3 w-3" />
                                  {m.congregacao}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contatos */}
                        <div className="flex items-center gap-2 pl-9 sm:pl-0">
                          {m.phone ? (
                            <a
                              href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {m.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Sem telefone
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================================= */}
          {/* ABA 3: HOMENS                                             */}
          {/* ========================================================= */}
          <TabsContent value="homens" className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Lista de Homens ({homensList.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Membros e congregados do sexo masculino (jovens e adultos)
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF("Homens", "homens-print-area")}
                className="gap-2 border-sky-500/30 text-sky-600 hover:bg-sky-500/10 rounded-xl"
              >
                <Download className="h-4 w-4" />
                Baixar Lista em PDF
              </Button>
            </div>

            <div
              id="homens-print-area"
              className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm"
            >
              {homensList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhum homem encontrado com os filtros atuais.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {homensList.map((m, index) => {
                    const age = getAge(m.birth_date);
                    const bday = formatBirthDay(m.birth_date);
                    return (
                      <div
                        key={m.id || index}
                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-xs font-mono text-muted-foreground font-semibold">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <Avatar className="h-10 w-10 border border-sky-500/20">
                            <AvatarFallback className="bg-sky-500/10 text-sky-600 font-bold text-xs">
                              {(m.name || m.nome || "H").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {m.name || m.nome}
                              </span>
                              {m.role && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 font-medium"
                                >
                                  {m.role}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {bday !== "-" && (
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                  <Cake className="h-3 w-3 text-sky-500" />
                                  {bday} {age !== null && `(${age} anos)`}
                                </span>
                              )}
                              {m.congregacao && (
                                <span className="flex items-center gap-1">
                                  <Church className="h-3 w-3" />
                                  {m.congregacao}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contatos */}
                        <div className="flex items-center gap-2 pl-9 sm:pl-0">
                          {m.phone ? (
                            <a
                              href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {m.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Sem telefone
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================================= */}
          {/* ABA 4: CRIANÇAS                                           */}
          {/* ========================================================= */}
          <TabsContent value="criancas" className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Departamento Infantil ({criancasList.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Crianças de 0 a 12 anos, datas de aniversário e responsáveis
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF("Crianças", "criancas-print-area")}
                className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
              >
                <Download className="h-4 w-4" />
                Baixar Lista em PDF
              </Button>
            </div>

            <div
              id="criancas-print-area"
              className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm"
            >
              {criancasList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma criança cadastrada (com idade até 12 anos) nos filtros atuais.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {criancasList.map((m, index) => {
                    const age = getAge(m.birth_date);
                    const bday = formatBirthDay(m.birth_date);

                    // Pais vinculados
                    const father = m.father_id
                      ? membersById.get(m.father_id.toString())
                      : null;
                    const mother = m.mother_id
                      ? membersById.get(m.mother_id.toString())
                      : null;

                    const fatherName = father
                      ? father.name || father.nome
                      : m.father_name;
                    const motherName = mother
                      ? mother.name || mother.nome
                      : m.mother_name;

                    const contactPhone =
                      mother?.phone || father?.phone || m.phone;

                    return (
                      <div
                        key={m.id || index}
                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-xs font-mono text-muted-foreground font-semibold">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <Avatar className="h-10 w-10 border border-emerald-500/20">
                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                              {(m.name || m.nome || "C").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {m.name || m.nome}
                              </span>
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px]">
                                {age === 0 ? "Bebê (< 1 ano)" : `${age} anos`}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {bday !== "-" && (
                                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  <Cake className="h-3 w-3 text-emerald-500" />
                                  Aniversário: {bday}
                                </span>
                              )}
                              {(fatherName || motherName) && (
                                <span className="text-slate-500">
                                  Pais:{" "}
                                  {[fatherName, motherName]
                                    .filter(Boolean)
                                    .join(" e ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Telefone do responsável */}
                        <div className="flex items-center gap-2 pl-9 sm:pl-0">
                          {contactPhone ? (
                            <a
                              href={`https://wa.me/55${contactPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Resp: {contactPhone}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Sem contato dos pais
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================================= */}
          {/* ABA 5: CASAIS                                             */}
          {/* ========================================================= */}
          <TabsContent value="casais" className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Ministério de Casais ({casaisList.length} registros)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Casais vinculados no sistema, contatos e congregações
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF("Casais", "casais-print-area")}
                className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 rounded-xl"
              >
                <Download className="h-4 w-4" />
                Baixar Lista de Casais (PDF)
              </Button>
            </div>

            <div
              id="casais-print-area"
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {casaisList.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-muted-foreground rounded-2xl border bg-card">
                  Nenhum casal cadastrado com os filtros atuais.
                </div>
              ) : (
                casaisList.map((couple, index) => {
                  const m1 = couple.membro1;
                  const m2 = couple.membro2;

                  return (
                    <motion.div
                      key={couple.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-amber-500/40 transition-all"
                    >
                      <div>
                        {/* Header do Card */}
                        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                              <Heart className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm text-foreground">
                              Casal #{(index + 1).toString().padStart(2, "0")}
                            </span>
                          </div>

                          <Badge
                            variant={couple.temConjugeCadastrado ? "default" : "outline"}
                            className={
                              couple.temConjugeCadastrado
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                                : "text-[10px] text-muted-foreground"
                            }
                          >
                            {couple.temConjugeCadastrado
                              ? "Casal Vinculado"
                              : "Cônjuge Pendente"}
                          </Badge>
                        </div>

                        {/* Se tem ambos vinculados */}
                        {couple.temConjugeCadastrado && m2 ? (
                          <div className="grid grid-cols-2 gap-3 py-1">
                            {/* Cônjuge 1 (Marido) */}
                            <div className="rounded-xl bg-muted/40 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                Esposo
                              </span>
                              <p className="font-semibold text-xs text-foreground mt-0.5 truncate">
                                {m1.name || m1.nome}
                              </p>
                              {m1.phone && (
                                <a
                                  href={`https://wa.me/55${m1.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline"
                                >
                                  <Phone className="h-3 w-3" />
                                  {m1.phone}
                                </a>
                              )}
                            </div>

                            {/* Cônjuge 2 (Esposa) */}
                            <div className="rounded-xl bg-muted/40 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                                Esposa
                              </span>
                              <p className="font-semibold text-xs text-foreground mt-0.5 truncate">
                                {m2.name || m2.nome}
                              </p>
                              {m2.phone && (
                                <a
                                  href={`https://wa.me/55${m2.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline"
                                >
                                  <Phone className="h-3 w-3" />
                                  {m2.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Caso apenas um membro esteja cadastrado
                          <div className="rounded-xl bg-muted/40 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                              Membro Casado
                            </span>
                            <p className="font-semibold text-sm text-foreground mt-0.5">
                              {m1.name || m1.nome}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              * Cônjuge ainda não vinculado no cadastro de membros.
                            </p>
                            {m1.phone && (
                              <a
                                href={`https://wa.me/55${m1.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {m1.phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer do Card */}
                      <div className="mt-4 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Church className="h-3 w-3" />
                          {m1.congregacao || "Congregação não informada"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
