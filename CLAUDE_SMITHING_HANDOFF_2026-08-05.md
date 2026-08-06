# Claude Code Handoff — Smithing Training Planner

Read `README.md` completely before starting, then read this file completely. Current code and this handoff are authoritative over older project handoffs.

Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Starting point: merged Crafting planner on `main` at or after merge commit `6aad9e9`

## Assignment

Build a focused **Smithing Training Planner** in `osrs-smithing-planner.html`. It should feel like the Crafting planner, not like an older wide page. Preserve the suite’s shared theme, navigation, Wise Old Man lookup, Level/Exact XP input, live GE prices, exact quantities, per-step net costs, and shopping-list behavior.

Do not merge the PR. Open a PR and leave it for Codex and George to review and test.

## Product decisions

Use five routes because Smithing has five meaningfully different play styles:

1. **Fastest** — highest credible XP/hour among unlocked methods. Normal solo play only; do not include paid Blast Furnace runners.
2. **Simple** — predictable anvil progression using the highest practical platebody tier.
3. **Cheapest** — lowest live net GP/XP among eligible methods, with a practical XP/hour floor. Re-evaluate at every unlock and when prices change.
4. **Low Attention** — long Make-X actions: dart tips by default, with cannonballs as an explicit preference.
5. **Giants’ Foundry** — dedicated minigame route with both level training and selectable reward goals.

Avoid guide/creator attribution in the UI. Cite the OSRS Wiki in source comments and an unobtrusive methodology note.

## Required files and integration

- Add `osrs-smithing-planner.html`.
- Add Smithing to `suite-nav.js` immediately after Crafting. Include it in previous/next cycling and the dropdown.
- Extend focused-layout selectors in `suite-nav.js` and `suite-nav.css` to Smithing without duplicating the stylesheet.
- Add an enabled Smithing card to `index.html`.
- Replace Smithing “Soon” buttons on older hard-coded sidebars. Do not mark Fletching or Cooking live.
- Update `README.md` at handoff with branch, commit, test results, assumptions, and PR URL.

## Shared behavior to copy

- Centered focused layout, approximately 940px wide.
- Persistent `osrs-suite-theme` light/dark preference.
- “Load character” Wise Old Man lookup using skill key `smithing`.
- Level / Exact XP toggle. Applying exact XP derives and visibly updates current level while retaining partial-level progress.
- Target level, Members/F2P toggle, route summary, exact action counts, exact shopping quantities, per-step net cost/profit, total time, upfront capital, and net cost after outputs.
- Live OSRS Wiki Prices API. Inputs use instant-buy/high; outputs use instant-sell/low and current GE tax rules.
- Missing prices make a method ineligible or explicitly unknown. Never convert a missing price to zero.
- Small item icons using existing Wiki mapping conventions.

## Core data model

Each ordinary method should include at least:

```js
{
  family, name, minLevel, maxLevel, membersOnly,
  xpPerAction, actionsPerHr,
  inputNames: [{name, qty}],
  outputName, outputQty,
  requirements: [], highAlch, note
}
```

An “action” is one completed Make-X product or one Blast Furnace bar. For platebodies, one action consumes five bars. Dart tips consume one bar and create ten tips. Normal cannonballs consume one steel bar and create four cannonballs; the double mould processes two bars and creates eight per action.

## Verified baseline mechanics

### Metal XP per bar at an anvil

| Metal | XP per bar |
|---|---:|
| Bronze | 12.5 |
| Iron | 25 |
| Steel | 37.5 |
| Mithril | 50 |
| Adamant | 62.5 |
| Rune | 75 |

A five-bar platebody therefore gives 62.5, 125, 187.5, 250, 312.5, or 375 XP respectively.

### Early anvil progression

Use the Wiki’s verified fastest 1–40 sequence as the shared early baseline:

| Levels | Method | Bars/action | XP/action | Baseline XP/hr |
|---|---|---:|---:|---:|
| 1–5 | Bronze dagger | 1 | 12.5 | 13,900 |
| 5–9 | Bronze scimitar | 2 | 25 | 25,700 |
| 9–18 | Bronze warhammer | 3 | 37.5 | 36,200 |
| 18–24 | Bronze platebody | 5 | 62.5 | 52,100 |
| 24–33 | Iron warhammer | 3 | 75 | 72,300 |
| 33–39 | Iron platebody | 5 | 125 | 104,200 |
| 39–40 | Steel warhammer | 3 | 112.5 | 108,500 |

Simple may consolidate tiny tiers where that materially improves clarity, but it must never create a level gap.

### Platebody progression

| Method | Level | Bars/action | XP/action | Baseline XP/hr |
|---|---:|---:|---:|---:|
| Bronze platebody | 18 | 5 bronze | 62.5 | 52,100 |
| Iron platebody | 33 | 5 iron | 125 | 104,200 |
| Steel platebody | 48 | 5 steel | 187.5 | about 144,000–156,200 |
| Mithril platebody | 68 | 5 mithril | 250 | about 200,000–208,300 |
| Adamant platebody | 88 | 5 adamant | 312.5 | about 240,000–260,400 |
| Rune platebody | 99 | 5 rune | 375 | not a normal pre-99 step |

Use conservative ordinary-location rates unless the player enables an **Optimal anvil** toggle. Do not assume Prifddinas or the Smiths’ Uniform by default.

### Blast Furnace gold

- Level 40, members only; one gold ore becomes one gold bar.
- Goldsmith gauntlets increase XP from 22.5 to **56.2 XP per ore**.
- Wiki practical solo rate is roughly 5,600–6,600 bars/hour. Use a transparent baseline such as 6,400 bars/hour, not the maximum, unless labeled.
- Official worlds charge **72,000 coins/hour**. Include this time-based overhead in net and upfront estimates.
- Include stamina usage as an optional overhead. The guide assumes about 40 stamina doses/hour for gold; document the potion-item conversion.
- Goldsmith gauntlets require Family Crest. Add a toggle. If disabled, use 22.5 XP/ore and re-compare Fastest candidates.
- Show Ice gloves or smiths gloves (i) as non-consumed requirements.
- Do not include paid runner methods (530k–680k XP/hour).

### Blast Furnace profit methods

Include these in Cheapest’s members candidate pool, using the Blast Furnace coal-saving recipes:

| Bar | Level | XP/bar | Inputs |
|---|---:|---:|---|
| Iron | 15 | 12.5 | 1 iron ore |
| Steel | 30 | 17.5 | 1 iron ore + 1 coal |
| Mithril | 50 | 30 | 1 mithril ore + 2 coal |
| Adamantite | 70 | 37.5 | 1 adamantite ore + 3 coal |
| Runite | 85 | 50 | 1 runite ore + 4 coal |

Model the 72,000 GP/hour fee and stamina assumption. Coal-bag rates assume the coal bag; expose a **Coal bag** toggle and reduce throughput when disabled. Wiki reference rates with coal bag are about 5,400 steel, 3,600 mithril, 2,700 adamantite, and 2,160 runite bars/hour.

### Dart tips

- Members only and require The Tourist Trap.
- One bar creates **10 dart tips**.
- Full inventory Make-X takes about 81 seconds.
- Without Smiths’ Uniform: about 10,600 tips/hour, or 1,060 actions/hour.
- Full uniform: about 13,000 tips/hour, or 1,300 actions/hour.

| Method | Level | XP/action |
|---|---:|---:|
| Bronze dart tips | 4 | 12.5 |
| Iron dart tips | 19 | 25 |
| Steel dart tips | 34 | 37.5 |
| Mithril dart tips | 54 | 50 |
| Adamant dart tips | 74 | 62.5 |
| Rune dart tips | 89 | 75 |

The Smiths’ Uniform toggle changes throughput only, never XP/action or quantities.

### Cannonballs

- Steel cannonballs require level 35 and Dwarf Cannon.
- Normal mould: 1 steel bar → 4 cannonballs, 25.6 XP.
- Double mould: 2 steel bars → 8 cannonballs, 51.2 XP per action.
- Wiki baseline: about 13,824 XP/hour normal and 27,648 XP/hour double. Do not default to the newer maximum-effort 6,000-balls/hour teleport method.
- Double ammo mould costs 2,000 Foundry reputation and requires Dwarf Cannon. Expose a toggle and requirement.
- Do not add newer adamant cannonballs unless their post-Sailing recipe, requirements, rate, and mapping are independently researched.

### High Alchemy handling

Offer **Sell on GE / High Alchemy** for eligible anvil products. In Alchemy mode:

- add exactly one Nature rune per output item to inputs, upfront cost, and shopping list;
- credit the full high-alch value;
- do not subtract the rune invisibly from output revenue;
- show alching time separately if modeled; do not silently add it to Smithing time;
- do not offer Alchemy for bars, dart tips, or cannonballs without a verified reason.

## Route definitions

### Fastest

- Early anvil sequence through 40.
- At 40+, Blast Furnace gold with gauntlets normally dominates.
- Candidate selection must be mathematical when gauntlets are off or requirements exclude a method.
- Platebodies are fallback candidates from 48 onward.
- No runners, boosts, or cape-only rates by default.

### Simple

- Stable anvil route: early sequence, Iron platebodies 33–48, Steel 48–68, Mithril 68–88, Adamant 88–99.
- Live prices update totals but do not change this route’s identity.
- Show GE/Alchemy handling and exact bars.

### Cheapest

- Live optimizer over eligible Blast Furnace bars, dart tips, platebodies, and cannonballs.
- Default practical floor: **40,000 XP/hour**, with a toggle to disable it.
- Compare net GP/XP including output quantity, GE tax, nature runes, furnace fee, stamina, and consumables.
- Filter non-finite/missing-price candidates before sorting. If none remain, show an unavailable-price message.
- Profitable methods display Net Profit, not negative Net Cost.
- Explain that price changes can change the chosen method.

### Low Attention

- Reuse early anvil training until an eligible Make-X method unlocks.
- Default to dart tips. Add a compact **Dart tips / Cannonballs** preference.
- Cannonballs are much slower; time estimates must make that obvious.
- Respect Tourist Trap, Dwarf Cannon, uniform, and double-mould toggles.

## Giants’ Foundry route

Keep Foundry separate from Cheapest because its results vary with commissions, moulds, mistakes, and unlocks.

- Members only, minimum level 15, requires Sleeping Giants.
- Each sword uses 28 bar-equivalents from two metal tiers.
- Recommended alloys by level: Bronze/Iron at 15, Iron/Steel at 30, Steel/Mithril at 50, Mithril/Adamantite at 70, Adamantite/Runite at 85.
- Default to bars, not recycled equipment. Equipment counts as one fewer bar than its anvil cost and is a future enhancement.
- Use documented economical ratios such as 9/19 Bronze/Iron and 18/10 Mithril/Adamantite where appropriate; do not invent a universal 14/14 rule.
- Label XP/hour, rep/hour, coins, material use, and time as estimates.
- Kovac’s coin reward equals twice the sword’s XP reward. Preserve the Wiki formula’s floor operations if calculating per sword.

Baseline no-uniform, optimal-mould estimates:

| Alloy | Level | Swords/hr | Bars/hr | XP/hr | Rep/hr | Reward GP/hr |
|---|---:|---:|---:|---:|---:|---:|
| Bronze/Iron | 15 | 16 | 448 | 97,920 | 1,264 | 195,840 |
| Iron/Steel | 30 | 16 | 448 | 133,920 | 1,568 | 267,840 |
| Steel/Mithril | 50 | 14 | 392 | 164,640 | 1,722 | 329,280 |
| Mithril/Adamantite | 70 | 12 | 336 | 198,000 | 1,836 | 396,000 |
| Adamantite/Runite | 85 | 11 | 308 | 253,110 | 2,068 | 506,220 |

Provide two modes:

1. **Train to level** — estimated swords, each metal’s bars, time, reputation, coin rewards, XP, upfront, and net cost.
2. **Earn rewards** — multi-select rewards; combined reputation remaining, swords, materials/cost, time, XP gained, and projected ending level.

Reward cards need small images and checkboxes:

| Reward | Reputation |
|---|---:|
| Double ammo mould | 2,000 |
| Smiths gloves | 3,500 |
| Smiths boots | 3,500 |
| Smiths tunic | 4,000 |
| Smiths trousers | 4,000 |
| Full Smiths’ Uniform | 15,000 convenience selection; do not double-count pieces |
| Colossal blade | 5,000 |

Add current reputation and **Optimal moulds unlocked** inputs. Moulds cost up to 5,400 reputation and affect rates. When optimal moulds are off, use a documented reduced estimate. The Wiki describes the full uniform’s Foundry improvement as roughly 15–20%; select one assumption, label it, and use it consistently. Exclude repeatable grog, catalysts, and ore packs from v1 reward goals.

## Pricing and arithmetic rules

- `outputQty` is mandatory and multiplied before revenue.
- Upfront cost includes all consumables and activity fees before credits.
- Net cost = consumables + time-based fees − after-tax GE revenue − deterministic coin rewards.
- Untradeable equipment and quest unlocks are requirements, not zero-price shopping lines.
- Round actions up, then derive and round indivisible materials.
- Action totals and shopping quantities use full locale integers, never `8.2K`. GP summaries may be compact.
- Every ordinary recipe uses integer quantities.
- Foundry distinguishes swords from bars; never label both merely “actions.”

## Requirements controls

- Members / F2P
- Goldsmith gauntlets
- Coal bag
- Smiths’ Uniform
- Output: GE / High Alchemy
- Optimal anvil (Prifddinas), off by default
- Cheapest XP/hour floor
- Low Attention: dart tips / cannonballs
- Double ammo mould
- Foundry: optimal moulds and current reputation

Show Family Crest, Tourist Trap, Dwarf Cannon, Sleeping Giants, and Song of the Elves requirements on affected cards. Wise Old Man lookup does not prove quest completion.

## F2P behavior

- Filter members methods and controls cleanly.
- F2P Fastest and Simple must reach 99 using anvil methods.
- Do not assume boosts. Adamant platebodies at 88 can continue to 99.
- Rune platebodies at 98 rely on a boost; omit from v1 automatic routes.
- High Alchemy includes nature runes.
- Disable Blast Furnace, dart tips, cannonballs, and Foundry with an explanation rather than broken tabs.

## UI details

- Focused title: `Smithing · current → target`.
- Rows show levels, method/icon, inputs, XP/hour, time, exact actions, net cost/profit, and GP/XP.
- Foundry cards show both metal icons and exact bar quantities.
- Reward images should be slightly smaller than raw inventory sprites to reduce pixelation.
- Match Crafting width and verify no overflow at 390px.

## Acceptance tests

1. Smithing works on landing, dropdown, and previous/next navigation.
2. Theme persists Landing → Smithing → Crafting → Smithing.
3. Wise Old Man loads exact Smithing XP and derives level.
4. Level and Exact XP modes both apply and recalculate.
5. Members Simple has no gaps and ends with Adamant platebodies 88–99.
6. F2P Simple and Fastest reach 99 without members methods.
7. Fastest uses 56.2 XP/gold ore with gauntlets and 22.5 without, then re-compares candidates.
8. Platebodies consume exactly five bars and output one body.
9. Dart-tip actions consume one bar and output ten tips in cost/shopping/sales.
10. Cannonballs switch correctly between 1 bar/4 balls/25.6 XP and 2 bars/8 balls/51.2 XP.
11. High Alchemy adds one nature rune per armour output to upfront and shopping totals.
12. Blast Furnace includes 72,000 GP/hour and the documented stamina assumption.
13. Cheapest never chooses missing-price methods or displays missing inputs as free.
14. Counts are exact, not abbreviated.
15. Foundry level mode calculates swords, both bars, time, XP, rep, coin reward, and cost.
16. Foundry rewards mode supports multiple rewards without uniform-piece double counting.
17. Current reputation correctly reduces the reward grind.
18. Account/requirement toggles immediately recalculate or clearly disable methods.
19. Desktop and 390px mobile have no horizontal overflow and retain usable labels/focus.
20. No console, syntax, or `git diff --check` errors.

## Sources reviewed

## Secondary assignment — Mastering Mixology upgrades in Herblore

In the same PR, enhance `osrs-herblore-planner.html` with an **Owned upgrades** control group. Add three independent toggles with small item images:

- **Prescription goggles**
- **Alchemist’s amulet**
- **Reagent pouch**

Do not add training-effect toggles for the alchemist outfit, potion storage, or chugging barrel. The outfit is cosmetic; storage and the barrel improve bank organization or potion use, not potion-making XP/cost.

### Prescription goggles

- Exact effect: 10% chance not to consume a supported secondary ingredient.
- This does not provide extra XP. The number of potion-making actions needed for the level remains unchanged.
- For `N` actions and an eligible secondary quantity `q` per action, estimated consumption is `ceil(N × q × 0.90)`.
- Mark material quantities and savings as **estimated** because actual saves are random.
- Upfront and net-cost summaries must use the reduced expected secondary quantity, not reduce every input. Unfinished/base potions are still consumed once per action.
- The shopping list should show the expected saved amount, for example `Expected saved: 1,234`, and retain a note about randomness.
- Add a per-method `gogglesEligible` flag. Do not assume every second-stage ingredient is supported. Verify each method represented in the planner against the current Wiki/calculator behavior. The Wiki explicitly describes the effect as working for “most (but not all)” potions.
- Cleaning herbs and Mastering Mixology itself receive no benefit.

### Alchemist’s amulet

- Exact effect: 15% chance to create one extra dose, with no extra XP. A charge is consumed only when the extra dose is created.
- The item starts with 50 charges when purchased. Each Amulet of chemistry adds 10 charges, up to 5,000.
- Add an optional **Current charges** numeric field when the toggle is enabled.
- For standard 3-dose potion creation, expected output doses are `N × 3.15`. After decanting, expected 4-dose output quantity is `(N × 3.15) / 4`, compared with `N × 3 / 4` without the amulet.
- Expected procs/charges consumed are `N × 0.15`. Additional Amulets of chemistry needed are `ceil(max(0, expectedProcs - currentCharges) / 10)`.
- Add those recharge amulets to upfront cost and the shopping list. Do not treat amulet charges as free beyond the entered current charges.
- Revenue must be dose-normalized. Do not incorrectly credit one full extra potion for each proc.
- Add a per-method `amuletEligible` flag. The effect does not work on outputs that always produce four doses, including antidote+, antidote++, anti-venom+, super combat potion, and super antifire. It also does not trigger for Guthix rest.
- For variable-dose upgrades, it triggers only when the input potion has fewer than four doses. Current planner recipes such as Extended antifire using `Antifire potion(4)` therefore receive no amulet benefit unless the recipe model is deliberately changed to lower-dose inputs.
- Stamina, anti-venom, extended antifire, forgotten brew, extended anti-venom+, and divine-type recipes require dose-aware handling. Never apply a blanket 15% output multiplier.
- Because processing 1- or 2-dose inputs can increase yield but take materially longer, v1 should preserve the planner’s existing input-dose recipe and apply the amulet only where that exact recipe is eligible.

### Reagent pouch

- Requires 81 Herblore to use and stores up to 26 of each supported secondary.
- Supported secondary ingredients can be consumed directly from the open pouch, allowing up to 26 potions per inventory instead of the normal 14.
- This changes estimated actions/hour and banking frequency only. It does not change XP/action, inputs/action, outputs/action, or GP/action.
- Add a per-method `pouchEligible` flag and hide/disable the toggle below level 81 with a clear requirement.
- For ordinary 14+14 bank-standing potions currently modeled at 2,500/hour, use a conservative **2,700/hour estimated** pouch rate. This is intentionally below the planner’s 2,750/hour stackable-secondary rate and must be labeled as an estimate because the Wiki notes pouch rates are not comprehensively tested.
- Do not increase methods already modeled at 2,750/hour for stackable secondaries unless a verified method-specific rate supports it.
- Do not apply it to cleaning, Mixology, inventory-heavy multi-input recipes such as super combat, or unsupported secondaries.

### Combined behavior and UI

- The goggles and amulet can be enabled together: calculate reduced expected secondary consumption and increased expected dose revenue independently, then include amulet recharge cost.
- The pouch may be combined with either item but changes time only.
- Add a compact comparison beneath the route summary when any upgrade is enabled:
  - `Without upgrades` net cost and time
  - `With selected upgrades` net cost and time
  - `Estimated savings` and `Estimated time saved`
- Route selection for Cheapest must be recalculated using the selected upgrades. Fastest may change only when the pouch changes eligible throughput. Curated Simple stays curated while its totals update.
- Per-step rows should show small badges for each active applicable upgrade. Do not show a badge when an enabled item does not affect that recipe.
- Expected quantities can include an `≈` marker, but the underlying displayed whole count must not use K/M abbreviations.
- Preserve all current Mixology level/reward modes and reward images.

### Herblore upgrade acceptance tests

1. Goggles reduce only eligible secondary quantities by an expected 10%; action count and XP stay unchanged.
2. For 10,000 eligible one-secondary potions, the expected shopping quantity is 9,000 and expected saved quantity is 1,000.
3. Amulet on 10,000 eligible 3-dose potions produces an expected 31,500 doses, consumes 1,500 expected charges, and requires 145 Amulets of chemistry when starting with 50 charges.
4. Amulet revenue is calculated by dose and decanting, not by treating 1,500 bonus doses as 1,500 four-dose potions.
5. Super combat potion and other always-four-dose outputs receive no amulet benefit.
6. A four-dose-input Extended antifire recipe receives no amulet benefit.
7. Reagent pouch changes eligible ordinary potion throughput from 2,500 to the labeled 2,700/hour estimate and does not alter materials.
8. Pouch has no effect on existing 2,750/hour stackable-secondary methods, cleaning, Mixology, or super combats.
9. Combined goggles + amulet + pouch totals equal the independent material, revenue, recharge, and time effects.
10. Cheapest route re-evaluates after toggles change; missing prices still cannot appear free.
11. Upgrade states persist during recalculation and switching between Herblore routes.
12. Mobile controls do not overflow at 390px and remain understandable on first visit.

Herblore upgrade sources:

- https://oldschool.runescape.wiki/w/Mastering_Mixology
- https://oldschool.runescape.wiki/w/Prescription_goggles
- https://oldschool.runescape.wiki/w/Alchemist%27s_amulet
- https://oldschool.runescape.wiki/w/Reagent_pouch
- https://oldschool.runescape.wiki/w/Herblore_training

Important: potion support exceptions are easy to model incorrectly. Use explicit eligibility flags and verify every current planner recipe rather than inferring support from ingredient shape.

## Smithing sources reviewed

- https://oldschool.runescape.wiki/w/Smithing
- https://oldschool.runescape.wiki/w/Smithing/Experience_table
- https://oldschool.runescape.wiki/w/Pay-to-play_Smithing_training
- https://oldschool.runescape.wiki/w/Free-to-play_Smithing_training
- https://oldschool.runescape.wiki/w/Blast_Furnace
- https://oldschool.runescape.wiki/w/Blast_Furnace/Strategies
- https://oldschool.runescape.wiki/w/Goldsmith_gauntlets
- https://oldschool.runescape.wiki/w/Giants%27_Foundry
- https://oldschool.runescape.wiki/w/Giants%27_Foundry/Strategies
- https://oldschool.runescape.wiki/w/Smiths%27_Uniform

Research snapshot: 2026-08-05. Several Wiki pages were updated within the preceding months. Newer Sailing-related metals and cannonballs are deliberately excluded unless independently researched. Prices are not frozen; fetch them live. Rates are estimates and must be labeled, while recipes, XP/action, output quantities, level gates, and reward costs must be exact.

## Claude completion protocol

1. Create a feature branch.
2. Implement and test locally with real Wiki prices where available.
3. Run acceptance checks, including mobile.
4. Update `README.md` with actual decisions and deviations.
5. Commit, push, and open a PR, but do not merge.
6. Give George the PR link, local preview link, verification summary, and remaining uncertainty.
