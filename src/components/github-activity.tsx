"use client";

import { useEffect, useState } from "react";
import type { ContributionData, ContributionDay } from "@/lib/github";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Wed", "Fri"];

const LEVEL_COLORS = {
  light: [
    "var(--muted)",
    "oklch(0.75 0.1 145)",
    "oklch(0.6 0.14 145)",
    "oklch(0.5 0.16 145)",
    "oklch(0.4 0.16 145)",
  ],
  dark: [
    "var(--muted)",
    "oklch(0.35 0.1 145)",
    "oklch(0.45 0.14 145)",
    "oklch(0.55 0.16 145)",
    "oklch(0.65 0.16 145)",
  ],
};

function getWeeks(days: ContributionDay[]) {
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of days) {
    const date = new Date(day.date);
    const dow = date.getDay();

    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function getMonthLabels(weeks: ContributionDay[][]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, i) => {
    const date = new Date(week[0].date);
    const month = date.getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], col: i });
      lastMonth = month;
    }
  });

  return labels;
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

  const weeks = data ? getWeeks(data.days) : [];
  const monthLabels = getMonthLabels(weeks);

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
        className="mt-4 block w-full rounded-lg border border-border/50 bg-card p-4 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
      >
        {loading ? (
          <div className="flex h-[120px] items-center justify-center">
            <div className="skeleton h-full w-full rounded-md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="relative text-xs text-muted-foreground" style={{ paddingLeft: 31, height: 16 }}>
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    left: 31 + m.col * 16,
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-1 flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col justify-between py-[2px] text-xs text-muted-foreground" style={{ width: 28 }}>
                {DAYS.map((d) => (
                  <span key={d} className="h-[13px] leading-[13px]">{d}</span>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, di) => {
                      const day = week.find((d) => new Date(d.date).getDay() === di);
                      if (!day) return <div key={di} className="h-[13px] w-[13px]" />;
                      return (
                        <div
                          key={di}
                          className="h-[11px] w-[11px] rounded-[2px] transition-colors"
                          style={{
                            backgroundColor: `var(--contrib-${day.level}, ${LEVEL_COLORS.dark[day.level]})`,
                          }}
                          title={`${day.count} contributions on ${day.date}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </a>
    </div>
  );
}
