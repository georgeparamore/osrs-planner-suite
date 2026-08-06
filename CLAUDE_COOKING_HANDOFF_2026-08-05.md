# Claude Code Handoff — Cooking Training Planner

Read `README.md` completely, then read this file completely. Current code and this handoff are authoritative over older handoffs.

Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Starting point: `main` at or after merge commit `618cc03` (Smithing planner and OSRS Toolbox branding)

## Assignment

Build a focused Cooking planner in `osrs-cooking-planner.html`. Match the current Crafting/Smithing focused interface and use the visible brand **OSRS Toolbox**.

Create a feature branch, implement and test locally, push it, and open a PR against `main`. Do not merge it. George and Codex will review it.

## Product position

Cooking is valuable because live prices, burn chance, cooking location, equipment, intensity, and output value materially change the best route. It must not be a basic XP calculator.

Use four routes:

1. **Fastest** — highest credible XP/hour. Includes 1-tick karambwan and clearly labels the click intensity.
2. **Simple** — understandable fish progression with few method changes and no tick manipulation.
3. **Cheapest** — live optimizer for the lowest expected net GP/XP among eligible methods, with a practical XP/hour floor.
4. **Low Attention** — cook-all fish or karambwan with long inventories and ordinary banking.

Do not add a creator or guide attribution to the UI. Cite the OSRS Wiki in source comments and a compact methodology note.

## Required integration

- Add `osrs-cooking-planner.html`.
- Add Cooking to `suite-nav.js` immediately after Smithing.
- Include it in previous/next navigation and the dropdown.
- Extend the existing focused-layout selectors in `suite-nav.js` and `suite-nav.css`; do not duplicate the shared stylesheet.
- Add an enabled Cooking card to `index.html`.
- Replace disabled Cooking “Soon” buttons in older hard-coded sidebars. Keep Fletching disabled until its planner is built.
- Update `README.md` at handoff with the actual branch, commit, PR, testing, decisions, and remaining uncertainties.

## Shared behavior

- Focused centered layout matching Crafting/Smithing.
- Persistent `osrs-suite-theme` light/dark preference.
- Wise Old Man “Load character” using skill key `cooking`.
- Level / Exact XP starting modes. Applying exact XP must derive and visibly update the current Cooking level while retaining partial-level progress.
- Target level and Members/F2P controls.
- Live OSRS Wiki Prices API.
- Inputs use instant-buy/high; outputs use instant-sell/low minus current GE tax.
- Missing prices make methods unavailable; never treat missing prices as zero.
- Exact action and shopping quantities. GP summaries may use K/M/B, but individual item prices and shopping lines must be exact comma-separated GP.
- Route summary: expected net cost/profit, time, successful cooks, raw attempts, and upfront capital.
- Per-step expected net cost/profit and GP/XP.
- Small Wiki item images.

## Critical modeling rule: burning is probabilistic

Cooking differs from the existing deterministic planners. Keep these values distinct:

- `successfulNeeded = ceil(xpNeeded / xpPerSuccess)`
- `successChance(level, food, location, upgrades)`
- `expectedRawAttempts = ceil(successfulNeeded / successChance)`
- `expectedBurns = expectedRawAttempts - successfulNeeded`
- `expectedOutputQty = successfulNeeded`
- `expectedTime = expectedRawAttempts / rawAttemptsPerHr`
- `expectedNetCost = expectedRawAttempts × rawBuyPrice - successfulNeeded × afterTaxCookedSellPrice`
- `upfront = expectedRawAttempts × rawBuyPrice`

All raw quantities, burnt quantities, costs, and times affected by burn chance must be labeled **Estimated** or `≈`. Do not claim the shopping list is guaranteed exact. Add an optional safety-buffer selector: **Expected / +2% / +5% raw food**. The buffer changes shopping/upfront quantities, not XP, expected outputs, or the underlying success chance.

Do not invent a linear burn formula. Use verified current Wiki burn data or the Wiki calculator/module logic. If an exact formula or data row cannot be verified for a method/location combination, omit it from automatic optimization or label it as a guide-table estimate. Add unit tests for known no-burn levels.

Cooking cape means 100% success and should only be usable at level 99; it is not useful for a normal pre-99 route and does not need a v1 toggle.

## Location controls

Use a compact location selector with requirements and rates:

| Location | Attempts/hour before burns | Effect / requirement |
|---|---:|---|
| Myths’ Guild | 1,435 | Range beside bank; requires Dragon Slayer II |
| Rogues’ Den | 1,435 | Fire beside banker; higher burn chance than a range |
| Mor Ul Rek | 1,435 | Sulphur vent beside bank; requires fire cape |
| Hosidius Kitchen | 1,365 | Range; easy Kourend & Kebos diary; +5 percentage-point success, +10 with elite diary |
| Cooks’ Guild | 1,411 | Range; bank requires hard Varrock diary or 99 Cooking |
| Lumbridge Castle | 1,208 | Special range for supported foods; Cook’s Assistant |

Use the Wiki’s exact location tick formula when practical: ordinary cook-all is 4 ticks per item, and a full-inventory cycle is based on `117 + travel tiles` ticks before run adjustment. Do not apply one location’s throughput or burn bonus to another location.

Add owned/access checkboxes with images where possible:

- Cooking gauntlets (Family Crest)
- Hosidius Kitchen access (easy Kourend & Kebos diary)
- Kourend elite diary
- Myths’ Guild access (Dragon Slayer II)
- Fire cape / Mor Ul Rek access

Use image-and-checkbox cards like the revised Smithing owned-item controls, not Owned/Not owned segmented buttons. Account type and abstract preferences may remain segmented controls.

## Cooking gauntlets

- Affect only supported foods. The current Wiki list includes lobster, swordfish, monkfish, shark, anglerfish, and cooked kyatt.
- They do not affect karambwan.
- Do not apply a global burn reduction.
- Shark reaches zero burns at level 94 with gauntlets; use this as a required acceptance test.
- The interaction between swordfish, gauntlets, and Hosidius must follow the current Wiki data; the guide notes gauntlets do not further affect swordfish at Hosidius.

## Core methods

Each method should include:

```js
{
  family, name, minLevel, maxLevel, membersOnly,
  xpPerSuccess, rawName, cookedName,
  baseAttemptsPerHr, burnProfile,
  gauntletsEligible, allowedLocations,
  requirements: [], intensity, note
}
```

At minimum include these ordinary fish tiers:

| Level | Raw input | Output | XP/success | Membership |
|---:|---|---|---:|---|
| 1 | Raw sardine | Sardine | 40 | F2P |
| 5 | Raw herring | Herring | 50 | F2P |
| 10 | Raw mackerel | Mackerel | 60 | Members |
| 15 | Raw trout | Trout | 70 | F2P |
| 20 | Raw pike | Pike | 80 | F2P |
| 25 | Raw salmon | Salmon | 90 | F2P |
| 30 | Raw tuna | Tuna | 100 | F2P |
| 40 | Raw lobster | Lobster | 120 | F2P |
| 45 | Raw swordfish | Swordfish | 140 | F2P |
| 62 | Raw monkfish | Monkfish | 150 | Members; Swan Song |
| 80 | Raw shark | Shark | 210 | Members |
| 84 | Raw anglerfish | Anglerfish | 230 | Members |
| 91 | Raw manta ray | Manta ray | 216.3 | Members |

Verify all names against the Wiki Prices mapping. Do not silently substitute guide prices.

### Karambwan

- Poison karambwan: level 1, 80 XP/success, no quest requirement; intended only for Fastest 1–30.
- Cooked karambwan: level 30, 190 XP/success, requires Tai Bwo Wannai Trio.
- Cooking gauntlets do not help.
- 1-tick mode uses a transparent baseline of 5,000 raw attempts/hour; the Wiki cites a maximum near 5,470, but do not use the maximum by default.
- Low-attention cook-all uses 1,385 attempts/hour at Hosidius through level 95 and about 1,435 beside a bank afterward.
- Fastest must explicitly say “1-tick / very high attention.”

### Wines

- Level 35, grapes + jug of water → unfermented wine → jug of wine.
- 200 XP for a successful fermentation.
- Each wine is made every 2 ticks; use the Wiki’s credible 470,000–490,000 XP/hour ceiling only from level 68 when wines no longer fail. Use 480,000 as a labeled baseline unless current research supports another conservative value.
- Before level 68, bad wine is random. Model the verified level-based success chance or exclude sub-68 wine from automatic routes rather than pretending every wine succeeds.
- Wine output is usually not meaningfully resold. Credit the tradeable output only if the mapping/pricing API actually supplies a valid sell price; otherwise treat the finished wine as zero tradeable revenue and label that decision.

### Bake Pie

- Optional v1 candidate for Simple/Cheapest, not required for the initial route if data quality is weak.
- Requires Lunar Diplomacy and sufficient Magic for Bake Pie.
- Never burns.
- One cast per 3 ticks; Wiki baseline is about 1,885 pies/hour.
- Include astral runes and any other consumed runes exactly. Infinite-rune equipment is a requirement/toggle, not free runes by assumption.
- Show passive Magic XP separately; never add it to Cooking XP.
- Exclude low-volume pie inputs from automatic Cheapest selection when supply is too thin.

## Route definitions

### Fastest

- Level 1–30: 1-tick poison karambwan.
- Level 30–99: 1-tick cooked karambwan if the quest requirement is enabled.
- If cooked karambwan is unavailable, compare wines and the fastest eligible fish mathematically.
- Do not call ordinary cook-all fish the fastest when 1-ticking is enabled.

### Simple

- No tick manipulation.
- Use an understandable fish progression: early fish → tuna → lobster → swordfish/monkfish → shark → anglerfish.
- Prefer fewer method switches where the time/cost difference is small.
- Route identity stays stable as prices move; prices update totals but do not completely rewrite Simple.

### Cheapest

- Live optimizer across eligible fish, karambwan, wines, and verified pies.
- Default practical floor: 75,000 expected XP/hour, with a checkbox to disable it.
- Compare expected net GP/XP after burns and GE tax.
- Filter missing-price and non-finite candidates before sorting.
- Re-evaluate at each unlock and whenever equipment, location, buffer, membership, or prices change.
- Profitable methods display Net Profit rather than negative Net Cost.
- Add a volume/buy-limit warning for methods needing unusually large quantities.

### Low Attention

- Never use 1-tick methods.
- Prefer cook-all fish or AFK karambwan.
- Show the selected location and expected burn rate clearly.
- Keep time estimates honest: raw attempts/hour × success chance determines XP/hour.

## F2P behavior

- Filter karambwan, monkfish, shark, anglerfish, manta ray, member locations, and member spells.
- Wines are available in F2P and may be Fastest from level 35/68.
- F2P Simple must reach 99 with normal fish or wines and have no gaps.
- F2P location choices must not show inaccessible member banks/ranges.

## UI details

- Focused title: `Cooking · current → target`.
- Route rows show levels, food icon/name, selected location, success chance, expected raw attempts, expected successful cooks, expected burns, XP/hour, time, and expected step cost/profit.
- Shopping rows show exact per-item prices and full integer quantities; uncertain raw quantities carry `≈`.
- Summary clearly separates **raw food to buy**, **successful food expected**, and **burns expected**.
- Add a methodology note explaining that outcomes vary because burning is random.
- No horizontal overflow at 390px.

## Acceptance tests

1. Landing, dropdown, and previous/next navigation reach Cooking.
2. Theme persists Landing → Cooking → Smithing → Cooking.
3. Wise Old Man loads exact Cooking XP and derives level.
4. Level and Exact XP modes both apply correctly.
5. Raw input, cooked output, XP, and membership are correct for every included recipe.
6. Shark has 100% success at level 94 with cooking gauntlets.
7. Gauntlets do not affect karambwan.
8. Hosidius adds only its verified success bonus and uses 1,365 attempts/hour.
9. Myths’ Guild/Rogues’ Den uses 1,435 attempts/hour, with range/fire burn differences preserved.
10. Expected raw attempts use `ceil(successes / successChance)`.
11. Safety buffer changes purchases/upfront only.
12. 1-tick karambwan uses 5,000 attempts/hour and is labeled very high attention.
13. Cook-all karambwan uses the lower documented rate.
14. Wines use two inputs and 200 XP per successful fermentation; failures below 68 are not ignored.
15. Cheapest never treats missing inputs as free.
16. GE tax applies to cooked outputs.
17. Profitable methods display Net Profit.
18. F2P routes reach 99 without member content.
19. Counts are full integers, not abbreviated; detailed prices are exact GP.
20. Desktop and 390px mobile have no overflow, broken images, syntax errors, or console errors.

## Sources reviewed

- https://oldschool.runescape.wiki/w/Cooking
- https://oldschool.runescape.wiki/w/Cooking/Experience_table
- https://oldschool.runescape.wiki/w/Cooking/Burn_level
- https://oldschool.runescape.wiki/w/Pay-to-play_Cooking_training
- https://oldschool.runescape.wiki/w/Free-to-play_Cooking_training
- https://oldschool.runescape.wiki/w/Hosidius_Kitchen
- https://oldschool.runescape.wiki/w/Cooking_gauntlets
- https://oldschool.runescape.wiki/w/Karambwan
- https://oldschool.runescape.wiki/w/Jug_of_wine
- https://oldschool.runescape.wiki/w/Bake_Pie

Research snapshot: 2026-08-05. Prices are live, never frozen. Recipes and XP values must be exact; burn quantities and outcomes are expected values and must be labeled as estimates.

## Completion protocol

1. Create a feature branch from updated `main`.
2. Implement the planner and integration.
3. Test calculations with known burn/no-burn cases and real Wiki prices.
4. Test desktop and 390px mobile.
5. Update `README.md` with actual decisions and deviations.
6. Commit, push, and open a PR against `main`.
7. Give George the PR link and local preview link. Do not merge.
