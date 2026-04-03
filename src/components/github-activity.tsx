"use client";

import { useEffect, useState } from "react";
import type { ContributionData, ContributionDay } from "@/lib/github";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const LEVEL_COLORS = [
  "transparent",
  "oklch(0.35 0.1 145)",
  "oklch(0.45 0.14 145)",
  "oklch(0.55 0.16 145)",
  "oklch(0.65 0.16 145)",
];

function groupByMonth(days: ContributionDay[]) {
  const months: Map<string, ContributionDay[]> = new Map();

  for (const day of days) {
    const date = new Date(day.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(day);
  }

  return Array.from(months.entries()).map(([key, monthDays]) => {
    const [year, month] = key.split("-").map(Number);
    return { year, month, days: monthDays };
  });
}

function MonthGrid({ month, days }: { month: number; days: ContributionDay[] }) {
  const dayMap = new Map(days.map((d) => [d.date, d]));

  // Find first day of month and total days
  const year = days[0] ? new Date(days[0].date).getFullYear() : new Date().getFullYear();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Monday = 0, Sunday = 6
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const cells: (ContributionDay | null)[] = [];

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) cells.push(null);

  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dayMap.get(dateStr) || { date: dateStr, count: 0, level: 0 });
  }

  // Pad to complete grid
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {MONTHS[month]}
      </p>
      <div className="grid grid-cols-7 gap-[3px]">
        {DAYS.map((d) => (
          <span key={d} className="text-center text-[9px] text-muted-foreground/60 mb-0.5">
            {d.charAt(0)}
          </span>
        ))}
        {weeks.flat().map((cell, i) =>
          cell ? (
            <div
              key={i}
              className="aspect-square rounded-[3px] border border-border/60 transition-colors"
              style={{ backgroundColor: LEVEL_COLORS[cell.level] }}
              title={`${cell.count} contributions on ${cell.date}`}
            />
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}

export function GitHubActivity() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/github/contributions?year=${selectedYear}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedYear]);

  const months = data ? groupByMonth(data.days) : [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          GitHub Contributions
          {data && !loading && (
            <span className="ml-2 text-xs text-muted-foreground">
              {data.total.toLocaleString()} in {selectedYear}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                selectedYear === year
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <a
        href="https://github.com/vindusvisker"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View vindusvisker's GitHub profile and contribution history"
        className="mt-4 block w-full overflow-hidden rounded-xl border border-border/50 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
      >
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 divide-x divide-y divide-border/40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="skeleton h-3 w-10 rounded" />
                <div className="skeleton h-20 w-full rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 divide-x divide-y divide-border/40">
            {months.map((m) => (
              <div key={`${m.year}-${m.month}`} className="p-4">
                <MonthGrid month={m.month} days={m.days} />
              </div>
            ))}
          </div>
        )}
      </a>
    </div>
  );
}
