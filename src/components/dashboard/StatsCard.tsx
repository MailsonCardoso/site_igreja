import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
  variant?: "default" | "success" | "warning" | "info" | "destructive";
}

const variantStyles = {
  default: {
    border: "border-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  success: {
    border: "border-success",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    valueColor: "text-success",
  },
  warning: {
    border: "border-orange-500",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    valueColor: "text-orange-500",
  },
  info: {
    border: "border-blue-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    valueColor: "text-blue-500",
  },
  destructive: {
    border: "border-destructive",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    valueColor: "text-destructive",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
  delay = 0,
  variant = "default"
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-card p-6 shadow-xl border-l-8 transition-shadow hover:shadow-2xl group",
        styles.border,
        className
      )}
    >
      <div className={cn(
        "absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none",
        styles.valueColor
      )}>
        <div className="h-32 w-32 -mr-8 -mt-8 [&>svg]:h-full [&>svg]:w-full">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner",
          styles.iconBg,
          styles.iconColor
        )}>
          <div className="[&>svg]:h-7 [&>svg]:w-7">{icon}</div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
          <p className={cn("text-2xl font-black tabular-nums tracking-tight", styles.valueColor)}>{value}</p>
          {trend && (
            <p
              className={cn(
                "text-[10px] font-bold mt-1 flex items-center gap-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}% <span className="text-muted-foreground font-medium opacity-70">vs mês anterior</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
