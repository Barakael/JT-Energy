import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info" | "accent";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  accent: "bg-accent/30 text-accent-foreground",
};

export function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", styles[variant])}>
      {label}
    </span>
  );
}
