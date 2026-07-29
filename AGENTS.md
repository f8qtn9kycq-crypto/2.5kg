# AGENTS.md

## Mandatory workflow bootstrap

For every ChatGPT, Codex, Claude, Gemini, or other AI-assisted task in this repo:

1. Read this file first.
2. Read `.github/pull_request_template.md` before opening or updating a PR.
3. Read `.github/ai-automation.yml` before scheduled automation, issue selection, PR gating, or any GitHub mutation.
4. Read `README.md` and `DATA-STRUCTURE.md` for product, deployment, and data boundaries.
5. Treat repo-tracked workflow files as the source of truth over pasted chat context when they conflict.
6. Classify the task risk tier before implementation:
   - Tier 0: docs / templates / workflow instructions only
   - Tier 1: copy / low-risk CSS / non-safety UI polish
   - Tier 2: localStorage / tab flow / onboarding / recommendation behavior / deployment routing
   - Tier 3: safety rules / medical positioning / data migration / security / privacy
7. Keep the change scoped to the selected risk tier.
8. If the requested work is broad, split it into the smallest safe PR.
9. Do not rely on memory alone for workflow, safety, data, or deployment requirements.

## Product context

This is a static GitHub Pages web app for sustainable 60-day lifestyle weight loss.

Primary product boundaries:
- Vanilla HTML / CSS / JavaScript in `index.html`.
- No framework, backend, paid API, or build step by default.
- Data is local-only in the user's browser via localStorage.
- Product advice is general lifestyle support, not medical diagnosis or treatment.
- Active Aging defaults should avoid high-impact, unsafe, or ambiguous exercise recommendations.

## Safety and health-positioning rules

- Do not introduce diagnosis, cure, medical certainty, or disease-treatment claims.
- Do not promote extreme dieting, aggressive calorie restriction, or heavy tracking burden.
- Preserve conservative handling of pain flags and warning flags.
- Preserve Active Aging safety defaults.
- If a user has chest tightness, dizziness, acute pain, chronic disease, post-op status, or uncertainty about exercise safety, the app should direct them to a physician, physical therapist, or qualified professional.

## Engineering rules

- Keep changes minimal and localized.
- Do not broadly rewrite `index.html` unless explicitly requested.
- Preserve existing localStorage keys and compatibility.
- Preserve GitHub Pages root deployment behavior.
- Preserve mobile-first layout and safe-area behavior.
- Prefer explicit QA evidence for changed runtime behavior.

## Validation defaults

This repo currently has no build step. For docs-only changes:
- confirm no runtime behavior changed.
- confirm `index.html` was not changed.
- confirm GitHub Pages deployment behavior was not changed.

For runtime HTML/CSS/JS changes:
- preview locally when possible with `python3 -m http.server 5177`.
- verify `index.html` loads.
- verify key tabs and primary CTAs work.
- verify mobile layout at 320px and 375px when UI changes.
- verify localStorage compatibility using README.md and DATA-STRUCTURE.md.

## AI execution rules

Scheduled automation runners must:
- read `.github/ai-automation.yml` before selecting issues, gating PRs, or mutating GitHub.
- verify the local git remote, queried GitHub repo, and repo-tracked instructions match this repository.
- stop with `repo-mismatch blocker` before mutation when identity or product instructions do not match.
- execute at most one issue/PR unit of work per scheduled run.

Codex must:
- sync from latest `main` before creating an implementation branch.
- create a branch for changes instead of committing directly to `main`.
- keep PRs small and reviewable.
- fill the PR template with concrete QA evidence.
- avoid changing safety, medical positioning, localStorage, or deployment behavior unless the selected issue explicitly asks for it.
- never merge automatically; this repo keeps an explicit human merge gate.

## P0 blockers

Flag as P0 only when:
- app fails to load.
- primary tab or CTA flow is broken.
- existing localStorage data may be lost.
- GitHub Pages deployment path breaks.
- pain or warning safety behavior is weakened.
- medical, diagnosis, cure, or extreme-diet claims are introduced.

## P1 improvements

Flag as P1 when:
- mobile navigation is confusing.
- important controls are hidden on mobile.
- user-facing copy is too dense.
- i18n is mixed or broken.
- primary controls lack accessibility labels.
- changed behavior lacks reasonable QA evidence.

## Output contract

Return:
1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

Do not include P2 wishlist items unless explicitly requested.
Do not suggest broad rewrites.
