# OSRS Tool Suite — Claude Code Handoff
**Complete technical reference for continuing development**

---

## Project Structure

Five standalone HTML files — no build step, no framework, no backend. Open directly in browser. Keep all files in the same folder so nav links work.

```
osrs-ge-tracker.html          ~2,110 lines  GE price tracker / watchlist
osrs-skill-profit.html        ~900 lines    Skill profit calculator  
osrs-training-planner.html    ~726 lines    Construction training planner
osrs-farming-planner.html     ~1,798 lines  Farming training planner (most complex)
osrs-herblore-planner.html    ~973 lines    Herblore training planner
```

---

## Design System

```css
:root {
  --bg:#0d0f14; --surface:#141720; --surface2:#1b1f2e; --border:#252a3a;
  --gold:#c8a84b; --gold-dim:#8a7030; --green:#2ecc71; --red:#e74c3c;
  --blue:#4a7eff; --purple:#9b6fd6; --text:#dde1ec; --text-dim:#6b7490;
}
[data-theme="light"] { /* overrides all above for light mode */ }
```

Light/dark toggle via `document.documentElement.setAttribute('data-theme', 'dark'|'light')`.

**Fonts (Google Fonts):** `Share Tech Mono` (numbers), `Barlow Condensed` (headers), `Barlow` (body).

---

## Live Price API — CRITICAL PATTERNS

### Endpoints
```js
const WIKI_MAPPING = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const WIKI_LATEST  = 'https://prices.runescape.wiki/api/v1/osrs/latest';
```

Do NOT use the official Jagex hiscores/GE API — it has CORS issues.
Do NOT send a custom `User-Agent` header — browsers block it via CORS preflight, causing complete silent failure.

### THE MOST IMPORTANT BUG (already fixed everywhere)
IDs from the mapping API are **numbers** in JSON. `Object.entries(priceData.data)` returns **string** keys. Storing IDs as numbers causes every price lookup to silently return 0.

```js
// CORRECT — String(i.id) is non-negotiable:
mapData.forEach(i => {
  nameToId[i.name.toLowerCase()] = String(i.id);  // ← must be String()
  if (i.icon) nameToIcon[i.name.toLowerCase()] = i.icon;
});
Object.entries(priceData.data).forEach(([id, p]) => { prices[id] = p; });
```

### Price direction
```js
function priceOf(name) {           // BUY price (what you pay to buy)
  const id = nameToId[name.toLowerCase()];
  if (!id || !prices[id]) return 0;
  return prices[id].high || prices[id].low || 0;
}
function sellPriceOf(name) {       // SELL price (what you receive) minus 1% GE tax
  const id = nameToId[name.toLowerCase()];
  if (!id || !prices[id]) return 0;
  const raw = prices[id].low || prices[id].high || 0;
  const tax = Math.min(5000000, Math.max(1, Math.floor(raw * 0.01)));
  return Math.max(0, raw - tax);
}
```

`high` = instant buy price (what buyers pay)
`low` = instant sell price (what sellers receive before tax)
GE tax = 1% of sell price, minimum 1gp, cap 5,000,000gp

### Icon URLs
The mapping API returns an `icon` field (e.g. `"Varrock teleport (tablet).png"`). Use it:
```js
function iconUrl(name) {
  const filename = resolveItemIcon(name);
  if (!filename) return '';
  return `https://oldschool.runescape.wiki/images/${encodeURIComponent(filename.replace(/ /g,'_'))}`;
}
```

Do NOT use `https://secure.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=X` — unreliable.

### Teleport tablet name quirk
GE lists tablets as `"Varrock teleport (tablet)"`, not `"Varrock teleport"`. Always retry with `(tablet)` suffix:
```js
function resolveItemIcon(name) {
  const key = name.toLowerCase();
  if (HARDCODED_ITEM_ICONS[key]) return HARDCODED_ITEM_ICONS[key];
  if (nameToIcon[key]) return nameToIcon[key];
  if (nameToIcon[`${key} (tablet)`]) return nameToIcon[`${key} (tablet)`];
  return null;
}
```

### Hardcoded fallbacks (items not on GE or charge-suffixed)
```js
const HARDCODED_ITEM_IDS = {
  'coins': 995, 'spade': 952, 'rake': 5341,
  'digsite pendant': 11194,   // untradeable
  'teleport crystal': 6102,   // only listed as "Teleport crystal (1)" etc.
};
const HARDCODED_ITEM_ICONS = {
  'spade': 'Spade.png', 'rake': 'Rake.png',
  'digsite pendant': 'Digsite_pendant.png',
  'teleport crystal': 'Teleport_crystal_(1).png',
  // NOTE: 'coins' intentionally absent — use coinIconFor(qty) instead
};
function coinIconFor(qty) {
  if (qty>=10000) return 'Coins_10000.png';
  if (qty>=1000)  return 'Coins_1000.png';
  if (qty>=250)   return 'Coins_250.png';
  if (qty>=100)   return 'Coins_100.png';
  if (qty>=25)    return 'Coins_25.png';
  if (qty>=5)     return 'Coins_5.png';
  return `Coins_${qty}.png`;
}
```

---

## OSRS XP Table (shared across all planners)

```js
const XP_TABLE = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,
2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,
14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,
55649,61512,67983,75127,83014,91721,101333,111945,123660,136594,150872,166636,
184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,
547953,605032,668051,737627,814445,899257,992895,1096278,1210421,1336443,1475581,
1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,
4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,
11805606,13034431];
function xpForLevel(l) { return XP_TABLE[Math.max(1,Math.min(99,l))-1]; }
function levelForXp(xp) { for(let l=99;l>=1;l--) if(xp>=XP_TABLE[l-1]) return l; return 1; }
```

Verified checkpoints: L2=83, L92=6,517,253, L99=13,034,431.

---

## Farming Planner (`osrs-farming-planner.html`)

### Global state flags
```js
let playerLevel=15, playerXp=xpForLevel(15), targetLevelVal=99;
let currentSpeed='expensive';  // 'expensive'|'balanced'|'cheap'|'custom'
let isDark=true;
let herbsEnabledGlobal = true;   // herb toggle — applies across ALL tiers + custom
let usePaymentsGlobal = true;    // pay gardener vs ultracompost only
let useTabsGlobal = true;        // teleport tablets vs runes in inventory mockup
let bankTagCounter = 0;
let bankTagData = {};            // tagId -> {plain, layout} strings
let nameToId={}, nameToIcon={}, prices={}, pricesLoaded=false;
let unlockedExtras = { regularTree:{}, fruitTree:{}, hardwood:{}, herb:{} };
let customState = {
  regularTreeName: null, fruitTreeName: null, hardwoodName: null, herbName: null,
  herbsEnabled: true, treeRunsPerDay: 2, fruitRunsPerDay: 1, herbRunsPerDay: 3,
};
const ULTRACOMPOST_NAME = 'Ultracompost';
const CLEAR_FEE_PER_PATCH = 200;   // coins to clear dead regular/fruit/hardwood patch
const CLEAR_FEE_REDWOOD = 2000;    // coins to clear dead redwood (Alexandra charges more)
const HERB_YIELD_PER_PATCH = 8.7;  // average yield with ultracompost + magic secateurs (Wiki)
const HERB_GROW_MIN = 80;          // herb patches grow in 80 minutes
```

### Tree data — use SAPLING names, not seed names
```js
// seedName field = the SAPLING item (what gets planted), NOT the raw seed.
// Players grow seeds into saplings via plant pot, or buy saplings directly on GE.
const REGULAR_TREES = [
  {level:15, name:'Oak',    plantXp:14,    checkXp:467.3,   growMin:200,
   payItem:'Basket of tomatoes', payQty:1,  seedName:'Oak sapling'},
  {level:30, name:'Willow', plantXp:25,    checkXp:1456.5,  growMin:240,
   payItem:'Basket of apples',   payQty:1,  seedName:'Willow sapling'},
  {level:45, name:'Maple',  plantXp:45,    checkXp:3403.4,  growMin:320,
   payItem:'Basket of oranges',  payQty:1,  seedName:'Maple sapling'},
  {level:60, name:'Yew',    plantXp:81,    checkXp:7069.9,  growMin:365,
   payItem:'Cactus spine',       payQty:10, seedName:'Yew sapling'},
  {level:75, name:'Magic',  plantXp:145.5, checkXp:13768.3, growMin:480,
   payItem:'Coconut',            payQty:25, seedName:'Magic sapling'},
];
// FRUIT_TREES — same structure, seedName = 'Apple sapling', 'Banana sapling', etc.
// HARDWOOD_TREES — Teak sapling, Mahogany sapling
// payItem for hardwoods: Limpwurt root (15× teak), Yanillian hops (25× mahogany)
```

### Route waypoint structure
Each stop in a route array has these fields:
```js
{
  patch: 'Varrock',                          // display name
  teleport: 'Varrock Teleport',              // teleport method name (display)
  teleport2: '(requires X)',                 // optional requirement note
  tabItem: 'Varrock teleport',               // EXACT GE item name for tablet (or null)
  runeItems: [{name:'Law rune',qty:1}, ...], // rune-cast equivalent (or null)
  itemOnly: null,                            // for items with no tab/rune choice
  directions: 'Run north...',               // step text
}
// itemOnly examples: 'Ectophial', 'Digsite pendant', 'Stony basalt', 'Icy basalt',
//                    'Skills necklace', 'Teleport crystal', "Xeric's talisman"
```

`useTabsGlobal` toggles whether `tabItem` or `runeItems` shows in inventory + route guide.
If `itemOnly` is set, always show it regardless of toggle.

### Five route arrays
- `REGULAR_TREE_ROUTE` — 6 stops (Lumbridge, Varrock, Falador, Taverley, Gnome Stronghold, Farming Guild)
- `FRUIT_TREE_ROUTE` — 6 stops
- `HARDWOOD_ROUTE` — 3 stops (Fossil Island via Digsite pendant, Anglers' Retreat, Varlamore)
- `COMBINED_FRUIT_HARDWOOD_ROUTE` — 8 stops geographically chained (avoids doubling back)
- `HERB_ROUTE` — 10 stops

### OSRS inventory mockup system
Pixel-sampled colors from real OSRS screenshot: fill `#3e3529`, border `#4f4836`.

```js
// Saplings are UNSTACKABLE — each takes its own inventory slot
function addUnstackedSlots(name, qty) {
  for (let i=0; i<qty; i++) {
    const key = `${name}#${i}`;  // unique key per unit
    seen.set(key, 1);
    order.push(key);
  }
}
// When rendering, strip the #index suffix:
const name = slotKey.includes('#') ? slotKey.split('#')[0] : slotKey;
const isUnstacked = slotKey.includes('#');
// Unstacked slots never show a quantity badge

// Payment items render as "noted" (parchment CSS overlay):
.inv-slot-noted::before { content:''; position:absolute; inset:3px;
  background:linear-gradient(135deg,#e8d9ad,#d4c389);
  border:1px solid #8a7440; transform:rotate(-3deg); }
```

Always pad to exactly 28 slots (4×7) — the real OSRS inventory is always full.

Stack quantity format (yellow text, black outline):
```js
function fmtStackQty(n) {
  if (n>=10000000) return Math.floor(n/1000000)+'M';
  if (n>=100000)   return Math.floor(n/1000)+'K';
  return n.toLocaleString();
}
```

### Bank tag export (two formats)
```js
// Format 1 — use "Import tag tab" in RuneLite (built-in Bank Tags plugin):
`${tagName},${iconId},${itemIds.join(',')}`
// e.g. "farmrun1,5540,2150,2108,995"

// Format 2 — use "Import tag tab with layout" (Bank Tag Layouts plugin from Plugin Hub):
`banktaglayoutsplugin:${tagName},${itemId}:${slotIndex},...`
// e.g. "banktaglayoutsplugin:farmrun1,2150:0,2108:1,995:2"
// Colon separates itemId:slotIndex within each pair, comma between pairs

bankTagData[tagId] = { plain: plainTagString, layout: layoutTagString };
// Button uses data-bank-tag-type="plain"|"layout" to select which string to copy
```

---

## Herblore Planner (`osrs-herblore-planner.html`)

### Four named routes (not just speed tiers)
```
nuclear   — max XP/hr: Attack→Prayer→Super att→Super energy→Super str→
            Super restore→Sara brew 81→Ancient brew 85→Menaphite remedy 88→99
standard  — what most players do: Attack→Prayer→Super restore→Sara brew 81→Super combat 90
midroad   — Theoatrix "cheap & fast": Attack→Energy→Prayer→Super restore→
            Ranging potion 72→Stamina 81→Super combat 90
budget    — herb cleaning→Prayer→Super restore→Extended antifire 84→Super combat 90
```

Plus a 5th special tab: **⚗️ Mastering Mixology** — renders via `renderMixologyPlan()` instead of `generatePlan()`.

### Verified XP per potion (all from OSRS Wiki)
```
Attack: 25          Prayer: 87.5        Super attack: 100     Super energy: 117.5
Super strength: 125  Super restore: 142.5  Saradomin brew: 180  Ancient brew: 190
Menaphite remedy: 200  (level 88, dwarf weed unf + lily of the sands)
Extended antifire: 110  Stamina: 102  Ranging: 162.5  Super combat: 150
```

### Verified actions per hour (from OSRS Wiki XP/hr column)
```
Standard 14+14 inventory:         2,500/hr
Stackable secondary (stamina,      2,750/hr
  extended antifire — 27+27 inv):
Super combat (7 per inventory,     2,166/hr ← NOT 2,400. Confirmed via Wiki XP/hr column
  Torstol NOT stackable):                      showing 324,900 xp/hr ÷ 150 xp = 2,166
Herb cleaning:                     5,000/hr
```

### Input names with per-ingredient quantities
```js
// Support both plain string and {name, qty} object:
inputNames: ['Toadflax potion (unf)', 'Crushed nest']           // 1 each
inputNames: ['Antifire potion(4)', {name:'Lava scale shard', qty:4}]  // 4 shards
inputNames: ['Super energy(3)',    {name:'Amylase crystal',   qty:4}]  // 4 crystals

// Cost formula handles both:
const inCost = (method.inputNames||[]).reduce((sum,n) => {
  const itemName = typeof n === 'string' ? n : n.name;
  const qty      = typeof n === 'object' && n.qty ? n.qty : 1;
  return sum + (priceOf(itemName)||0) * qty;
}, 0);
```

### Cost display — always show BOTH numbers
```
Upfront Capital = gross ingredient cost (what you need in bank before starting)
Net Cost        = upfront - sell credit after GE tax (what you actually spend)
```
For routes like Standard 81→99, upfront is ~750M but net is only ~42M because super combat ingredients cost ~620M but the finished potions sell for ~610M. Always show both or players will be confused.

### Super combat special notes
- Torstol is NOT stackable — each takes its own inventory slot
- Inventory: 7× super attack(4) + 7× super strength(4) + 7× super defence(4) + 7× Torstol = 28 slots
- Output: Super combat potion(4) (not 3-dose — inputs are 4-dose, output is 4-dose)
- 2,166/hr confirmed from Wiki

### Mastering Mixology
Completely separate rendering path — triggered when `currentSpeed === 'mixology'`:
```js
if (currentSpeed === 'mixology') {
  planArea.innerHTML = renderMixologyPlan(curLevel, targetLevelVal);
  // Wire toggles IMMEDIATELY here — can't rely on bottom-of-function wiring:
  ['potionTable','rewards'].forEach(id => {
    const btn = document.getElementById(id+'Toggle');
    if (btn) btn.addEventListener('click', () => {
      document.getElementById(id+'Body').classList.toggle('show');
      document.getElementById(id+'Arrow').classList.toggle('open');
    });
  });
  return;  // ← early return skips all standard potion route code
}
```

Key mixology data (all from OSRS Wiki):
```js
// Paste yields per herb — exact wiki values:
Mox: Guam→10, Marrentill→13, Tarromin→15, Harralander→20
Aga: Irit→30, Cadantine→34, Lantadyme→40, Dwarf weed→42, Torstol→44
Lye: Avantoe→30, Kwuarm→33, Toadflax→32, Snapdragon→40

// Cheapest per paste type (wiki cached prices):
Mox: Marrentill (~18.92 gp/paste)
Aga: Lantadyme (~41.38 gp/paste)
Lye: Avantoe (~55.70 gp/paste)

// XP rates (wiki confirmed):
Active play at 81+:  70,000 xp/hr
Passive play at 81+: 45,000 xp/hr
Paste consumed at 81+: ~2,000 of each type per hour (active)
GP/XP: ~3 gp/xp (cheapest method in the game at high levels)

// Level gates:
60 — minimum to enter (requires Children of the Sun quest)
81 — unlocks Mixalot (1×Mox + 1×Aga + 1×Lye, 365+122=487 XP — best XP per paste)

// Important mechanic: Digweed spawns ~every 7 min at 81+
// Always add to a Mixalot order — doubles XP and resin for that potion
```

All 10 potion recipes with exact XP (mixing + processing):
```
Alco-Augmentator (AAA) lvl60  190+63=253  3×Aga
Mammoth-Might Mix (MMM) lvl60  190+63=253  3×Mox
Liplack Liquor (LLL)    lvl60  190+63=253  3×Lye
Mystic Mana Amalgam(MMA)lvl63  215+72=287  2×Mox+1×Aga
Marley's Moonlight (MML)lvl66  240+80=320  2×Mox+1×Lye
Azure Aura Mix (AAM)    lvl69  265+88=353  2×Aga+1×Mox
Aqualux Amalgam (ALA)   lvl72  290+96=386  1×Aga+1×Lye+1×Aga
Megalite Liquid (MLL)   lvl75  315+105=420 1×Mox+2×Lye
Anti-Leech Lotion (ALL) lvl78  340+113=453 1×Aga+2×Lye
Mixalot (MAL) ★best★    lvl81  365+122=487 1×Mox+1×Aga+1×Lye
```

---

## Known Backlog / Remaining Issues

1. **Bank tag formats need real-world testing** — plain format confirmed working for "Import tag tab", layout format (banktaglayoutsplugin:) not yet confirmed working in-game.

2. **Farming planner — some icons still show text fallback** — items like `Skills necklace` may not resolve from the GE mapping if the name isn't an exact match.

3. **Herblore — Menaphite remedy** — added in 2025 update, requires Dwarf weed potion (unf) + Lily of the sands. Verify exact GE item names haven't changed.

4. **Farming planner cost calculations** in the tier-based plan (Expensive/Balanced/Cheap) are rougher than Custom mode — they don't use the same live protectionCost() helper that Custom mode does.

5. **Smithing and Fletching** — stubbed as "Soon" in sidebar navs of all planners.

6. **No backend proxy for hiscores** — can't look up player level automatically because Jagex's hiscores API lacks CORS headers. Would need a proxy server to add this.

---

## Navigation Between Pages

All pages share the same header nav pattern. Each page links to the others:
```html
<a class="nav-back" href="osrs-ge-tracker.html">GE Tracker</a>
<a class="nav-back" href="osrs-skill-profit.html">⚗️ Skill Profits</a>
<a class="nav-back" href="osrs-training-planner.html">🏗️ Construction</a>
<a class="nav-back" href="osrs-farming-planner.html">🌱 Farming</a>
<a class="nav-back" href="osrs-herblore-planner.html">⚗️ Herblore</a>
```

Sidebar nav in planners also links all skill pages. Herblore is now active/live, not "Soon".

---

## George's Preferences & Context

- Dark UI by default, light mode toggle on every page
- Wants accurate data over impressive demos — always verify XP values against OSRS Wiki
- All prices live from `prices.runescape.wiki` (not Jagex's API, not hardcoded)
- Medical transport driver; OSRS player with deep PvM and GE knowledge
- Already knows about the `String(i.id)` bug and the User-Agent CORS issue — don't re-introduce either
- Prefers the dev team framing: 🔴 Rex (lead dev), 🔵 Dex (QA), 🟡 Vex (creative), 🟢 Hex (product)
