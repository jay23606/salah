import { type PrayerTimes, formatMinutes12Hour } from "@/lib/prayer-times";

const ROWS = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
] as const;

export function PrayerTable({ times }: { times: PrayerTimes }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
      {ROWS.map((row) => (
        <div
          key={row.key}
          className="flex items-baseline justify-between border-b border-[var(--color-rule)] py-2"
        >
          <dt
            className={
              row.key === "sunrise"
                ? "text-sm text-[var(--color-ink-soft)]"
                : "text-sm font-medium"
            }
          >
            {row.label}
          </dt>
          <dd className="font-mono text-sm tabular-nums">
            {formatMinutes12Hour(times[row.key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}
