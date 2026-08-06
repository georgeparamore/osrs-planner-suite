# OSRS Toolbox — Shared Project Status

This is the first file Claude Code and Codex must read before making changes. It is the living handoff for switching assistants, including when George continues from mobile.

Last updated: 2026-08-05 by Claude Code
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Production baseline: `main` at or after merge commit `618cc03`
Cooking planner: implemented on branch `claude/osrs-cooking-planner`, PR open against `main`, **not merged** — see "Cooking planner status" below

## Required startup protocol

1. Read this file completely.
2. Read the current assignment file completely.
3. Inspect `git status`, the active branch, and recent commits.
4. Start from updated `main` unless the assignment names another branch.
5. Preserve unrelated work and never use destructive cleanup.

## Current assignments

### Cooking and Fletching planners

Fletching is merged and live. Cooking was implemented from `CLAUDE_COOKING_HANDOFF_2026-08-05.md`, reviewed and corrected by Codex, and is ready to merge alongside the reconciled shared navigation.

## Cooking planner status

**Branch:** `claude/osrs-cooking-planner` · **PR:** open against `main`, not merged.

**What was built:** `osrs-cooking-planner.html` with four routes (Fastest = 1-tick karambwan, explicitly labeled "1-tick / very high attention"; Simple = curated 10-food progression Sardine→Anglerfish, no tick manipulation; Cheapest = live net-GP/XP optimizer with a 75k xp/hr floor; Low Attention = cook-all fish or AFK karambwan). Six location options (Myths' Guild, Rogues' Den, Mor Ul Rek, Hosidius Kitchen, Cooks' Guild, Lumbridge Castle) gated by owned-access checkboxes, cooking gauntlets, a safety-buffer selector (Expected/+2%/+5%), and full burn-aware cost math per the handoff's exact formulas (`successfulNeeded = ceil(xpNeeded/xpPerSuccess)`, `expectedRawAttempts = ceil(successfulNeeded/successChance)`, etc). Wired into `suite-nav.js`/`suite-nav.css` (extended the shared focused-layout selectors to include `cooking`), the landing page, and every other planner's sidebar (Fletching stays disabled, as instructed).

**Burn-chance data:** cross-checked directly against each included food's Wiki item page. Codex's PR review replaced the original 50%-at-unlock estimate with the Wiki's exact low/high success parameters and documented skilling-success formula, including separate fire, range, Lumbridge, Hosidius, elite-diary, gauntlet, and combined profiles where applicable. Shark is exactly 100% at level 94 with gauntlets and below 100% at 93.

**Deviations/omissions:**
- **Bake Pie was skipped entirely for v1** — the handoff explicitly allows this ("not required for the initial route if data quality is weak"), and this session didn't have confident Wiki-verified pie recipe/price-mapping data.
- **Manta ray has no sub-99 burn-stop level** and is not affected by cooking gauntlets; its exact Wiki success parameters are modeled. It remains excluded from Simple so Anglerfish carries through to 99 with fewer switches.
- **Cooked karambwan eligibility is user-controlled** with a Tai Bwo Wannai Trio checkbox. When unavailable, Fastest falls back to the mathematically fastest eligible fish/wine route, and Low Attention falls back to fish.
- **Cheapest considers ordinary fish, cooked karambwan, and wines** when eligible, using exact success chances and live net GP/XP.
- **Hosidius's exact success bonus is only verified for Swordfish** (76/71 at +5%/+10%). Other foods fall back to their gauntlets/range stop level at Hosidius, which understates Hosidius's real (smaller) bonus — a labeled conservative choice, not a claim of exact Hosidius data for every food.
- **Poison karambwan is modeled as never burning** — no verified burn data was found for it, and it's used purely as a 1-30 leveling filler.

**Two real bugs found and fixed during testing** (both caught by hand-verifying against the handoff's own acceptance-test numbers, not just eyeballing the UI):
1. `effectiveStopLevel()`'s location dispatch short-circuited *before* ever checking cooking gauntlets, so Shark/Anglerfish's gauntlet bonus was silently ignored at Rogues' Den and Hosidius (gauntlets are worn equipment and should apply at any location). Rewritten to collect every applicable candidate stop level and take the minimum.
2. `COOKING_SIMPLE`'s curated array used off-by-one `FOODS[]` array indices, producing zero-width Monkfish/Shark/Anglerfish entries that could never match and silently pulling in Manta ray instead. Rewritten to look foods up by name (`foodByName()`) so this class of bug can't recur silently.
3. (Follow-on from #2) F2P Simple/Low Attention dead-ended at level 62 because their members-only tail (Monkfish→Shark→Anglerfish) gets filtered out with nothing to replace it — violating the handoff's explicit "F2P Simple must reach 99." Fixed by bridging the gap with Wine (F2P-available from level 35) when the curated array's F2P-filtered tail doesn't reach 99.

**How this session verified it:** this sandbox has no outbound internet to `prices.runescape.wiki`/`api.wiseoldman.net`, so all testing used Playwright + Chromium with injected mock GE prices. Verified directly against the handoff's acceptance-test numbers: Shark exactly 100% at level 94 with gauntlets (and <100% at 93); gauntlets provably don't change karambwan's effective stop level; Hosidius=1,365/hr, Myths'/Rogues'=1,435/hr; `expectedRawAttempts` matches `ceil(successfulNeeded/chance)` exactly; 1-tick karambwan=5,000/hr, cook-all karambwan=1,385/hr (Hosidius, through 95)/1,435/hr (bank); wine=200xp with two inputs; safety buffer changes only shopping quantity, never successful-cook count; GE tax reduces sell price below the raw high/low spread; a food with no valid sell price (mocked Jug of wine at 0/0) shows zero credit rather than crashing or being treated as free; profitable routes render "Net Profit" not negative "Net Cost"; F2P Fastest/Simple/Low Attention all reach exactly level 99 with zero members-only rows. No console/page errors on any of the four routes, no horizontal overflow at 390px.

**Fletching status:** merged and live with six routes, live prices, exact quantities, Wise Old Man lookup, owned-item controls, and both level and combined-reward planning for Vale Totems. Its research and implementation plan is `CODEX_FLETCHING_PLAN_2026-08-05.md`.

## Current production state

The public suite includes:

- Landing page and player lookup branded **OSRS Toolbox**
- GE Tracker
- Skill Profit Calculator
- Construction Planner
- Farming Planner
- Herblore Planner, including Mastering Mixology goals and owned-upgrade estimates
- Prayer Planner
- Crafting Planner
- Smithing Planner, including Blast Furnace and Giants’ Foundry modes
- Cooking Planner (new this session, PR pending) — burn-aware Fastest/Simple/Cheapest/Low Attention routes across six locations

Important current behavior:

- Crafting, Herblore, Smithing, and Cooking use the focused shared layout and are the reference for new planners.
- One `osrs-suite-theme` preference persists across all pages.
- Planners support Level / Exact XP and Wise Old Man lookup.
- Live-value routes compare net GP/XP and must reject missing prices.
- Counts and shopping quantities are full integers; Cooking's are additionally expected values (labeled `≈`) since burning is probabilistic.
- Individual item prices and shopping-line prices are exact GP; large aggregate totals may use K/M/B.
- The shared header brand is **OSRS Toolbox**.

## Architecture rules

- Static HTML/CSS/JavaScript; no framework or build step.
- GitHub Pages deploys from `main`.
- Use the OSRS Wiki Prices API for live Grand Exchange prices.
- Store mapping IDs as strings: `String(item.id)`.
- Inputs use instant-buy/high.
- Outputs use instant-sell/low minus current GE tax.
- Missing prices must never become zero-cost supplies.
- Use exact recipe quantities, batch sizes, output quantities, and rounded-up action counts.
- Show upfront capital separately from net cost after outputs.
- Use Wise Old Man for account level/XP lookup.
- New owned-item controls use compact image-and-checkbox cards where practical.

## Verification expectations

For every material UI or calculation change:

1. Run syntax checks and `git diff --check`.
2. Exercise relevant flows locally in a browser.
3. Test at least one exact known calculation.
4. Test missing-price behavior.
5. Check desktop and 390px mobile overflow.
6. Confirm item images load.
7. Commit and push to a feature branch.
8. Open a PR and give George its link and a local preview link.

## Handoff update protocol

Before ending substantial work, update this README with:

- Last updated date and assistant.
- Active assignment, branch, commit, and PR.
- Tests completed.
- Product decisions and deviations.
- Known bugs and exact next steps.

Do not delete dated handoffs; they preserve project history. Current code and the newest assignment take precedence over old handoffs where they conflict.

## Communication with George

- Lead with what changed and whether it is local, in a PR, merged, or live.
- Give direct preview/public links.
- Keep explanations straightforward.
- Leave enough written context that Claude or Codex can resume without George repeating decisions.
