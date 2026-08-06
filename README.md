# OSRS Toolbox — Shared Project Status

This is the first file Claude Code and Codex must read before making changes. It is the living handoff for switching assistants, including when George continues from mobile.

Last updated: 2026-08-05 by Codex
Repository: https://github.com/georgeparamore/osrs-planner-suite.git  
Live site: https://georgeparamore.github.io/osrs-planner-suite/  
Production baseline: `main` at or after merge commit `618cc03`

## Required startup protocol

1. Read this file completely.
2. Read the current assignment file completely.
3. Inspect `git status`, the active branch, and recent commits.
4. Start from updated `main` unless the assignment names another branch.
5. Preserve unrelated work and never use destructive cleanup.

## Current assignments

### Claude Code — Cooking planner

Read `CLAUDE_COOKING_HANDOFF_2026-08-05.md` completely and implement it on a new feature branch. Open a PR against `main` and do not merge it. George and Codex will review it.

### Codex — Fletching planner

Implementation is complete on `codex/fletching-planner` for review. It includes six routes, live prices, exact quantities, Wise Old Man lookup, owned-item controls, and both level and combined-reward planning for Vale Totems. The research and implementation plan is `CODEX_FLETCHING_PLAN_2026-08-05.md`. Reconcile the shared navigation with Claude’s Cooking PR before merging both branches.

## Current production state

PR #5 was merged on 2026-08-05. The public suite includes:

- Landing page and player lookup branded **OSRS Toolbox**
- GE Tracker
- Skill Profit Calculator
- Construction Planner
- Farming Planner
- Herblore Planner, including Mastering Mixology goals and owned-upgrade estimates
- Prayer Planner
- Crafting Planner
- Smithing Planner, including Blast Furnace and Giants’ Foundry modes

Important current behavior:

- Crafting, Herblore, and Smithing use the focused shared layout and are the reference for new planners.
- One `osrs-suite-theme` preference persists across all pages.
- Planners support Level / Exact XP and Wise Old Man lookup.
- Live-value routes compare net GP/XP and must reject missing prices.
- Counts and shopping quantities are full integers.
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
