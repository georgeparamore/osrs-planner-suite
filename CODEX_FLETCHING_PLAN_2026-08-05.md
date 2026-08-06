# Codex Build Plan — Fletching Training Planner

This is the authoritative research and implementation plan for Codex’s next planner after Claude’s Cooking PR is reviewed. Read `README.md` first and rebase the eventual implementation branch on the latest merged `main`.

## Product case

Fletching is an excellent OSRS Toolbox planner because route choice depends on live margins, intensity, unlocks, output quantities, and whether the player wants bank-standing, low-attention, or zero-time training. It should not be reduced to a bow calculator.

## Proposed routes

Use six routes:

1. **Fastest** — highest credible bank-standing XP/hour among unlocked methods at the selected interaction level.
2. **Simple** — stable bow progression with minimal switching.
3. **Cheapest** — live optimizer for lowest net GP/XP with a practical XP/hour floor and liquidity safeguards.
4. **Low Attention** — unstrung bows and other long Make-X actions.
5. **Zero Time** — stackable darts/arrows/bolts intended for training while moving or doing another activity.
6. **Vale Totems** — dedicated minigame route with level training and selectable reward goals.

“Low Attention” and “Zero Time” must remain distinct. Bows occupy inventory and require banking; darts/arrows/bolts can be made from stacks during other activities. Vale Totems remains separate because its XP, offerings, research points, travel loop, and unlock goals cannot be represented honestly as an ordinary bank-standing recipe.

## Shared suite behavior

- New `osrs-fletching-planner.html` in the focused layout.
- Add after Cooking in navigation once Cooking is merged.
- OSRS Toolbox brand, shared theme, Wise Old Man lookup (`fletching`), Level/Exact XP, Members/F2P, live prices, exact shopping counts, per-step costs, and small item images.
- Input = instant-buy/high. Output = instant-sell/low minus GE tax.
- Missing prices invalidate a method.
- Detailed item prices and shopping lines are exact GP; aggregate summaries may use K/M/B.
- Every method models the actual batch size and output quantity.

## Owned unlocks and preferences

Use image-and-checkbox cards for owned unlocks:

- **Fletching knife** — reduces supported Make-X actions by one tick after the first item. For unstrung bows, use about 2,700/hour versus 1,800/hour with a normal knife.
- **Bow string spool** — permits 27 bows per inventory rather than 14 and gives approximately a 3% stringing-rate improvement. Capacity is not consumed; do not add replacement spools to shopping.
- **Broader fletching** — Slayer reward required for broad arrows/bolts.
- **Log basket** — substantially improves full-loop Vale Totems routing and XP rates.

Abstract preferences:

- Members/F2P
- Interaction: **Relaxed / Active / Maximum effort**
- Bow handling: **Unstrung / String bows / Cheapest live**
- Cheapest XP/hour floor
- Liquidity filter: exclude low-volume methods by default

Do not represent interaction intensity as an owned item.

## Data model

```js
{
  family, name, minLevel, maxLevel, membersOnly,
  xpPerBatch, batchSize,
  actionsPerHrByIntensity,
  inputNames:[{name,qty}],
  outputName, outputQty,
  requirements:[], knifeEligible, spoolEligible,
  attention, note
}
```

An action is one completed recipe batch:

- Bows: 1 log → 1 unstrung bow, or 1 unstrung bow + 1 bow string → 1 strung bow.
- Darts/bolts: normally 10 tips/unfinished bolts + 10 feathers → 10 outputs.
- Arrows/javelins: 15 headless arrows/shafts + 15 tips → 15 outputs.
- Headless arrows: 15 arrow shafts + 15 feathers → 15 headless arrows.
- Tipped bolts: typically 10 bolts + 10 tips → 10 tipped bolts.

Never price a batch output as one item. `outputQty` must be multiplied before revenue.

## Verified mechanics

### Bows

- Normal knife cutting: about 1,800 unstrung bows/hour (3 ticks each plus banking).
- Fletching knife: about 2,700/hour (2 ticks after the first item).
- Stringing: about 2,700 bows/hour; bow string spool gives roughly 3% more because 27 bows fit per inventory instead of 14.
- Bows are usually cheap or profitable and are the main Simple/Low Attention identity.
- Include shortbow and longbow tiers only where they are genuinely useful; avoid needless switches for tiny differences.
- Minimum core tiers: normal, oak, willow, maple, yew, magic. Verify exact level, XP, input and output names from the current Wiki experience table.

### Ammunition

- Darts do not require The Tourist Trap to fletch; that quest is only required to smith dart tips. Do not gate Fletching darts behind the quest.
- Darts are made in sets of 10 and are the main Zero Time candidate.
- Bolts are made in sets of 10; broad bolts require broader fletching.
- Arrows and javelins are made in sets of 15.
- Tipped bolts are made in sets of 10 and may be profitable, but output volume and buy limits require safeguards.
- Current guide baseline for arrows is 3,000 batches/hour; javelins support ordinary 3,000, active 4,000, and maximum-effort 6,000 batches/hour. Label maximum effort as 1-tick and do not make it the default.

Verified examples for arithmetic tests:

| Recipe | Level | Batch XP | Inputs | Output |
|---|---:|---:|---|---|
| Arrow shafts | 1 | 5 | 1 Logs | 15 Arrow shaft |
| Headless arrows | 1 | 15 | 15 Arrow shaft + 15 Feather | 15 Headless arrow |
| Adamant dart | 67 | 150 | 10 Adamant dart tip + 10 Feather | 10 Adamant dart |
| Amethyst dart | 90 | 210 | 10 Amethyst dart tip + 10 Feather | 10 Amethyst dart |
| Adamant arrow | 60 | 150 | 15 Headless arrow + 15 Adamant arrowtips | 15 Adamant arrow |
| Amethyst arrow | 82 | 202.5 | 15 Headless arrow + 15 Amethyst arrowtips | 15 Amethyst arrow |
| Adamant javelin | 62 | 150 | 15 Adamant javelin heads/tips + 15 Javelin shaft | 15 Adamant javelin |
| Amethyst javelin | 84 | 202.5 | 15 Amethyst javelin heads/tips + 15 Javelin shaft | 15 Amethyst javelin |
| Adamant bolts | 61 | 70 | 10 Adamant bolts (unf) + 10 Feather | 10 Adamant bolts |
| Amethyst broad bolts | 76 | 106 | 10 Broad bolts + 10 Amethyst bolt tips | 10 Amethyst broad bolts |

Confirm exact Wiki Prices mapping names before coding; the Wiki may use `Javelin shaft`, `Adamant javelin heads`, or another precise singular/plural form.

## Route definitions

### Fastest

- Select the highest credible XP/hour unlocked method for the chosen interaction level.
- Relaxed mode must not use 1-tick rates.
- Active mode may use ordinary rapid ammunition rates.
- Maximum effort may use verified 1-tick javelin/dart assumptions with an explicit warning.
- Do not call a theoretical ceiling a sustainable rate.

### Simple

- Early arrow shafts/headless arrows until bows unlock.
- Stable bow progression through appropriate longbow tiers.
- Default bow handling should be stringing if the user wants faster XP, with an unstrung preference available.
- Prices update totals but do not constantly rewrite Simple.

### Cheapest

- Live optimizer across eligible unstrung bows, strung bows, darts, bolts, arrows, javelins, and verified tipped-bolt methods.
- Default practical floor around 40,000 XP/hour; revisit after real candidate tests.
- Filter methods with missing prices, non-finite values, extremely low trade volume, or insufficient buy limits for the plan.
- Display Net Profit instead of negative cost.
- Re-evaluate at unlocks and when equipment/preferences/prices change.
- Show a warning when required quantities exceed a single GE buy-limit window. Do not claim instant acquisition.

### Low Attention

- Prefer cutting unstrung bows with Make-X.
- Fletching knife changes throughput only, never XP or materials.
- Allow a compact Cut bows / String bows preference.
- Keep bank frequency and inventory behavior visible.

### Zero Time

- Stackable ammunition only: darts, arrows, bolts, or javelins where appropriate.
- Explain that displayed “hours” means active clicking time equivalent; calendar completion depends on the other activity.
- Offer a conservative batches/hour default and optional active mode.
- Never mix zero-time hours with ordinary bank-standing time without labeling them separately.

### Vale Totems

Provide two sub-modes like Giants’ Foundry and Mastering Mixology:

1. **Train to level** — estimated logs, decorations, XP, time, offerings, research points, and material cost.
2. **Earn rewards** — multi-select reward goals with current research points, offerings/points remaining, time, logs, XP gained, and projected ending level.

Requirements and mechanics:

- Members only, level 20 Fletching, and completion of the Vale Totems miniquest.
- Each complete totem uses 5 log-equivalents: 1 log for the totem and 4 matching decorations.
- Eight totems require 40 logs/decorations for a full circuit.
- Supported tiers unlock at Oak 20, Willow 35, Maple 50, Yew 65, Magic 80, and Redwood 90.
- Wrong spirit carvings reduce XP by 25% per wrong animal and reduce offerings; v1 assumes correct carvings and says so.
- The base strategy is roughly 90 totems and 450 logs per hour. A maximum-efficiency reward estimate may use roughly 8,000 offerings or 80 research points per hour, but must be labeled and tied to its routing requirements.
- Include a current-research-points input.
- Owned-item checkboxes affect this route: Fletching knife, Bow string spool, and Log basket.
- Show optional Construction XP separately; never add it to Fletching XP. Construction XP requires owning a player-owned house.

Reward cards with images and multi-selection:

| Reward | Research points |
|---|---:|
| Bow string spool | 250 |
| Fletching knife | 350 |
| Greenman mask | 500 |

Do not assign a deterministic point price to random rummage drops. Direct shop goals use the exact costs above. Rummaging consumes 100 offerings per research point and one loot-table roll.

Use current Wiki strategy ranges rather than one universal rate:

| Logs | Standard XP/hr | With log basket | Log basket + bow string |
|---|---:|---:|---:|
| Oak | 22,500 | 29,000 | 36,000 |
| Willow | 55,000 | 71,000 | 89,000 |
| Maple | 87,500 | 120,000 | 150,000 |
| Yew | 140,000 | 225,000 | 265,000 |
| Magic | 265,000 | 340,000 | 420,000 |
| Redwood | 325,000 | 420,000 | N/A |

Verify whether each published rate already assumes the Fletching knife before coding, and never stack its bonus twice. The strategy guide separately reports Magic up to about 420,000 XP/hour when carving and stringing with the knife and spool.

## F2P

- Fletching is available in F2P; filter members-only woods and ammunition.
- Current F2P access includes normal/oak/willow/maple bows and ammunition up to adamant arrows; verify the precise level gates and item availability.
- F2P Simple and Cheapest must reach 99 with no gaps.
- Do not show member unlock checkboxes when F2P is selected.

## UI requirements

- Focused title: `Fletching · current → target`.
- Six route tabs must remain usable on mobile; stack or horizontally scroll without clipping.
- Route rows show level range, method, recipe/batch, XP/hour, time, exact batches, exact finished quantity, step cost/profit, and GP/XP.
- For batches, show both values, e.g. `12,345 batches · 123,450 darts`.
- Shopping list aggregates shared inputs and shows exact per-item prices.
- Owned-item images use current Wiki sprite filenames and must be tested for nonzero natural width.
- Methodology note distinguishes sustainable, active, and maximum-effort rates.

## Calculation requirements

- Round batches up first.
- Derive each material as `ceil(batches × inputQty)`.
- Derive output as `batches × outputQty`.
- Upfront = all inputs before output credits.
- Net = inputs − after-tax outputs.
- If a multi-stage route intentionally makes an intermediate then consumes it, aggregate it without telling the player to both buy and make the same quantity. Prefer a dependency-aware shopping list or keep stages independent with a clear toggle.
- Untradeable unlocks are requirements, not zero-price shopping rows.

## Acceptance tests

1. Navigation, theme, Wise Old Man, Level/Exact XP, and mobile layout match the suite.
2. Every included recipe has correct level, batch XP, input quantities, and output quantity.
3. 10,000 Adamant darts require 10,000 tips and 10,000 feathers—not 1,000 or 100,000—and grant 150,000 XP.
4. 1,000 Adamant-arrow batches consume 15,000 headless arrows and 15,000 arrowtips, create 15,000 arrows, and grant 150,000 XP.
5. Fletching knife changes supported bow throughput from about 1,800 to about 2,700/hour without changing materials or XP/action.
6. Bow string spool changes inventory/rate only and does not create free bow strings.
7. Darts are not incorrectly gated by The Tourist Trap.
8. Broad ammunition is gated by broader fletching.
9. Cheapest filters missing prices and low-liquidity candidates.
10. GE tax and output quantities are correct.
11. Profitable steps use Net Profit wording.
12. Zero Time explains its time semantics.
13. Vale Totems uses 5 log-equivalents per totem and 40 per eight-totem circuit.
14. Vale reward goals combine without double counting and current research points reduce the grind correctly.
15. Fletching knife, spool, and log basket change only documented Vale rates and inventory behavior.
16. Vale offerings and research points remain distinct and convert at 100 offerings per point.
17. F2P routes reach 99 without member methods.
18. Counts are exact integers; detailed prices are exact GP.
19. No console errors, broken images, or horizontal overflow at 390px.

## Research still required immediately before implementation

- Pull the current bow table with exact level/XP values for every included shortbow and longbow.
- Pull the complete dart/arrow/bolt/javelin tables and choose only liquid candidates.
- Confirm Wiki Prices mapping names and item IDs.
- Confirm current GE buy limits/volume fields and decide the liquidity threshold.
- Verify sustainable dart rates for Relaxed and Active modes; do not reuse javelin assumptions blindly.
- Verify Vale Totems’ rate assumptions for each owned-item combination and prevent double-applying the Fletching knife bonus.

## Sources reviewed

- https://oldschool.runescape.wiki/w/Fletching
- https://oldschool.runescape.wiki/w/Fletching/Experience_table
- https://oldschool.runescape.wiki/w/Fletching_training
- https://oldschool.runescape.wiki/w/Free-to-play_Fletching_training
- https://oldschool.runescape.wiki/w/Fletching_knife
- https://oldschool.runescape.wiki/w/Bow_string_spool
- https://oldschool.runescape.wiki/w/Calculator:Fletching/Ammo
- https://oldschool.runescape.wiki/w/Vale_Totems
- https://oldschool.runescape.wiki/w/Vale_Totems/Strategies
- https://oldschool.runescape.wiki/w/Vale_offerings

Research snapshot: 2026-08-05. Re-check recent Varlamore/Vale Totems changes before coding because the Fletching knife and bow string spool are newer mechanics.

## Planned implementation sequence

1. Merge and review Claude’s Cooking planner first to avoid navigation conflicts.
2. Refresh research and method tables.
3. Create a Codex feature branch from updated `main`.
4. Build the Fletching page and shared navigation integration.
5. Add deterministic arithmetic tests for batch/output quantities.
6. Verify all routes with live prices and missing-price simulations.
7. Browser-test desktop and 390px mobile.
8. Commit, push, open a PR, and leave it for George to approve.
