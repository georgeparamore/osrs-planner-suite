# OSRS Planner Suite — Shared Project Status

This is the first file both **Claude Code and Codex must read before making changes**. It is the living handoff for switching agents, including when George continues from mobile.

Last updated: 2026-08-05 by Codex
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Active branch: `main` (built on `claude/osrs-tool-suite-ap8t4k`, which tracks `main` and is pushed after every session)

## Agent handoff protocol

Before coding:

1. Read this file completely.
2. Read the newest task-specific dated handoff. The current assignment is `CLAUDE_SMITHING_HANDOFF_2026-08-05.md`.
3. Inspect `git status` and recent commits; never assume the working tree is clean.
4. Treat current code and the newest dated handoff as authoritative over older handoff files.

Before handing work to the other agent or ending a substantial coding session, update this file:

- `Last updated` and agent name.
- Current task and status.
- Last successful commit/deployment.
- Files changed but not committed.
- Tests completed.
- Known bugs, decisions, and exact next steps.

Do not delete previous dated handoffs. They provide history. Older `PROJECT_HANDOFF.md` and `CLAUDE_CODE_HANDOFF.md` contain useful implementation detail but are stale in product structure and route naming.

## Current task

**Owner:** Claude Code
**Status:** Crafting Training Planner is merged and live. Smithing research and implementation planning are complete; Smithing coding has not started.
**Assignment for whoever picks this up:** Read `CLAUDE_SMITHING_HANDOFF_2026-08-05.md`, build the Smithing planner on a feature branch, test it, and open a PR without merging it.

Full Smithing specification: `CLAUDE_SMITHING_HANDOFF_2026-08-05.md`.

Full original build specification: `CLAUDE_HANDOFF_2026-08-05.md`. Note that a few implementation choices below **intentionally deviate** from that spec's suggested routes, because the real Wiki-sourced XP/hr numbers didn't support the originally-assumed breakpoints. Treat this README as authoritative over the original spec for those points.

### What was built

- `osrs-crafting-planner.html` — new focused planner, same architecture/visual language as `osrs-herblore-planner.html` (`suite-nav.js` now generalizes the Herblore-only focused-layout transform to `current.name==='Herblore'||current.name==='Crafting'`, and `suite-nav.css`'s `body[data-suite-page="herblore"]` rules were changed to `:is(body[data-suite-page="herblore"],body[data-suite-page="crafting"])` throughout so both pages share the layout without duplicating ~126 CSS rules).
- Added to `suite-nav.js`'s tools list (previous/next cycling + dropdown) and to the `index.html` landing-page grid.
- Four routes — **Fastest**, **Simple**, **Cheapest**, **Low Attention** — built with the same live-value/pool pattern as Herblore's Cheapest route (`buildRoute()` in the file), reevaluated at every level unlock.
- Controls: Members/F2P segmented toggle (filters `membersOnly` methods from every route and shows a clear "no F2P methods" message rather than a silently wrong route), Costume needle toggle (dragonhide throughput only — 1,685 → 1,705 bodies/hr, does not touch XP or leather quantity), Output handling select (GE sell, or High Alchemy for dragonhide bodies/battlestaves only — those are the only families with a high alch value modeled), and a "skip methods slower than 15k xp/hr" floor toggle for Cheapest.
- Method data (leather, gem cutting, gold/silver jewellery, battlestaves, dragonhide bodies, molten glass, drift nets, amethyst tips) was pulled live from the OSRS Wiki during this session (Crafting, Pay-to-play/Free-to-play Crafting training, Leather, Dragonhide, Molten glass pages, plus individual item pages for High Alchemy values) rather than from memory — see inline code comments for the exact figures used.

### Deviations from the original spec worth knowing about

- **Fastest does not include battlestaves or blue/green dragonhide.** The real Wiki xp/hr numbers (Dragonstone cutting: 382,250 xp/hr from level 55) dominate every battlestaff and blue dragonhide body until Red dragonhide overtakes it at level 77. The route is Leather → Gems (through Dragonstone) → Red dragonhide (77) → Black dragonhide (84). This is mathematically correct given verified data, not a bug — the original spec's suggested "gems → battlestaves → d'hide" Fastest shape assumed battlestaves would be competitive, and the numbers don't support that once Dragonstone is in the pool. Fastest's candidate pool is intentionally narrower than Cheapest's (leather/gems/battlestaves/dragonhide only — no glass/jewellery/drift nets), matching the original spec's family list for that route specifically.
- **Simple was hand-curated** to be genuinely different from Fastest per the spec: it uses all four dragonhide tiers (skips Air battlestaff) instead of Fastest's XP-optimal crossover, and consolidates a couple of the shortest early leather tiers.
- **Self-tanned dragonhide alching was not implemented** (only plain GE-sell and plain High-Alch). Modeling it accurately needs tanning-fee data this session couldn't verify confidently; flagged rather than guessed.
- **Leather crafting's actions/hour (1,750/hr) is an estimate**, applied consistently with the same assumption used for glassblowing — the Wiki confirms leather's 3-tick (1.8s) crafting animation but not a banked items/hour rate. This matters because Fastest/Cheapest choose between families purely on the numbers; an unverified low estimate here previously caused Fastest to wrongly skip leather in favor of glass. Worth re-verifying against real play if precision matters.
- **Amethyst tip output quantities are flagged, not asserted** — the per-amethyst output multiplier wasn't independently verified.

### How this session verified it

This sandbox has no outbound internet access to `prices.runescape.wiki` or GitHub, so full end-to-end testing with live prices and a real push/deploy wasn't possible. What *was* verified locally with Playwright + Chromium:
- No console/page errors across all four routes, F2P/Members toggle, needle toggle, output-handling selector, and the shopping-list toggle.
- No horizontal overflow at a 390px mobile viewport.
- Cost-engine arithmetic hand-checked against mocked GE prices (input cost, GE tax, net cost, shopping-list aggregation, upfront vs net-profit totals) — all matched expected values exactly.
- F2P mode correctly excludes members-only methods and shows a clear message when a route has none available (Low Attention is all-glass, so F2P shows "no F2P methods" there).

**Next agent: push this branch, let GitHub Pages deploy, then hit the live page with real prices to confirm the Cheapest route's live-price selection behaves as expected — that path could only be code-reviewed here, not exercised against real data.**

## Current production state

Last deployed feature commit before this session: `4d64880` — shared agent handoff and Crafting plan docs (no code changes).

The public suite currently includes (once this session's branch is deployed):

- Landing page/player lookup
- GE Tracker
- Skill Profit Calculator
- Construction Planner
- Farming Planner
- Herblore Planner
- Prayer Planner
- Crafting Planner (new this session)

Important current behavior:

- Focused Herblore UI is the reference design for new planners.
- Centered planner width is about 940px; GE Tracker intentionally remains wide.
- Herblore routes are Fastest, Simple, Cheapest, and Mastering Mixology.
- Cheapest uses live net GP/XP rather than a permanently fixed guide route.
- Route steps display exact actions and individual net costs.
- Mixology supports level goals and multiple reward goals with images.
- Starting point uses a Level / Exact XP switch.
- Exact XP derives the visible level and preserves partial-level progress.
- One `osrs-suite-theme` preference persists across all pages.
- The landing page also has a light/dark toggle.

## Architecture rules

- Static HTML/CSS/JavaScript; no framework and no build step.
- GitHub Pages deploys from `main`.
- Use the OSRS Wiki Prices API for live Grand Exchange prices.
- Mapping IDs must be stored as strings: `String(item.id)`.
- Input cost uses instant-buy/high price.
- Output revenue uses instant-sell/low price minus GE tax.
- Missing prices must never be treated as zero-cost supplies.
- Use exact recipe quantities and exact action counts.
- Show gross/upfront capital and net cost after outputs separately.
- Use Wise Old Man for account level/XP lookup.
- Preserve unrelated user changes and never use destructive git cleanup.

## Current working tree

At the time this README was created:

- New documentation: `README.md`
- New detailed handoff: `CLAUDE_HANDOFF_2026-08-05.md`
- No Crafting implementation has started.

The documentation should be committed and pushed so Claude can read it from the repository.

## Verification expectations

For every material UI/calculation change:

1. Run syntax and `git diff --check` checks.
2. Exercise the relevant flow in a browser locally.
3. Test exact calculations with at least one known example.
4. Check desktop/mobile overflow when layout changes.
5. Commit and push.
6. Wait for GitHub Pages deployment success.
7. Verify the public page with a cache-busting query parameter.

## Communication style for George

- Lead with what changed and whether it is live.
- Give a direct public link after deployment.
- Keep explanations straightforward and avoid unnecessary framework jargon.
- George may switch between Claude and Codex depending on whether he is at desktop or mobile; leave enough written context that either can resume without asking him to repeat decisions.
