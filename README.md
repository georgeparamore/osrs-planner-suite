# OSRS Planner Suite — Shared Project Status

This is the first file both **Claude Code and Codex must read before making changes**. It is the living handoff for switching agents, including when George continues from mobile.

Last updated: 2026-08-05 by Claude Code
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Active branch: `main` (this session's work is on `claude/osrs-tool-suite-ap8t4k`, opened as a PR against `main` — **not merged**, per this handoff's explicit instruction to leave it for Codex/George to review)

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

**Owner:** Codex / George next — this PR is open for review, **not merged**.
**Status:** Smithing Training Planner (5 routes including Blast Furnace and a full Giants' Foundry mode) and the Herblore Mastering Mixology upgrade toggles (Prescription goggles, Alchemist's amulet, Reagent pouch) are both built and locally tested on branch `claude/osrs-tool-suite-ap8t4k`. PR opened against `main`; deliberately left unmerged per the handoff's instruction.
**Assignment for whoever picks this up:** Review the PR, pull the branch, verify against real GE prices (this sandbox has no outbound internet — see "How this session verified it" below), then merge if it looks good.

Full Smithing + Herblore-upgrade specification: `CLAUDE_SMITHING_HANDOFF_2026-08-05.md`.

Full original Crafting build specification: `CLAUDE_HANDOFF_2026-08-05.md`. Treat this README as authoritative over both older specs where they conflict with what's actually implemented.

### What was built this session

**`osrs-smithing-planner.html`** — new focused planner matching Crafting/Herblore's architecture:
- Five routes: **Fastest** (greedy live xp/hr over early anvil, platebodies, Blast Furnace gold), **Simple** (curated stable anvil progression: early sequence → Iron platebodies extended to 48 → Steel → Mithril → Adamant), **Cheapest** (live net GP/XP over Blast Furnace bars, platebodies, dart tips, and cannonballs with a 40k xp/hr floor), **Low Attention** (early sequence until dart tips or cannonballs unlock, then exclusively that Make-X method), and a dedicated **Giants' Foundry** mode with Train-to-level and Earn-rewards sub-modes (mirroring Herblore's Mixology pattern).
- Controls: Members/F2P, Goldsmith gauntlets, Coal bag, Smiths' Uniform, Optimal anvil (Prifddinas, off by default), Double ammo mould, Output handling (GE/High Alchemy), Low Attention dart-tips/cannonballs preference, Blast Furnace stamina toggle, Cheapest xp/hr floor.
- `suite-nav.js`'s Herblore/Crafting-only focused-layout condition is now `current.name==='Herblore'||current.name==='Crafting'||current.name==='Smithing'`, and every `body[data-suite-page="herblore"],body[data-suite-page="crafting"]` selector in `suite-nav.css` (126 of them) now also includes `body[data-suite-page="smithing"]`, plus a Smithing-only override for its 5-column (vs. the others' 4-column) route-tab grid.
- Added to `suite-nav.js`'s tools list, the `index.html` landing grid, and replaced the "Smithing — Soon" disabled sidebar button with a real link on all seven other planner pages (Fletching/Cooking remain disabled, as instructed).
- Data pulled live from the Wiki this session: Smithing/Pay-to-play/Free-to-play Smithing training pages, Blast Furnace + its Strategies page (bar rates, both with and without coal bag — the wiki only publishes with-coal-bag rates, see deviations below), Giants' Foundry + its Strategies page (reputation-shop items and alloy ratios), and individual item pages for ten High Alchemy values (bronze dagger through Adamant platebody).

**Herblore Mastering Mixology upgrades** — added an "Owned upgrades" toggle row to `osrs-herblore-planner.html` (Prescription goggles / Alchemist's amulet + current-charges field / Reagent pouch), with per-method `gogglesEligible`/`amuletEligible`/`pouchEligible` flags set from the actual Wiki pages for each item (not inferred from ingredient shape) across all 24 unique potions/herbs in the planner's data. New `computeStopFinancials()` does the exact math (ceiling-rounded goggles savings, sequential amulet-charge tracking across a route's stops, dose-normalized amulet revenue), while `netCostPerAction()`/`netGpPerXp()` got a continuous (non-ceiling) version of the same factors so Cheapest's route *selection* also reflects the owned upgrades, not just the final totals. A "Without upgrades / With selected upgrades / Estimated savings / Estimated time saved" comparison card appears above the route whenever any upgrade is enabled.

### Deviations and judgment calls worth knowing about

**Smithing:**
- **No-coal-bag Blast Furnace rates are a labeled -30% estimate.** The Wiki's Strategies page only publishes rates *with* a coal bag equipped; there's no published without-coal-bag figure to cite. Iron needs no coal at all, so its rate is unaffected by the toggle either way.
- **Foundry alloy ratios for Iron/Steel and Steel/Mithril are unverified placeholders (14:14 even split).** The Wiki's Strategies page gives exact ratios for Bronze/Iron (9:19), Mithril/Adamantite (18:10), and Adamantite/Runite (19:9), but not for the two middle tiers. The UI labels these two specifically as "not independently verified" rather than presenting them as researched fact.
- **Smiths' Uniform's Foundry bonus uses a single +17.5% assumption** (Wiki states "roughly 15-20%"), and the without-optimal-moulds Foundry rate uses a labeled -20% estimate (no exact figure published) — both per the handoff's instruction to pick one assumption, label it, and apply it consistently.
- **Foundry defaults to bars, not recycled equipment** — modeling equipment as "one fewer bar than its anvil cost" is flagged in the handoff as a future enhancement, not v1 scope.
- High Alchemy is only offered for anvil weapons/armour (ten items with fetched alch values); bars, dart tips, and cannonballs correctly have no alch option per the handoff.

**Herblore upgrades:**
- **Goggles' eligibility is per-method, sourced from the Prescription goggles wiki page**, not inferred from having a second ingredient. It explicitly does NOT apply to herb cleaning, Extended antifire (uncertain — Lava scale shard isn't confirmed on the goggles' supported list, so marked ineligible rather than guessed), Ancient essence-based Forgotten brew, or Nihil-dust/Lily-of-the-sands-based Ancient brew/Menaphite remedy (uncertain secondaries). It DOES apply to Super attack/restore/strength family potions, Saradomin brew, Anti-venom+, and — per the Wiki's own example list — Super combat potion, though Super combat's goggles savings aren't modeled in v1 (see below).
- **Super combat potion is goggles-ineligible in this implementation** despite the Wiki confirming the effect applies to it, because its four-ingredient recipe doesn't fit the planner's "inputNames[1] is the one secondary" convention that the savings math relies on — modeling per-ingredient savings across four items was out of scope for this session. Flagged rather than modeled incorrectly.
- **Amulet eligibility follows the Wiki's explicit always-four-dose exclusion list** (antidote+/++, anti-venom+, super combat, super antifire) plus Guthix rest (not in this planner), and separately excludes any *recipe* whose modeled input is already 4-dose (Extended antifire uses `Antifire potion(4)`, Anti-venom+ uses `Anti-venom(4)`) even though the output items themselves are sometimes wiki-confirmed as amulet-eligible in the abstract — matching the handoff's explicit instruction and acceptance test 6.
- **Reagent pouch's 2,700/hr rate is the handoff's own labeled estimate**, applied only to the group of ordinary 14+14 potions already modeled at exactly 2,500/hr and only at level 81+; it never touches the existing 2,750/hr stackable-secondary methods, cleaning, Mixology, or Super combat.
- Cheapest's *method selection* uses a continuous (non-ceiling, currentCharges-agnostic) approximation of the upgrade math for comparison ordering; the *displayed totals and shopping list* use the exact ceiling-rounded, charge-sequenced math. Documented in code comments — this only matters at the margins where two candidate methods are extremely close in GP/XP.

### How this session verified it

This sandbox has no outbound internet access to `prices.runescape.wiki`, `api.wiseoldman.net`, or GitHub's push endpoint until the very end, so verification used Playwright + Chromium with **injected mock GE prices** rather than live ones:
- Both files pass `node --check` and `git diff --check`.
- Smithing: all 5 routes render with no console/page errors; F2P correctly filters members-only methods and Low Attention/Foundry show clear explanations rather than broken tabs; hand-verified math against mock prices for Bronze dagger net cost, Adamant platebody's exact 5-bar/1-output recipe, dart tips' 1-bar/10-tip recipe, cannonball normal-vs-double-mould (1/4/25.6 vs 2/8/51.2, both dividing to exactly 540 actions/hr), Blast Furnace's 72,000gp/hr fee (72000/6400=11.25gp/action, matches exactly), the Goldsmith gauntlets 56.2/22.5 XP switch, and High Alchemy crediting the full value plus a separate Nature rune input line (not netted invisibly).
- Herblore upgrades: hand-verified against the handoff's own acceptance-test numbers and all matched exactly — goggles on 10,000 one-secondary actions gives shopping qty 9,000 / saved 1,000; amulet on 10,000 3-dose actions gives 31,500 expected total doses / 1,500 expected procs / 145 Amulets of chemistry needed starting from 50 charges; Super combat and four-dose-input Extended antifire both correctly show `amuletEligible:false`; pouch correctly gives 2,700/hr at level 81+ and leaves the 2,750/hr Stamina potion method untouched. Also verified via the real UI (not just direct function calls): the toggle panel survives the focused-layout transform, the comparison card renders and is directionally correct (in one test case it correctly showed the amulet as *not* worth it once a high mock recharge-item price was factored in — the model isn't naively assuming upgrades always help), and upgrade state persists across route-tab switches.
- No horizontal overflow at a 390px mobile viewport on either page.
- Ran a regression pass on Herblore's pre-existing Nuclear/Standard/Budget/Mixology routes to confirm nothing broke.

**Next agent: pull this branch, verify the Smithing Cheapest route and the Herblore upgrade comparison card against real GE prices (only mock-price-tested here), then merge the PR if it looks good — do not push more commits to `main` directly without going through the PR.**

## Current production state

Last deployed feature commit before this session: `2f27d79` — Crafting route cost/simple-progression fixes (already on `main`, not part of this PR).

The public suite currently includes (Smithing and the Herblore upgrades ship once this PR merges):

- Landing page/player lookup
- GE Tracker
- Skill Profit Calculator
- Construction Planner
- Farming Planner
- Herblore Planner (now with Owned-upgrades toggles for Mastering Mixology rewards)
- Prayer Planner
- Crafting Planner
- Smithing Planner (new this session — Fastest/Simple/Cheapest/Low Attention/Giants' Foundry)

Important current behavior:

- Focused Herblore/Crafting/Smithing UI (shared `suite-nav.css`/`suite-nav.js` layout) is the reference design for new planners.
- Centered planner width is about 940-1120px; GE Tracker intentionally remains wide.
- Herblore routes are Fastest, Simple, Cheapest, and Mastering Mixology, now with optional Prescription goggles / Alchemist's amulet / Reagent pouch upgrades that recalculate cost, revenue, and (for the pouch) throughput.
- Smithing routes are Fastest, Simple, Cheapest, Low Attention, and Giants' Foundry (Train-to-level / Earn-rewards).
- Cheapest routes use live net GP/XP rather than a permanently fixed guide route, and reflect owned upgrades/toggles in their method selection, not just final totals.
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
