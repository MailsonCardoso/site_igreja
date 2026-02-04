import { Users, DollarSign, UserPlus, CircleDot } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { BirthdaysList } from "@/components/dashboard/BirthdaysList";
import { AgeDistributionChart } from "@/components/dashboard/AgeDistributionChart";
import { kpiData } from "@/data/mockData";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Membros Ativos"
          value={kpiData.membrosAtivos.toLocaleString("pt-BR")}
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 3.2, isPositive: true }}
          delay={0}
        />
        <StatsCard
          title="Entradas do Mês"
          value={formatCurrency(kpiData.entradasMes)}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 8.1, isPositive: true }}
          delay={0.05}
        />
        <StatsCard
          title="Novos Visitantes"
          value={kpiData.novosVisitantes}
          icon={<UserPlus className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <StatsCard
          title="Células"
          value={kpiData.celulas}
          icon={<CircleDot className="h-6 w-6" />}
          trend={{ value: 2, isPositive: true }}
          delay={0.15}
        />
      </div>

      {/* Main Chart */}
      <div className="mb-6">
        <AttendanceChart />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BirthdaysList />
        <AgeDistributionChart />
      </div>
    </MainLayout>
  );
}
