# REVIEW.md

## Review objective

Optimize for merge readiness with minimum additional scope.

## Review severity

### P0

Must fix before merge.

Use only for:
- Build failure.
- Broken primary flow.
- Data loss risk.
- Route or load failure.
- Severe mobile usability blocker.
- Safety or trust regression.

### P1

Should fix in this PR.

Use for:
- Confusing mobile UX.
- Incomplete QA evidence.
- i18n inconsistency.
- Accessibility issue on a primary action.
- Edge case likely to affect normal users.

### P2

Backlog only. Do not block merge.

## Review behavior

- Prefer high-confidence findings.
- Avoid subjective style comments.
- Avoid broad rewrites.
- Avoid duplicate findings.
- If another reviewer already flagged the issue, do not repeat it unless adding new evidence.
- Every P0/P1 finding must include file, behavior, risk, and acceptance criterion.

## Post-merge cleanup readiness

For workflow-only PRs, reviewers may check:
- The branch can be deleted after merge.
- No open follow-up work depends on the branch.
- GitHub's auto-delete head branches setting is expected to handle remote cleanup when enabled.

Do not block merge only because branch cleanup is a manual checklist item.

## Final output

Use this format:

```text
Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
```

