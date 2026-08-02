import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-colors duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-sm",
  accent: "bg-accent text-on-accent hover:opacity-90 shadow-sm",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted hover:border-primary/40",
  ghost: "text-foreground hover:bg-muted",
  destructive:
    "bg-destructive text-on-destructive hover:opacity-90 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm [&_svg]:size-4",
  md: "h-11 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 px-7 text-base [&_svg]:size-5",
  icon: "h-11 w-11 [&_svg]:size-5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ref,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  // `asChild` merges the button styling onto a single child element (e.g. a
  // <Link>) instead of rendering a <button>. Implemented with cloneElement so
  // this component stays usable inside Server Components.
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
}
