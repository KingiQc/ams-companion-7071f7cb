import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-[17px] font-semibold text-foreground mb-1">{title}</p>
        <p className="text-[15px] text-muted-foreground max-w-md mx-auto">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-5 text-[15px]">{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
}
