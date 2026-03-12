import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "accent" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "bg-card border-border",
  accent: "bg-card border-l-4 border-l-accent border-border",
  success: "bg-card border-l-4 border-l-success border-border",
  warning: "bg-card border-l-4 border-l-warning border-border",
  info: "bg-card border-l-4 border-l-info border-border",
};

const iconVariantStyles = {
  default: "bg-secondary text-foreground",
  accent: "bg-accent/20 text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function StatsCard({ title, value, icon: Icon, trend, trendUp, variant = "default" }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border p-5 shadow-sm transition-shadow hover:shadow-md", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-success" : "text-destructive")}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconVariantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
