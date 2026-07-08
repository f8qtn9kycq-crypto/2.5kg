## Scope

What changed:

## User impact

What user problem this addresses:

## Workflow contract

- [ ] Read `AGENTS.md`
- [ ] Read `.github/ai-automation.yml`
- [ ] Read `README.md` and `DATA-STRUCTURE.md` when product, data, or deployment behavior is touched
- [ ] Kept changes minimal and localized
- [ ] Did not rewrite unrelated app areas

## Risk tier

- [ ] Tier 0: docs / templates / workflow instructions only
- [ ] Tier 1: copy / low-risk CSS / non-safety UI polish
- [ ] Tier 2: localStorage / tab flow / onboarding / recommendation behavior / deployment routing
- [ ] Tier 3: safety rules / medical positioning / data migration / security / privacy

## Safety and health-positioning impact

- [ ] No safety or medical-positioning logic changed
- [ ] Safety or medical-positioning changed and QA/review updated
- [ ] Pain and warning flags still adjust recommendations conservatively
- [ ] Active Aging defaults still avoid high-impact recommendations
- [ ] No diagnosis, cure, medical certainty, or extreme-diet claims introduced

## QA evidence

- [ ] No build step required
- [ ] `index.html` loads when runtime files changed
- [ ] Key tabs and primary CTAs checked when runtime files changed
- [ ] Mobile layout checked at 320px / 375px when UI changed
- [ ] localStorage compatibility considered when data/state changed
- [ ] GitHub Pages deployment path considered

## AI review routing

- [ ] Codex review needed
- [ ] Claude review needed only for Tier 2+ or conflicting findings
- [ ] ChatGPT PM synthesis needed only if findings conflict or PR is high-risk

## Merge readiness

- [ ] No P0
- [ ] P1 either fixed or explicitly deferred
- [ ] Acceptance criteria met
- [ ] Explicit human merge approval retained

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch
