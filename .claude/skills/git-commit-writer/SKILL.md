---
name: git-commit-writer
description: Analyze staged/unstaged git changes and generate a concise, accurate one-line commit message.
user-invocable: true
argument-hint: [optional: scope or extra context]
---

# Git Commit Writer

Generate a clear, concise **one-line** commit message based on the actual code changes.

## Steps

1. Run `git status` to see what files have changed
2. Run `git diff --staged` to see staged changes. If nothing is staged, run `git diff` for unstaged changes instead
3. Analyze the changes to understand **what** was changed and **why**
4. Generate a one-line commit message following the rules below

## Commit Message Rules

### Format

```
<type>: <short description>
```

### Types

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature or capability                        |
| `fix`      | Bug fix                                          |
| `refactor` | Code restructure without behavior change         |
| `style`    | Formatting, whitespace, semicolons (no logic)    |
| `docs`     | Documentation only                               |
| `test`     | Adding or updating tests                         |
| `chore`    | Build, config, deps, tooling                     |
| `perf`     | Performance improvement                          |

### Guidelines

- **One line only** — no body, no footer
- **Max 72 characters** total
- **Lowercase** — do not capitalize the first word after the colon
- **No period** at the end
- **Imperative mood** — "add", "fix", "remove", not "added", "fixes", "removed"
- **Be specific** — describe what actually changed, not vague summaries
- **Match the diff** — the message must accurately reflect the code changes, not guess or generalize

### Good examples

```
feat: add user export to Excel
fix: prevent duplicate login on token refresh
refactor: extract pagination logic into shared util
chore: update prisma to v6.5
test: add unit tests for department service
style: fix indentation in auth middleware
perf: cache department list query
feat: add bulk import validation for user upload
fix: handle null section in user filter query
```

### Bad examples (avoid these)

```
update code                    # too vague
fix stuff                      # meaningless
feat: Add User Export Feature  # capitalized, too wordy
fix: fixed the bug.            # past tense, has period
refactor                       # no description
WIP                            # not a commit message
```

## Output

Present the suggested commit message in a code block so the user can easily copy it. If the changes span multiple concerns, suggest 2-3 options ranked by best fit.

If `$ARGUMENTS` is provided, use it as additional context (e.g., scope, ticket number) to refine the message.
