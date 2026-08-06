# Claude Code Handoff — OSRS Planner Suite

Read `README.md` first. It is the shared living status file for both Claude Code and Codex and must be updated whenever work is handed between agents.

Date: 2026-08-05  
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Branch: `main`  
Current head before this handoff: `385eaa2`

## Immediate assignment

Build a new focused **Crafting Training Planner** that matches the current Herblore planner’s visual language and suite behavior. Research and calculations must be accurate, use live OSRS Wiki Grand Exchange prices, and expose exact action/material quantities rather than abbreviated values.

Do not redesign the suite again. Reuse the focused planner structure, shared navigation, theme preference, Wise Old Man lookup, exact-XP handling, route summaries, per-step net costs, item imagery, and shopping list behavior already established in Herblore.

## Current project shape

This is a static GitHub Pages site: standalone HTML/CSS/JS with no framework or build step.

- `index.html` — landing page and player lookup
- `osrs-ge-tracker.html`
- `osrs-skill-profit.html`
- `osrs-training-planner.html` — Construction
- `osrs-farming-planner.html`
- `osrs-herblore-planner.html` — best reference for the new page
- `osrs-prayer-planner.html`
- `suite-nav.js` — suite switcher and focused Herblore header/control transformation
- `suite-nav.css` — shared focused layout and width rules

Add `osrs-crafting-planner.html`, add Crafting to `suite-nav.js`, add a Crafting card to `index.html`, and make sure previous/next tool cycling includes it.

## User’s product preferences

- Simple, focused UI with little visual noise.
- Accurate OSRS data is more important than flashy features.
- Live prices must drive cost routes; do not present stale guide prices as current.
- Exact quantities must be shown (for example `46,303`, not `46.3K`) in recipe/action steps.
- Show both upfront capital and net cost after selling outputs.
- Show net cost for every individual route step.
- Use item/method images, but render small enough to avoid obvious pixelation.
- Light/dark mode must persist throughout the entire suite.
- Do not attribute routes to content creators in the interface.

## Work completed today

Today’s commits, in chronological order:

- `fbf1512` Improve Herblore training routes
- `31d51dd` Fix manual Herblore level updates
- `115a755` Add live-value Herblore route
- `a41c978` Add focused suite navigation
- `476b056` Match focused Herblore preview styling
- `03c88e8` Refresh shared suite styles
- `3c3e58d` Rebuild Herblore focused route interface
- `670b02c` Apply full focused planner layout
- `e9567bb` Preserve focused planner recalculation
- `c51b034` Refine focused planner controls
- `8c992fc` Remove redundant live value route
- `3159738` Make Herblore route goals price-aware
- `86bb5be` Show net cost for each Herblore step
- `4d151ea` Add Mixology reward goal mode
- `000e1be` Add Mixology potion and reward icons
- `eb3c747` Fix and refine Mixology item icons
- `cbc6605` Support multiple Mixology reward goals
- `c753989` Standardize suite widths and exact potion counts
- `891f8fe` Fix exact XP route calculations
- `23b6ef0` Add Level / Exact XP starting modes
- `4e99b6f` Persist theme across the tool suite
- `385eaa2` Add landing-page theme toggle

### Resulting behavior to preserve

1. Herblore uses the focused layout with routes named **Fastest**, **Simple**, **Cheapest**, and **Mastering Mixology**.
2. The redundant “Live Value” route was removed. Cheapest dynamically reevaluates unlocked practical methods from live net GP/XP.
3. Route tabs show current time/cost estimates.
4. Each route step shows exact actions, XP/hour, time, net cost, and GP/XP.
5. Mixology supports Train to Level or Earn Rewards, multi-select rewards, combined resin/time/herb calculations, and selected reward images.
6. Planner widths are capped consistently around 940px. GE Tracker intentionally remains wider because it is a multi-pane workspace.
7. The starting-point control is a right-side **Level / Exact XP** switch with one **Update plan** action.
8. Applying exact XP derives and displays the corresponding level while preserving progress within that level for calculations.
9. Loading a Wise Old Man character switches to exact-XP mode and uses the fetched XP.
10. One `osrs-suite-theme` localStorage key persists light/dark mode across all tools.
11. The landing page now has its own upper-right theme toggle using the same key.

## Crafting planner product plan

Crafting is an excellent fit for the same planner model, but its routes should represent genuinely different play styles.

### Recommended routes

1. **Fastest** — maximum practical XP/hour, regardless of cost.
   - Early leather/gems as appropriate.
   - Sapphire → emerald → ruby → diamond cutting.
   - Compare unlocked gems, battlestaves, and d'hide by XP/hour.
   - Red d'hide bodies at 77 and black d'hide bodies at 84 are major late-game breakpoints.

2. **Simple** — predictable bank-standing progression with reasonable speed and uncomplicated inventories.
   - Gems → battlestaves → selected d'hide bodies.
   - Avoid constantly switching for tiny live-price differences.

3. **Cheapest** — dynamically choose the lowest practical live net GP/XP at each unlock level.
   - Candidate families: gems, jewellery, drift nets, glass, battlestaves, d'hide, amethyst.
   - Reevaluate at every candidate unlock.
   - Protect against missing prices and misleading low-volume outputs.
   - Do not blindly select an extremely slow profitable method forever. Use a documented practical XP/hour floor and/or user-selectable priority.

4. **Low Attention** — long automated inventories and fewer clicks.
   - Molten glass progression, especially unpowered orbs from 46.
   - Lantern lenses may be included at 49 if the speed/cost tradeoff is sensible.
   - This route fills the role that Mixology occupies as Herblore’s distinct fourth option.

### Important controls

- **Members / F2P** toggle.
- **Costume needle** toggle for d'hide throughput:
  - Normal needle/thread: 8 bodies per inventory, about 1,685 bodies/hour.
  - Costume needle: 9 bodies per inventory, about 1,705 bodies/hour.
  - Do not default to tick manipulation; optionally label its roughly 1,783 bodies/hour as an advanced assumption.
- **Output handling** selector where applicable:
  - Sell on Grand Exchange.
  - High Alchemy.
  - High Alchemy with self-tanned dragonhide.
- **Requirements filters** for methods with quests, locations, or other skill requirements.
- Consider an XP/hour or intensity preference for Cheapest so “profitable but glacial” does not dominate the result.

### Initial method library

Build a carefully verified first version with roughly 25–35 methods:

- Leather progression for low levels.
- Cut sapphire, emerald, ruby, diamond.
- Water, earth, fire, air battlestaves.
- Green, blue, red, black d'hide bodies.
- Core molten-glass products.
- Drift nets.
- Selected high-volume gold/silver jewellery recipes.
- Amethyst bolt tips, arrowtips, javelin tips, and dart tips.

Treat Superglass Make and Dorgesh-Kaan lamp fixing as labelled alternative methods initially. Their yields, spell costs, dropped-glass assumptions, movement, and secondary requirements make them inappropriate for an automatic default route until modeled explicitly.

## Verified baseline data

Primary research:

- https://oldschool.runescape.wiki/w/Crafting
- https://oldschool.runescape.wiki/w/Pay-to-play_Crafting_training
- https://oldschool.runescape.wiki/w/Free-to-play_Crafting_training
- https://oldschool.runescape.wiki/w/Calculator:Crafting/Gem_cutting

Cross-check guides only; the Wiki remains the source of truth:

- https://osrstoolkit.com/guides/crafting/
- https://osrstools.net/guides/skills/crafting
- Theoatrix 2025 Crafting guide was reviewed only as a method inventory, not for attribution in the UI.

### Battlestaves

Assume 2,450 actions/hour for the standard route unless a setting says otherwise.

| Level | Method | XP/action | XP/hour |
|---:|---|---:|---:|
| 54 | Water battlestaff | 100 | 245,000 |
| 58 | Earth battlestaff | 112.5 | 275,625 |
| 62 | Fire battlestaff | 125 | 306,250 |
| 66 | Air battlestaff | 137.5 | 336,875 |

Each recipe is one elemental orb plus one battlestaff, producing the matching elemental battlestaff.

### D'hide bodies

Each body consumes exactly 3 matching dragon leathers.

| Level | Method | XP/body | Normal XP/h | Costume needle XP/h |
|---:|---|---:|---:|---:|
| 63 | Green d'hide body | 186 | 313,410 | 317,130 |
| 71 | Blue d'hide body | 210 | 353,850 | 358,050 |
| 77 | Red d'hide body | 234 | 394,290 | 398,970 |
| 84 | Black d'hide body | 258 | 434,730 | 439,890 |

The Wiki also gives tick-manipulated rates using 1,783 actions/hour, but this should be advanced/not default.

### Molten glass

Assume 1,750 actions/hour for ordinary bank-standing glassblowing.

| Level | Product | XP/action | XP/hour | Input |
|---:|---|---:|---:|---|
| 1 | Beer glass | 17.5 | 30,625 | 1 molten glass |
| 4 | Empty candle lantern | 19 | 33,250 | 1 molten glass |
| 12 | Empty oil lamp | 25 | 43,750 | 1 molten glass |
| 33 | Vial | 35 | 61,250 | 1 molten glass |
| 42 | Empty fishbowl | 42.5 | 74,375 | 1 molten glass |
| 46 | Unpowered orb | 52.5 | 91,875 | 1 molten glass |
| 49 | Lantern lens | 55 | 96,250 | 1 molten glass |
| 87 | Empty light orb | 70 | 122,500 | 1 molten glass; output is not normally GE-traded |

### Other verified methods

- Drift net: level 26, exactly 2 jute fibres, 60 XP, around 1,000 nets/hour (60,000 XP/hour).
- Amethyst tips: 60 XP per amethyst action and roughly 165,000 XP/hour:
  - Bolt tips level 83
  - Arrowtips level 85
  - Javelin tips level 87
  - Dart tips level 89
- Superglass Make: requires 77 Magic and Lunar Diplomacy; common giant-seaweed inventory is 18 buckets of sand + 3 giant seaweed + 2 astral runes per cast. Wiki reports about 108,000–153,000 Crafting XP/hour depending on pace. Do not treat this as a simple 1:1 output recipe.

### Gem cutting baseline

- Sapphire: level 20, 50 XP.
- Emerald: level 27, 67.5 XP.
- Ruby: level 34, 85 XP.
- Diamond: level 43, 107.5 XP, approximately 290,000 XP/hour under the Wiki’s cited assumptions.
- Input is exactly one corresponding uncut gem; output is one cut gem.

Verify member-specific semi-precious gems and failure behavior before adding them to automatic routes.

## Cost engine requirements

Reuse the Wiki Prices API patterns already in the repo:

```js
const WIKI_MAPPING='https://prices.runescape.wiki/api/v1/osrs/mapping';
const WIKI_LATEST='https://prices.runescape.wiki/api/v1/osrs/latest';
```

Critical existing rule: mapping IDs must be stored as strings because latest-price object keys are strings.

```js
nameToId[item.name.toLowerCase()] = String(item.id);
```

Use instant-buy (`high`) for inputs and instant-sell (`low`) for outputs. Apply the current GE tax rules used by the suite. For each method:

```text
input cost/action = sum(input quantity × live buy price)
sell credit/action = output quantity × live sell price after tax
net cost/action = input cost − sell credit
net GP/XP = net cost/action ÷ XP/action
```

Display:

- exact actions
- exact quantities of every input
- exact output quantity
- XP required
- estimated time
- gross/upfront input cost
- output sale credit
- net cost
- net GP/XP
- full shopping list aggregated across route steps

Do not abbreviate action/material quantities in route steps or recipe cards. Summary currency can remain compact if the focused UI already does so.

## UX and integration requirements

- Match the focused Herblore page, not the older wide planner appearance.
- Preserve the 940px centered content width.
- Use Level / Exact XP switch and derive Crafting level from XP.
- Wise Old Man lookup must request `crafting`, not `herblore`.
- Use `osrs-suite-theme` and initialize it before the page becomes visible to minimize theme flash.
- Add appropriately sized Crafting and item icons using OSRS Wiki mapping/icon conventions.
- Route tabs should show live total net cost and time when prices load.
- Include clear requirement badges/notes rather than silently selecting inaccessible methods.
- If a price is missing, exclude the method from live automatic selection and explain why; never silently treat a missing price as zero cost.
- Low-volume jewellery should be warned or excluded from automatic Cheapest routing.

## Acceptance tests

1. Crafting appears on the landing page and in suite previous/next/dropdown navigation.
2. Light/dark preference survives Landing → Crafting → Farming → Crafting.
3. Wise Old Man loads Crafting level and exact XP and switches to exact-XP mode.
4. Manual Level mode and Exact XP mode both recalculate and update the visible heading.
5. Exact XP partway through a level reduces actions, cost, and time correctly.
6. Every recipe uses exact input quantities; d'hide bodies consume 3 leather and drift nets consume 2 jute fibre.
7. Every route step displays an exact action count and its own net cost.
8. Upfront capital and net cost are both present and mathematically distinct.
9. Costume needle changes d'hide throughput/time but not XP per body or leather quantity.
10. Cheapest route changes when mocked prices make a different unlocked method lower GP/XP.
11. Missing price data cannot make a method appear free.
12. F2P mode excludes members-only methods.
13. Shopping-list totals equal the sum of all route-step quantities.
14. No console errors, horizontal overflow, broken navigation, or obviously pixelated oversized icons at desktop/mobile widths.

## Deployment workflow

The user expects changes live, not just local.

1. Work on `main` unless George asks otherwise.
2. Run syntax/diff checks and local browser verification.
3. Commit and push to GitHub.
4. Watch the GitHub Pages deployment to completion.
5. Verify the public GitHub Pages URL with a cache-busting query parameter.

Preserve unrelated user work and do not use destructive git commands.

## Important caution

The older `CLAUDE_CODE_HANDOFF.md` contains useful implementation details but is stale in several product areas (old page count, old Herblore route names, old navigation description, and old backlog). Treat this dated handoff and the current code as authoritative for the new Crafting work.
