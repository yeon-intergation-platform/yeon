# AGENTS.md — Yeon Agent Onboarding

This file is the project-level onboarding contract for coding agents in Yeon. Keep it short and broadly applicable. Detailed procedures belong in `docs/`, `.codex/skills/`, or local `README.md` files and should be loaded only when relevant.

## Why this repository exists

Yeon is a private product monorepo for education/workspace services, mobile experiences, and realtime typing-race features. Agents should optimize for small, verified changes that preserve ownership boundaries and can be shipped safely to production.

## What is where

- `apps/web/` — Next.js App Router web app; web UI, route handlers, server actions, server orchestration, persistence integration.
- `apps/mobile/` — Expo app; native UI, mobile state, public API consumption, device integrations.
- `apps/race-server/` — Colyseus realtime typing-race server.
- `packages/api-contract/` — shared Zod schemas, DTOs, request/response contracts; importable by web and mobile.
- `packages/api-client/` — typed public HTTP API client; depends on contracts, not app internals.
- `packages/domain/` — pure domain logic only; no DB, HTTP, framework runtime, session, or UI code.
- `packages/race-shared/` and `packages/typing-race-engine/` — shared typing-race logic and engine code.
- `packages/design-tokens/` — cross-platform visual tokens only, not React components.
- `packages/config/` and `packages/utils/` — shared tooling config and pure helpers.
- `docs/` — official reusable team knowledge.
- `ai-log/` — process notes for AI collaboration; promote settled decisions into `docs/`.

Read the closest `README.md` before editing an app/package.

## Progressive disclosure pointers

Load only the context needed for the current task:

- Product/domain/architecture/DB rules: `.codex/skills/SHARED/yeon-project-context/SKILL.md`, then linked source docs.
- Git, PR, and main-only shipping: `.codex/skills/SHARED/git-pr-workflow/SKILL.md`, `.codex/skills/SHARED/ship/SKILL.md`, or `.codex/skills/SHARED/deploy-all/SKILL.md`.
- Validation: `.codex/skills/SHARED/validate/SKILL.md` or `.codex/skills/verify/SKILL.md`.
- Next.js, Expo, and monorepo boundaries: `nextjs-patterns`, `expo-patterns`, `monorepo-patterns` skills.
- UI/design work: `design-workflow`, `design-eye`, `frontend-design`, or `ui-ux-pro-max` skills.
- Cleanup/refactor/review: `ai-slop-cleaner`, `refactor-repo`, `self-improve-checklist`, or `code-review` skills.
- Documentation placement: `docs/README.md`; architecture docs: `docs/architecture/`; deployment docs: `docs/deployment/`.

Prefer pointers to copies. Do not paste long policies, command catalogs, or code snippets into this file.

## High-priority project policy

- `develop` is temporarily suspended. Default base branch, PR target, and deployment path are `main` / `origin/main`.
- Do not create, rebase onto, merge into, deploy from, or open PRs against `develop` unless the user explicitly reactivates it.
- Direct pushes to `main` are forbidden unless explicitly requested and allowed; use branch → commit → push → PR(main) → merge.
- If code or repo files are changed, default to completing commit → push → PR(main) → merge after verification unless the user explicitly asks to stop earlier.
- Multiple agents may be active. Do not overwrite unrelated human/agent changes; stage only owned paths and avoid `git add .`.

## How agents should work here

Before modifying files:

1. Inspect work state with `git status --short --branch`.
2. Check `ai-log/hyeonjun/<today>/` and relevant unfinished prior logs.
3. Create or update a work log under `ai-log/{person}/YYYY-MM-DD/` for development work.

Implementation defaults:

- Use `pnpm`; workspace shape is `apps/*` and `packages/*` from `pnpm-workspace.yaml`.
- Check actual scripts in root and workspace `package.json` before running commands.
- Reuse existing feature slices, services, repositories, contracts, and shared packages before adding new structure.
- Do not add dependencies unless the task clearly requires it and the justification is documented.
- Keep diffs small, reversible, and owned by the package/app responsible for the behavior.
- Use deterministic tools for style and formatting; do not turn this file into a style guide.
- Do not recreate `personal_space/`; use root `docs/` for official docs and root `ai-log/` for process logs.

## Verification

Verify before claiming completion. Choose the smallest checks that prove the change, then broaden when risk warrants it.

- Code changes: run relevant lint, typecheck, build, and tests based on the owning workspace scripts.
- Web app changes: include `pnpm --filter @yeon/web build` when the change can affect production build behavior.
- Schema changes: load `yeon-project-context` DB/migration guidance before editing and run drift checks afterward.
- Docs/rules/skills-only changes: at minimum run:
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`

If a check cannot run, report the exact command and reason. Final reports should name changed files, verification evidence, and remaining risks.

## Source-of-truth hygiene

- Project rules live here; `CLAUDE.md` is only a pointer for Claude CLI.
- Global shared rules live in `~/.codex/AGENTS.md`; this file contains only Yeon-specific overrides.
- Stable product/architecture/deployment knowledge belongs in `docs/` or the appropriate skill source, not in chat-only memory.
