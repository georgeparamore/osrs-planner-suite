# OSRS Planner Suite — Shared Project Status

This is the first file both **Claude Code and Codex must read before making changes**. It is the living handoff for switching agents, including when George continues from mobile.

Last updated: 2026-08-05 by Codex  
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Active branch: `main`

## Agent handoff protocol

Before coding:

1. Read this file completely.
2. Read the newest dated handoff named `CLAUDE_HANDOFF_YYYY-MM-DD.md`.
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

**Owner:** Claude Code (next)  
**Status:** Ready to begin  
**Assignment:** Build a focused Crafting Training Planner.

Full build specification and today’s history:

- `CLAUDE_HANDOFF_2026-08-05.md`

Expected first implementation steps:

1. Create `osrs-crafting-planner.html` using the focused Herblore planner as the UI/architecture reference.
2. Add Crafting to `suite-nav.js` and the landing-page tool grid.
3. Implement verified Crafting method data and live-price calculations.
4. Implement Fastest, Simple, Cheapest, and Low Attention routes.
5. Add Members/F2P, costume needle, output handling, and requirement controls.
6. Verify locally, publish, watch GitHub Pages, and verify publicly.

## Current production state

Last deployed feature commit before these documentation files: `385eaa2` — landing-page theme toggle.

The public suite currently includes:

- Landing page/player lookup
- GE Tracker
- Skill Profit Calculator
- Construction Planner
- Farming Planner
- Herblore Planner
- Prayer Planner

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
