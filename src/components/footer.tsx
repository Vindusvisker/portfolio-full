"use client";

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 font-mono text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Marcus Ruud</p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="cursor-pointer transition-colors hover:text-foreground"
      >
        Back to top ↑
      </button>
    </footer>
  );
}
