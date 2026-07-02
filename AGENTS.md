# AGENTS.md

## Post-merge cleanup

Markdown files are instructions and checklists only. They do not automate branch cleanup by themselves.

Best low-HBC setup:
- Enable GitHub's built-in setting: "Automatically delete head branches after pull requests are merged."
- Treat that GitHub setting as the preferred remote branch cleanup path.

After a PR is merged:
- Confirm the PR is merged into `main`.
- Confirm no open follow-up work depends on the branch.
- Delete the remote branch, or verify GitHub auto-deleted it.
- Delete any temporary local branch or worktree if it exists.
- Do not touch unrelated local edits.

