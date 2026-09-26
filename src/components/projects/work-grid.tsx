import Image from "next/image";
import { AutoVideo } from "./auto-video";

export interface WorkItem {
  name: string;
  status: string;
  note: string;
  href: string;
  image: string;
  /** Optional looping clip shown instead of the still. */
  video?: string;
  /** Tailwind aspect class for the frame. Defaults to a 16:10 landscape. */
  aspect?: string;
  /** Tailwind object-position class for the crop. Defaults to the top. */
  crop?: string;
  /** Grid placement on md and up. Everything stacks on phones. */
  place: string;
}

/** Loose, asymmetric gallery. Titles above, prints below, lots of air. */
export function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-32 lg:gap-y-56">
      {items.map((it, i) => {
        const inner = (
          <>
              <h3 className="mb-3 font-mono text-sm font-bold leading-tight">
                {it.name} <span className="font-medium text-muted-foreground">({it.status})</span>
              </h3>
              <figure className={`relative overflow-hidden bg-secondary ${it.aspect ?? "aspect-[16/10]"}`}>
                {it.video ? (
                  <AutoVideo
                    src={it.video}
                    poster={it.image}
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${it.crop ?? "object-top"}`}
                  />
                ) : (
                  <Image
                    src={it.image}
                    alt={`${it.name} screenshot`}
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${it.crop ?? "object-top"}`}
                  />
                )}
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
