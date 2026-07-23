import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success:
    "bg-[color-mix(in_oklab,var(--success)_16%,transparent)] text-success",
  warning:
    "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-warning",
  danger:
    "bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] text-destructive",
  info: "bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-primary",
  accent: "bg-accent-soft text-accent",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
