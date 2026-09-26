import { PrintFrame } from "./print-frame";

export interface WorkItem {
  name: string;
  status: string;
  note: string;
  href: string;
  image: string;
  /** Optional picture to dither instead of the screenshot; the screenshot then shows on hover. */
  print?: string;
  /** Colour plate behind the item, also the print's ink. */
  plate: string;
  /** Lift applied before dithering, for dark screenshots. */
  brightness?: number;
  /** contain floats a subject on a flat background; cover fills the frame. */
  fit?: "contain" | "cover";
  /** Tailwind aspect class for the frame. Defaults to a 16:10 landscape. */
  aspect?: string;
  /** Grid placement on md and up. Everything stacks on phones. */
  place: string;
}

/** Loose, asymmetric gallery. Titles above, dithered prints below, lots of air. */
export function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-32 lg:gap-y-56">
      {items.map((it, i) => {
        const inner = (
          <>
            <h3 className="mb-3 font-mono text-sm font-bold leading-tight">
              {it.name} <span className="font-medium text-muted-foreground">({it.status})</span>
            </h3>
            <figure className={`relative overflow-hidden ${it.aspect ?? "aspect-[16/10]"}`} style={{ backgroundColor: it.plate }}>
              <PrintFrame src={it.image} print={it.print} alt={`${it.name} screenshot`} sizes="(min-width: 768px) 60vw, 100vw" ink={it.plate} brightness={it.brightness} fit={it.fit} />
            </figure>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{it.note}</p>
          </>
        );
        return (
          <div key={it.name} data-wash-index={i} className={`px-4 ${it.place}`}>
            {it.href ? (
              <a href={it.href} target="_blank" rel="noopener noreferrer" className="group block">
                {inner}
              </a>
            ) : (
              <div className="group block">{inner}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
