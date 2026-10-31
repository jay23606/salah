# Salat Campus

**Prayer times for UNILAG, computed on your device, and a check of which lectures
collide with which prayer window.**

---

## The problem

Every Muslim student at UNILAG has had the same term. You register for courses in
week one, and somewhere around week six you notice that your Tuesday afternoon lab
runs from 3pm to 6pm — which is, from 'Asr to a few minutes before Maghrib, the
entire 'Asr window. Nobody told you, because nothing you used put a timetable and a
prayer schedule on the same screen.

Prayer-time apps will tell you when 'Asr is. Your portal will tell you when your lab
is. Neither will tell you the one thing you needed to know in week one: **that lab
covers all of 'Asr, every Tuesday, for the whole semester.**

That sentence is the entire product.

The second problem is smaller and just as annoying: you are in the Faculty of
Science with eleven minutes between classes and no idea whether there is somewhere
to pray in the building. So the app ships a directory of campus prayer spaces too.

## What it does

- Computes the five daily prayers plus sunrise for University of Lagos, Akoka —
  **from astronomy, offline, with no API key and no network call.**
- Supports four calculation methods (MWL, Egyptian, Karachi, ISNA) and both the
  standard and Hanafi positions on 'Asr.
- Takes your weekly lecture timetable and reports, per day, whether each prayer
  window is **clear**, **tight** (under 10 free minutes), or **blocked** (no free
  moment at all) — naming the lecture responsible.
- Lists prayer spaces on campus, with wudu, sisters' section and Jumu'ah noted.

Your timetable is stored in your own browser and is never sent anywhere. There is no
account, no server and no database — see [Design decisions](#design-decisions).

## Setup

Requires **Node 20+** and **pnpm**.

```bash
git clone https://github.com/mssnunilag/salah.git
```

```bash
cd salah
```

```bash
pnpm install
```

```bash
pnpm dev
```

Open <http://localhost:3000>. That is the whole setup. There is no `.env` file, no
API key, no database and nothing to request access to — if a step ever appears here
that needs a credential, we have made a mistake and you should open an issue.

### Other commands

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

## Design decisions

These are the choices a contributor is most likely to want to change, and why they
are the way they are.

**The prayer times are computed, not fetched.** The obvious implementation calls one
of the public prayer-time APIs. We do not, because a student on campus data is
frequently offline, and the moment they need these numbers is the moment they cannot
wait for a round trip. It also means you can clone this repo and run it without
asking anyone for an API key. The astronomy is the standard low-precision solar model
from the Astronomical Almanac, in [`lib/prayer-times.ts`](./lib/prayer-times.ts).

**There is no backend.** A class timetable says where a person is at every hour of
the week. There is no version of collecting that on a server that is worth the risk
for an app whose entire job is arithmetic a phone can do itself. Everything lives in
`localStorage`.

**Times are minutes since local midnight, not `Date` objects.** A `Date` carries a
timezone the browser picks and the student cannot see. An early draft showed Maghrib
an hour early on a phone set to UTC. Minutes-since-midnight is unambiguous.

**The campus prayer-space data is unverified seed data.** Every entry in
[`data/campus-spaces.json`](./data/campus-spaces.json) is marked `"verified": false`
and should be treated as a guess until somebody checks it in person. Correcting one
is the single most useful first contribution to this project.

## Contributing

This is one of four projects indexed at **[https://github.com/mssnunilag/oss](https://github.com/mssnunilag/oss)** — the others cover prayer times, Qur'an memorisation, halal food and zakat, and share this one's conventions.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md). Drafted starter tasks are in
[ISSUES.md](./ISSUES.md) — several need no JavaScript at all.

This project is built for Hacktoberfest by [MSSN UNILAG](https://github.com/mssnunilag), but
it is not an official MSSN product and uses none of the society's data or branding.

## Licence

[MIT](./LICENSE).
