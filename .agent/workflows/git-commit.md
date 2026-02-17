---
description: Git commit strategy — atomic commits with Conventional Commits format
---

# Git Commit Workflow

## Commit Format

Use **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body — what & why, not how]
```

### Types

| Type | When to use | Example |
|---|---|---|
| `feat` | New feature or functionality | `feat(auth): add Magic Link login screen` |
| `fix` | Bug fix | `fix(projects): handle empty project name validation` |
| `refactor` | Code restructure, no behavior change | `refactor(api): extract shared error handler` |
| `style` | UI/CSS changes only | `style(login): adjust button padding and colors` |
| `chore` | Config, deps, tooling, build | `chore: add @supabase/ssr dependency` |
| `docs` | Documentation only | `docs: update BRAINSTORMING.md with Timeline View` |
| `test` | Adding or fixing tests | `test(projects): add CRUD integration tests` |
| `perf` | Performance improvement | `perf(timer): debounce timer state updates` |

### Scopes (for Tasktik)

Use the feature area as scope: `auth`, `projects`, `tasks`, `timer`, `kanban`, `timeline`, `planner`, `dashboard`, `ui`, `db`, `config`

## Commit Granularity Rules

// turbo-all

### 1. One logical change = one commit
- ✅ `feat(projects): add project create screen` (one screen)
- ❌ `feat: add all project screens and API` (too big)

### 2. Separate concerns
- Schema migration → separate commit
- API functions → separate commit  
- UI screen → separate commit
- Route wiring → can bundle with its screen

### 3. When to commit
Commit after each of these:
- A new file or component is created and working
- A bug is fixed
- A dependency is added
- A config file is changed
- A migration is applied
- A refactor is complete
- A lint/type error is fixed

### 4. Commit flow

```bash
# Stage specific files (preferred over git add -A)
git add <specific files>

# Commit with conventional format
git commit -m "type(scope): description"

# Push after a logical group of commits (e.g. after completing a Step)
git push
```

### 5. Example commit sequence for a new feature

```
chore(db): add sections table migration
feat(api): add sections CRUD functions  
feat(sections): add section list component
feat(sections): add section create form
feat(projects): integrate sections into project detail
fix(sections): handle empty section name edge case
```

## Push Strategy

- **Push after completing a Step** (e.g., after Step 3: Auth is done)
- **Push before switching context** (e.g., before taking a break)
- **Push after fixing critical bugs**
- Don't push every single commit — batch pushes for efficiency

## Branch Strategy (current)

- `main` — primary development branch
- Future: `feature/*` branches when features get complex
