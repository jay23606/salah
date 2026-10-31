import type { Lecture } from "./timetable";

/**
 * The timetable lives in the browser and nowhere else.
 *
 * There is no account, no server and no database in this project, which is
 * not a shortcut — it is the feature. A student's class schedule says where
 * they are at every hour of the week, and there is no version of collecting
 * that on a server that is worth the risk for an app whose entire job is
 * arithmetic the phone can do itself. It also means a contributor can run
 * the whole thing with `pnpm dev` and no credentials.
 */

const STORAGE_KEY = "salat-campus:timetable:v1";

/** Reading can throw in private mode and in some embedded webviews, where
 *  localStorage exists but every access raises. An empty timetable is a far
 *  better outcome there than a blank screen. */
export function loadLectures(): Lecture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLecture);
  } catch {
    return [];
  }
}

export function saveLectures(lectures: readonly Lecture[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
  } catch {
    // Quota or a disabled store. Losing the save is survivable; crashing the
    // page while the student is mid-entry is not.
  }
}

/** Guards against a stored shape from an older version of the app, which is
 *  likelier than malicious input given nothing else writes this key. */
function isLecture(value: unknown): value is Lecture {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.day === "string" &&
    typeof candidate.start === "number" &&
    typeof candidate.end === "number"
  );
}
