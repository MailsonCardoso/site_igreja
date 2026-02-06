import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, UserPlus, CircleDot, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MemberGrowthChart } from "@/components/dashboard/MemberGrowthChart";
import { BirthdaysList } from "@/components/dashboard/BirthdaysList";
import { AgeDistributionChart } from "@/components/dashboard/AgeDistributionChart";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  let user = { role: "Administrador" };
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Error parsing user in dashboard", e);
  }
  
  const userRole = user?.role || "Administrador";
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === "Financeiro") {
      navigate("/financeiro", { replace: true });
    }
  }, [userRole, navigate]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
    enabled: userRole !== "Financeiro"
  });

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p className="text-lg">Preparando painel de controle...</p>
        </div>
      </MainLayout>
    );
  }

  // Fallback values if API is empty or connecting
  const stats = dashboardData || {
    members_count: 0,
    income: 0,
    visitors_count: 0,
    cells_count: 0,
  };

  return (
    <MainLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Membros Ativos"
          value={(stats.members_count || 0).toLocaleString("pt-BR")}
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 0, isPositive: true }}
          delay={0}
        />
        {!["secretaria", "secretário"].includes(userRole.toLowerCase()) && (
          <StatsCard
            title="Entradas do Mês"
            value={formatCurrency(stats.income || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 0, isPositive: true }}
            delay={0.05}
          />
        )}
        <StatsCard
          title="Novos Visitantes"
          value={stats.visitors_count || 0}
          icon={<UserPlus className="h-6 w-6" />}
          trend={{ value: 0, isPositive: true }}
          delay={0.1}
        />
        <StatsCard
          title="Células"
          value={stats.cells_count || 0}
          icon={<CircleDot className="h-6 w-6" />}
          trend={{ value: 0, isPositive: true }}
          delay={0.15}
        />
      </div>

      {/* Main Chart */}
      <div className="mb-6">
        <MemberGrowthChart />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BirthdaysList />
        <AgeDistributionChart />
      </div>
    </MainLayout>
  );
}

