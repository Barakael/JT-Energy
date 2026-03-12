import { HRLayout } from "@/components/HRLayout";
import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, subtitle, icon: Icon }: PlaceholderPageProps) {
  return (
    <HRLayout title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-4 rounded-xl bg-secondary mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          This module is under development. Check back soon for a fully functional {title.toLowerCase()} experience.
        </p>
      </div>
    </HRLayout>
  );
}
