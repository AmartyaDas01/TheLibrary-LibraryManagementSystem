import { cn } from "@/lib/utils";

/**
 * A procedurally generated book cover — no external image assets.
 * The hue (stored per book) drives a consistent cloth-and-foil colour scheme,
 * so every title looks distinct while staying on-brand.
 */
export function BookCover({
  title,
  author,
  hue,
  className,
}: {
  title: string;
  author: string;
  hue: number;
  className?: string;
}) {
  const spine = `hsl(${hue} 42% 26%)`;
  const face = `hsl(${hue} 38% 34%)`;
  const foil = `hsl(${(hue + 36) % 360} 70% 72%)`;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-md ring-1 ring-black/10",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${face}, ${spine})`,
      }}
      aria-hidden="true"
    >
      {/* Spine highlight */}
      <div
        className="absolute inset-y-0 left-0 w-[9%]"
        style={{
          background: `linear-gradient(90deg, rgba(0,0,0,0.28), rgba(255,255,255,0.10))`,
        }}
      />
      {/* Foil frame */}
      <div
        className="absolute inset-2.5 rounded-sm border"
        style={{ borderColor: `color-mix(in oklab, ${foil} 55%, transparent)` }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-3.5 pl-[14%]">
        <p
          className="font-serif text-[0.95rem] font-semibold leading-tight line-clamp-4"
          style={{ color: foil }}
        >
          {title}
        </p>
        <p
          className="text-[0.6rem] uppercase tracking-[0.14em] opacity-85 line-clamp-2"
          style={{ color: foil }}
        >
          {author}
        </p>
      </div>
    </div>
  );
}
