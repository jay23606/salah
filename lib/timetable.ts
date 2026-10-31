import {
  type Minutes,
  type PrayerName,
  type PrayerTimes,
  formatMinutes12Hour,
} from "./prayer-times";

/**
 * The part of this app that nothing else does.
 *
 * A student does not need to be told when Asr is. They need to be told that
 * their 3pm--6pm lab swallows the entire Asr window on Tuesdays, so they can
 * do something about it in week one rather than discovering it in week seven.
 * Everything here is about turning a timetable plus a set of prayer times
 * into that one sentence.
 */

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface Lecture {
  readonly id: string;
  readonly title: string;
  readonly day: Weekday;
  readonly start: Minutes;
  readonly end: Minutes;
  readonly venue?: string;
}

/**
 * The prayers that have a window a lecture can collide with. Sunrise is in
 * `PrayerTimes` because the Fajr window ends there, but it is not itself a
 * prayer, so it never appears as a conflict.
 */
export const PRAYERS_WITH_WINDOWS = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const satisfies readonly PrayerName[];

export type WindowedPrayer = (typeof PRAYERS_WITH_WINDOWS)[number];

export interface PrayerWindow {
  readonly prayer: WindowedPrayer;
  readonly start: Minutes;
  /** Exclusive. May exceed 24h worth of minutes for Isha, whose window runs
   *  past midnight into the next day's Fajr. */
  readonly end: Minutes;
}

const MINUTES_IN_DAY = 24 * 60;

/**
 * Each prayer's window runs from its own time to the start of the next one.
 *
 * Isha is the awkward case: its window ends at the *following* day's Fajr,
 * so its end exceeds 1440. We deliberately do not wrap it, because a wrapped
 * interval breaks every overlap test downstream — callers compare against
 * lecture times that are also allowed to exceed 1440 for the same reason.
 * Fajr ends at sunrise, which is the one window that does not end at the
 * next prayer.
 */
export function prayerWindows(times: PrayerTimes): readonly PrayerWindow[] {
  return [
    { prayer: "fajr", start: times.fajr, end: times.sunrise },
    { prayer: "dhuhr", start: times.dhuhr, end: times.asr },
    { prayer: "asr", start: times.asr, end: times.maghrib },
    { prayer: "maghrib", start: times.maghrib, end: times.isha },
    { prayer: "isha", start: times.isha, end: times.fajr + MINUTES_IN_DAY },
  ];
}

export interface Interval {
  readonly start: Minutes;
  readonly end: Minutes;
}

/** Merge overlapping or touching intervals into the fewest that cover the
 *  same ground. Back-to-back lectures must merge, or the gap-finder reports
 *  a zero-length "free" slot between them. */
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  const sorted = [...intervals]
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) {
      if (interval.end > last.end) {
        merged[merged.length - 1] = { start: last.start, end: interval.end };
      }
    } else {
      merged.push(interval);
    }
  }
  return merged;
}

/** The parts of `window` not covered by any of `busy`. */
export function freeGaps(
  window: Interval,
  busy: readonly Interval[]
): Interval[] {
  const blocks = mergeIntervals(busy);
  const gaps: Interval[] = [];
  let cursor = window.start;

  for (const block of blocks) {
    if (block.end <= window.start) continue;
    if (block.start >= window.end) break;
    if (block.start > cursor) {
      gaps.push({ start: cursor, end: Math.min(block.start, window.end) });
    }
    cursor = Math.max(cursor, block.end);
    if (cursor >= window.end) break;
  }

  if (cursor < window.end) gaps.push({ start: cursor, end: window.end });
  return gaps.filter((gap) => gap.end > gap.start);
}

export type ConflictSeverity = "clear" | "tight" | "blocked";

export interface PrayerConflict {
  readonly prayer: WindowedPrayer;
  readonly window: PrayerWindow;
  readonly severity: ConflictSeverity;
  /** Lectures that overlap the window at all, in start order. */
  readonly overlapping: readonly Lecture[];
  /** Free stretches inside the window, longest first. */
  readonly gaps: readonly Interval[];
  readonly longestGap: Minutes;
}

/**
 * How much free time counts as enough. Ten minutes is a judgement call, not
 * a ruling: it is roughly wudu plus two rak'ah without running, assuming you
 * are already near somewhere you can pray. It is exported so the UI can say
 * what the threshold is rather than leaving the student to guess why their
 * twelve-minute gap came back green.
 */
export const COMFORTABLE_GAP_MINUTES = 10;

/**
 * Classify one prayer window against one day's lectures.
 *
 * "blocked" means there is no free moment in the window at all. "tight"
 * means the longest free stretch is under COMFORTABLE_GAP_MINUTES — you can
 * technically make it, but not calmly. Both are worth showing; only
 * "blocked" is worth alarming about.
 */
export function classifyWindow(
  window: PrayerWindow,
  lectures: readonly Lecture[]
): PrayerConflict {
  const overlapping = [...lectures]
    .filter((lecture) => lecture.start < window.end && lecture.end > window.start)
    .sort((a, b) => a.start - b.start);

  const gaps = freeGaps(window, overlapping).sort(
    (a, b) => b.end - b.start - (a.end - a.start)
  );
  const longestGap = gaps.length > 0 ? gaps[0].end - gaps[0].start : 0;

  const severity: ConflictSeverity =
    longestGap <= 0 ? "blocked" : longestGap < COMFORTABLE_GAP_MINUTES ? "tight" : "clear";

  return { prayer: window.prayer, window, severity, overlapping, gaps, longestGap };
}

/** Every window for one weekday, given that day's lectures. */
export function analyseDay(
  times: PrayerTimes,
  lectures: readonly Lecture[],
  day: Weekday
): readonly PrayerConflict[] {
  const forDay = lectures.filter((lecture) => lecture.day === day);
  return prayerWindows(times).map((window) => classifyWindow(window, forDay));
}

/**
 * The sentence a student actually reads. Written as full prose rather than
 * a status chip because the point of the app is the explanation, not the
 * colour: "your 2pm Chemistry lab covers all of Asr" is actionable in a way
 * that a red dot is not.
 */
export function describeConflict(conflict: PrayerConflict): string {
  const prayer = conflict.prayer[0].toUpperCase() + conflict.prayer.slice(1);

  if (conflict.overlapping.length === 0) {
    return `${prayer} is clear — nothing timetabled in its window.`;
  }

  const names = conflict.overlapping.map((lecture) => lecture.title).join(" and ");

  if (conflict.severity === "blocked") {
    return `${prayer} is fully covered by ${names}. There is no free moment between ${formatMinutes12Hour(
      conflict.window.start
    )} and ${formatMinutes12Hour(conflict.window.end)} — you will need to pray before it starts, or arrange to step out.`;
  }

  const gap = conflict.gaps[0];
  const when = `${formatMinutes12Hour(gap.start)}–${formatMinutes12Hour(gap.end)}`;

  if (conflict.severity === "tight") {
    return `${prayer} overlaps ${names}, leaving only ${conflict.longestGap} minutes (${when}). Tight — plan where you will pray in advance.`;
  }

  return `${prayer} overlaps ${names}, but you have ${conflict.longestGap} free minutes (${when}).`;
}
