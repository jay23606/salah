# Contributing to Salat Campus

Thanks for being here. This project exists to be contributed to, and quite a few of
the open tasks need no JavaScript at all.

## Before anything else

```bash
pnpm install
pnpm test
```

If those two commands do not both succeed on a fresh clone, that is a bug in this
project and worth an issue on its own. You should never need an API key, a `.env`
file, a database, or access to anything belonging to MSSN UNILAG.

## Picking something to work on

Start with [ISSUES.md](./ISSUES.md). Each entry says what the task is, roughly how
hard it is, and which files to look at. Comment on the matching GitHub issue to claim
it so two people do not do the same work.

If you want to do something that is not listed, open an issue describing it first.
We would rather talk about an idea for ten minutes than have you spend a weekend on
something we then have to decline.

## House style

**Comments explain why, not what.** This is the one convention we care about most.
`// increment the counter` is noise; the comment above `hourAngle` in
[`lib/prayer-times.ts`](./lib/prayer-times.ts) explains that the sign convention is
the easiest thing in the file to get backwards and how that failure shows up. Write
the second kind. If a line needs no explanation, it needs no comment.

**TypeScript, strict.** No `any`. If the types are fighting you, that is usually the
design telling you something — ask in the issue.

**Pure functions where the logic lives.** Everything in `lib/` is a pure function
over plain numbers, which is why it can be tested without a browser. Keep it that
way: React state belongs in `app/` and `components/`.

**Minutes since midnight.** Inside the app, a time of day is a number of minutes
after local midnight. Do not introduce `Date` objects into `lib/` — see the README
for the bug that convention exists to prevent.

## Tests

Anything in `lib/` needs a test. The suites in `lib/*.test.ts` are the model: each
test name is a sentence about behaviour (`"is blocked when one long lab swallows the
whole window"`), not a restatement of the function name.

```bash
pnpm test
pnpm test:watch
```

## A note on religious content

This app makes a calculation, and reasonable authorities differ on the inputs. Where
they differ — twilight angles, the 'Asr shadow ratio — we add an option rather than
pick a winner, and we label each option with the body it comes from. Please keep to
that. A pull request that hardcodes one school's position as "correct" will be asked
to make it configurable instead.

The 10-minute "comfortable gap" threshold is a usability judgement, not a ruling, and
it is named and exported (`COMFORTABLE_GAP_MINUTES`) so it reads as one.

## Pull requests

- One topic per pull request.
- Say what problem it solves, not just what it changes.
- Run `pnpm test` and `pnpm typecheck` before pushing.
- Screenshots for anything visual.

Small and finished beats large and nearly-there. A PR that fixes one unverified
prayer-space entry is a real contribution and will be treated as one.
