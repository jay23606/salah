import {
  type PrayerConflict,
  COMFORTABLE_GAP_MINUTES,
  describeConflict,
} from "@/lib/timetable";
import { formatMinutes12Hour } from "@/lib/prayer-times";

const TONE: Record<PrayerConflict["severity"], { dot: string; label: string }> = {
  clear: { dot: "bg-[var(--color-clear)]", label: "Clear" },
  tight: { dot: "bg-[var(--color-tight)]", label: "Tight" },
  blocked: { dot: "bg-[var(--color-blocked)]", label: "Blocked" },
};

export function ConflictList({ conflicts }: { conflicts: readonly PrayerConflict[] }) {
  const blocked = conflicts.filter((c) => c.severity === "blocked");

  return (
    <div>
      {blocked.length > 0 && (
        <p className="mb-4 rounded-md border border-[var(--color-blocked)]/30 bg-[var(--color-blocked)]/5 px-3 py-2 text-sm">
          <strong>
            {blocked.length} prayer{blocked.length === 1 ? "" : "s"} fully covered
          </strong>{" "}
          by lectures on this day.
        </p>
      )}

      <ul className="space-y-3">
        {conflicts.map((conflict) => {
          const tone = TONE[conflict.severity];
          return (
            <li
              key={conflict.prayer}
              className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-card)] p-3 dark:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
                <span className="text-sm font-semibold capitalize">{conflict.prayer}</span>
                <span className="text-xs text-[var(--color-ink-soft)]">
                  {formatMinutes12Hour(conflict.window.start)} –{" "}
                  {formatMinutes12Hour(conflict.window.end)}
                </span>
                <span className="ml-auto text-xs font-medium">{tone.label}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)] dark:text-white/70">
                {describeConflict(conflict)}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-[var(--color-ink-soft)]">
        &ldquo;Tight&rdquo; means the longest free stretch is under{" "}
        {COMFORTABLE_GAP_MINUTES} minutes — roughly wudu plus two rak&rsquo;ah without
        rushing, assuming somewhere to pray is close by.
      </p>
    </div>
  );
}
