# Good first issues

Drafted starter tasks. Each says what to do, how hard it is, and where to look.
Comment on the matching GitHub issue to claim one.

Difficulty: 🟢 no JavaScript needed · 🟡 straightforward code · 🔴 needs some thought

---

### 1. 🟢 Verify a campus prayer space

**Problem.** Every entry in [`data/campus-spaces.json`](./data/campus-spaces.json) is
marked `"verified": false`, which is an honest way of saying we guessed. A student
could walk to one of these and find nothing there.

**Task.** Pick one space. Go and look at it. Correct the name, area, landmark,
whether there is wudu on site, whether there is a sisters' section, and whether
Jumu'ah is held there. Set `"verified": true` and add your check to `lastReviewed`.

**Files.** `data/campus-spaces.json` only.

---

### 2. 🟢 Add a prayer space we have missed

**Problem.** The seed list covers six places. UNILAG has more — departmental
musallahs, hostel prayer rooms, spaces that are really just a quiet corridor everyone
uses.

**Task.** Add an entry in the same shape as the others, with `"verified": true` if
you have seen it yourself and `false` if you are going on someone's word.

**Files.** `data/campus-spaces.json`.

---

### 3. 🟡 Add the Umm al-Qura calculation method

**Problem.** `CALCULATION_METHODS` covers four authorities, all of which define Isha
by a twilight angle. Umm al-Qura does not — it puts Isha at a fixed 90 minutes after
Maghrib (120 in Ramadan). Our type cannot express that.

**Task.** Widen the method type so a method can define Isha either by an angle or by
an interval after Maghrib, then add Umm al-Qura. Add tests covering both.

**Files.** `lib/prayer-times.ts`, `lib/prayer-times.test.ts`.

**Watch out for.** Keep the existing four methods working unchanged — the tests
should tell you if you have broken them.

---

### 4. 🟡 Let a student set their own coordinates

**Problem.** The app hardcodes UNILAG Akoka. A student on the College of Medicine
campus at Idi-Araba, or home in Ibadan for the break, gets times that are a little
wrong and no way to fix it.

**Task.** Add a settings control for latitude, longitude and timezone offset, stored
in `localStorage` alongside the timetable, defaulting to UNILAG. A "back to UNILAG"
button matters — it is easy to get lost in this form.

**Files.** `lib/storage.ts`, `app/page.tsx`, a new component.

---

### 5. 🟡 Show the next prayer and a countdown

**Problem.** The table shows all six times, which is the right answer to "when is
Maghrib" and the wrong answer to "how long have I got", which is what someone
actually opens the app for.

**Task.** Above the table, show the next prayer and the time remaining, updating each
minute. Handle the awkward case: after Isha, the next prayer is tomorrow's Fajr.

**Files.** `app/page.tsx`, a new component, probably a helper in `lib/prayer-times.ts`
with tests.

---

### 6. 🟡 Import a timetable by pasting it

**Problem.** Adding eight courses one at a time through the form is tedious enough
that people will not do it, and an app nobody fills in tells nobody anything.

**Task.** A paste box that accepts a few plain-text lines
(`MTH 202, Monday, 12:00-14:00`) and turns them into lectures, showing which lines it
could not parse rather than silently dropping them.

**Files.** New parser in `lib/` **with tests**, plus UI in `app/page.tsx`.

**Watch out for.** Students will paste messy text. Be forgiving on whitespace, dashes
and day abbreviations, and never discard a line without saying so.

---

### 7. 🔴 Flag the Jumu'ah clash separately

**Problem.** Friday is not like other days. Jumu'ah is congregational, it is longer
than a regular Dhuhr, and it is in a fixed place — so a Friday 12–2pm lecture is a
much bigger problem than the current "Dhuhr is tight" suggests.

**Task.** Treat Friday's Dhuhr window as Jumu'ah: a longer block (make the duration
configurable), with its own wording in `describeConflict`, and travel time to the
central mosque taken into account.

**Files.** `lib/timetable.ts`, `lib/timetable.test.ts`, `components/ConflictList.tsx`.

---

### 8. 🔴 Make it installable and work offline

**Problem.** The app is built to need no network, and then is delivered over one. If
you lose signal crossing campus you lose the app, which rather defeats the point.

**Task.** Add a web app manifest and a service worker so it installs to the home
screen and opens with no connection.

**Files.** `app/manifest.ts`, `public/`, `next.config.ts`.

---

### 9. 🟡 Make the conflict list readable by screen reader

**Problem.** Severity is currently carried by a coloured dot plus a text label. The
dot is decorative and correctly hidden, but the list as a whole has no live region,
so changing the day announces nothing.

**Task.** Audit the page with a screen reader. Add appropriate roles and a polite
live region for the conflict summary. Check colour contrast on all three severity
colours in both light and dark mode.

**Files.** `components/ConflictList.tsx`, `app/globals.css`.

---

### 10. 🟢 Translate the interface

**Problem.** The app is English-only. Plenty of students at UNILAG would rather read
this in Yoruba or Hausa, and the vocabulary here is not everyday English.

**Task.** Pull the user-facing strings into one module and add a second language. The
hard part is `describeConflict`, which builds sentences — it will need rethinking
rather than string substitution, so propose an approach in the issue first.

**Files.** New `lib/strings.ts`, then everywhere a string is written.
