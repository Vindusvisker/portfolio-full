function esc(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] ?? c);
}

/** The repo inventory as an SVG data URL, printed onto the crumplable sheet. */
export function graveyardPrint(repos: { name: string; language: string | null; commits?: number }[], contributions: number) {
  const W = 680;
  const H = 920;
  const shown = repos.slice(0, 22);
  const lines = shown
    .map((r, i) => {
      const y = 214 + i * 28;
      const meta = `${r.language ?? "misc"}${r.commits ? ` · ${r.commits}` : ""}`;
      return `<text x="56" y="${y}" font-size="19">${esc(r.name)}</text><text x="624" y="${y}" font-size="14" text-anchor="end" fill="#6b6459">${esc(meta)}</text>`;
    })
    .join("");
  const rest = repos.length > shown.length
    ? `<text x="56" y="${214 + shown.length * 28}" font-size="15" fill="#6b6459">+ ${repos.length - shown.length} more</text>`
    : "";
  const empty = repos.length === 0 ? `<text x="56" y="214" font-size="17" fill="#6b6459">GitHub is not answering right now.</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fbf9f4"/><g font-family="ui-monospace, Menlo, Consolas, monospace" fill="#1a1713"><text x="56" y="86" font-size="14" letter-spacing="3" fill="#6b6459">OPEN SOURCE · THE GRAVEYARD</text><text x="56" y="138" font-size="34" font-weight="700">${repos.length} repos, resting.</text><text x="56" y="168" font-size="15" fill="#6b6459">${contributions.toLocaleString("en-US")} contributions and counting.</text><line x1="56" y1="186" x2="624" y2="186" stroke="#1a1713" stroke-width="2"/>${lines}${rest}${empty}<text x="56" y="${H - 56}" font-size="14" fill="#6b6459">github.com/vindusvisker</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
