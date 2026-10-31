import { describe, expect, it } from "vitest";
import type { PrayerTimes } from "./prayer-times";
import {
  type Lecture,
  analyseDay,
  classifyWindow,
  describeConflict,
  freeGaps,
  mergeIntervals,
  prayerWindows,
} from "./timetable";

/** Round numbers so a failure reads as a clock, not as arithmetic. */
const TIMES: PrayerTimes = {
  fajr: 5 * 60 + 20,
  sunrise: 6 * 60 + 30,
  dhuhr: 12 * 60 + 30,
  asr: 15 * 60 + 50,
  maghrib: 18 * 60 + 30,
  isha: 19 * 60 + 40,
};

const lecture = (
  title: string,
  start: number,
  end: number,
  day: Lecture["day"] = "Monday"
): Lecture => ({ id: title, title, day, start, end });

describe("mergeIntervals", () => {
  it("merges back-to-back blocks so no zero-length gap appears between them", () => {
    const merged = mergeIntervals([
      { start: 600, end: 660 },
      { start: 660, end: 720 },
    ]);
    expect(merged).toEqual([{ start: 600, end: 720 }]);
  });

  it("keeps genuinely separate blocks separate", () => {
    const merged = mergeIntervals([
      { start: 600, end: 660 },
      { start: 700, end: 720 },
    ]);
    expect(merged).toHaveLength(2);
  });

  it("drops empty intervals", () => {
    expect(mergeIntervals([{ start: 600, end: 600 }])).toEqual([]);
  });
});

describe("freeGaps", () => {
  it("returns the whole window when nothing is busy", () => {
    expect(freeGaps({ start: 100, end: 200 }, [])).toEqual([
      { start: 100, end: 200 },
    ]);
  });

  it("returns nothing when the window is entirely covered", () => {
    expect(freeGaps({ start: 100, end: 200 }, [{ start: 50, end: 250 }])).toEqual([]);
  });

  it("finds the gap between two lectures", () => {
    expect(
      freeGaps({ start: 100, end: 300 }, [
        { start: 100, end: 150 },
        { start: 200, end: 300 },
      ])
    ).toEqual([{ start: 150, end: 200 }]);
  });

  it("ignores busy blocks outside the window", () => {
    expect(freeGaps({ start: 100, end: 200 }, [{ start: 300, end: 400 }])).toEqual([
      { start: 100, end: 200 },
    ]);
  });
});

describe("prayerWindows", () => {
  it("ends Fajr at sunrise, not at Dhuhr", () => {
    const fajr = prayerWindows(TIMES).find((w) => w.prayer === "fajr")!;
    expect(fajr.end).toBe(TIMES.sunrise);
  });

  it("runs Isha past midnight into the next Fajr", () => {
    const isha = prayerWindows(TIMES).find((w) => w.prayer === "isha")!;
    expect(isha.end).toBeGreaterThan(24 * 60);
  });

  it("gives every window a positive length", () => {
    for (const window of prayerWindows(TIMES)) {
      expect(window.end).toBeGreaterThan(window.start);
    }
  });
});

describe("classifyWindow", () => {
  const asr = prayerWindows(TIMES).find((w) => w.prayer === "asr")!;

  it("is clear when nothing overlaps", () => {
    expect(classifyWindow(asr, []).severity).toBe("clear");
  });

  it("is blocked when one long lab swallows the whole window", () => {
    const result = classifyWindow(asr, [lecture("Chemistry lab", 15 * 60, 19 * 60)]);
    expect(result.severity).toBe("blocked");
    expect(result.longestGap).toBe(0);
  });

  it("is tight when the only gap is under ten minutes", () => {
    const result = classifyWindow(asr, [
      lecture("Morning half", 15 * 60, 16 * 60 + 55),
      lecture("Afternoon half", 17 * 60, 19 * 60),
    ]);
    expect(result.longestGap).toBe(5);
    expect(result.severity).toBe("tight");
  });

  it("is clear when a lecture overlaps but leaves real room", () => {
    const result = classifyWindow(asr, [lecture("Short seminar", 15 * 60, 16 * 60)]);
    expect(result.severity).toBe("clear");
    expect(result.longestGap).toBeGreaterThan(10);
  });

  it("lists overlapping lectures in start order", () => {
    const result = classifyWindow(asr, [
      lecture("Second", 17 * 60, 18 * 60),
      lecture("First", 16 * 60, 17 * 60),
    ]);
    expect(result.overlapping.map((l) => l.title)).toEqual(["First", "Second"]);
  });
});

describe("analyseDay", () => {
  it("only counts lectures on the day asked for", () => {
    const lectures = [lecture("Tuesday lab", 15 * 60, 19 * 60, "Tuesday")];
    const monday = analyseDay(TIMES, lectures, "Monday");
    expect(monday.every((c) => c.overlapping.length === 0)).toBe(true);
  });

  it("flags the blocked prayer on the day it actually falls", () => {
    const lectures = [lecture("Tuesday lab", 15 * 60, 19 * 60, "Tuesday")];
    const tuesday = analyseDay(TIMES, lectures, "Tuesday");
    const asr = tuesday.find((c) => c.prayer === "asr")!;
    expect(asr.severity).toBe("blocked");
  });
});

describe("describeConflict", () => {
  const asr = prayerWindows(TIMES).find((w) => w.prayer === "asr")!;

  it("names the lecture that is in the way", () => {
    const text = describeConflict(
      classifyWindow(asr, [lecture("Chemistry lab", 15 * 60, 19 * 60)])
    );
    expect(text).toContain("Chemistry lab");
    expect(text).toContain("no free moment");
  });

  it("says plainly when nothing is in the way", () => {
    expect(describeConflict(classifyWindow(asr, []))).toContain("clear");
  });
});
