"use client";

import { FoldText } from "./board/fold-text";
import { ICON_MAP } from "./stack/icons";

interface StackItem {
  name: string;
  note: string;
}

export function StackSection({
  category,
  description,
  items,
}: {
  category: string;
  description: string;
  items: StackItem[];
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold uppercase leading-none tracking-wide md:text-3xl">
        {category}
      </h2>
      <div className="mt-4">
        <FoldText inView className="font-sans text-lg leading-snug text-foreground/90 md:text-2xl">
          {description}
        </FoldText>
      </div>
      <div className="mt-6 space-y-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.name];
          return (
            <div
              key={item.name}
              className="flex items-center gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
            >
              {Icon ? (
                <Icon className="shrink-0 w-4 h-4 text-muted-foreground" />
              ) : (
                <span className="shrink-0 w-4 h-4" />
              )}
              <span className="shrink-0 font-mono text-sm font-bold">{item.name}</span>
              <span className="hidden h-px flex-1 bg-border/50 sm:block" />
              <span className="font-sans text-xs text-muted-foreground sm:text-right">{item.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
