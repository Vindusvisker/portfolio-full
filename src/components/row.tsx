/** Two-column section: a small mono label on the left, content on the right. */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
      <h2 className="font-mono text-sm text-muted-foreground">{label}</h2>
      <div>{children}</div>
    </div>
  );
}
