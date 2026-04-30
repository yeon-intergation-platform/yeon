# AGENTS.md — Yeon Project Override

<project_agent_contract scope="/home/osuma/coding_stuffs/yeon" format="xml+markdown" version="2026-04-30">

<purpose>

This file is the **thin project override** for Yeon. The global baseline is `~/.codex/AGENTS.md`; this file only contains high-frequency project rules. Detailed product, architecture, validation, UI, DB, review, and release procedures live in skills and must be loaded selectively.

</purpose>

<main_only_policy status="develop-suspended">

## Branch and deployment policy

- `develop` is **temporarily suspended**.
- Default base branch: `origin/main`.
- Default PR target: `main`.
- Default deployment target: production `yeon.world` via `main` workflow.
- Do **not** create, rebase onto, merge into, deploy from, or open PRs against `develop` unless the user explicitly says to reactivate or use `develop`.
- If an older skill or document says `origin/develop`, treat it as stale for this repository and follow this main-only policy.
- Direct pushes to `main` remain forbidden unless explicitly requested; use branch → commit → push → PR → merge.
- **항상 main 머지 완료까지 진행한다.** 코드를 수정했으면 기본 동작은 _commit → push → PR(main) → merge_ 까지 한 번에 마무리한다. 사용자가 명시적으로 “커밋만/푸시만/PR만”을 지시하지 않는 한 변경을 미머지 상태로 남기지 않는다. 검증(lint/typecheck/build)은 머지 전에 PASS 되어야 하며, 실패하면 머지 대신 수정 후 재검증한다.

</main_only_policy>

<startup_protocol>

- Read order:
  1. `~/.codex/AGENTS.md`
  2. this `AGENTS.md`
  3. `AGENTS.local.md` if present
  4. `CLAUDE.md` / `CLAUDE.local.md` only for pointer or environment notes
  5. relevant skills only
- Before modifying files, check current work state:
  - `git status --short --branch`
  - `ls ai-log/hyeonjun/<today>/` (or the active author directory) and previous-day unfinished logs when relevant
- For development work, create or update a work log under `ai-log/{person}/YYYY-MM-DD/`.

</startup_protocol>

<work_log_policy>

- New work logs go under `ai-log/{person}/YYYY-MM-DD/`.
- Working filename: `N-작업-{claude|codex}_{시작HHMM}-{예상종료HHMM}_{주제}_[작업중].md`.
- Completion filename: replace end time with actual time and suffix with `_[완료].md`; also update the internal actual end/status fields.
- Do not recreate `personal_space/`; use root `docs/` for official documents and root `ai-log/` for process logs.

</work_log_policy>

<skill_loading_map>

## Load these details only when needed

- Product/domain/architecture/implementation rules: `yeon-project-context`.
- Git, PR, and main-only shipping: `git-pr-workflow`, `ship`, `deploy-all`.
- Validation pipeline: `validate`, `verify`.
- Next.js/App Router: `nextjs-patterns`.
- Expo/mobile: `expo-patterns`.
- Monorepo boundaries: `monorepo-patterns`.
- UI/design work: `design-workflow`, `design-eye`, `ui-ux-pro-max`, `frontend-design`.
- Code review: `code-review`.
- Cleanup/refactor/deslop: `ai-slop-cleaner`, `refactor-repo`, `self-improve-checklist`.
- Skill inventory/routing: `.codex/skills/README.md`.

</skill_loading_map>

<repository_baseline>

- Monorepo uses pnpm workspaces.
- Main app: `apps/web` (Next.js App Router).
- Mobile app: `apps/mobile` (Expo).
- Shared packages: `packages/*`.
- Public production domain: `yeon.world`.
- Development domain `dev.yeon.world` exists historically but is not the active default while `develop` is suspended.
- Do not add dependencies without explicit need and clear justification.
- Prefer existing utilities, contracts, and patterns before adding abstractions.

</repository_baseline>

<verification_baseline>

- Check actual scripts in `package.json` and workspace `package.json` before running commands.
- For app code changes, expected order is: lint/format/typecheck/build/tests as applicable.
- For docs/config/governance-only changes, run at minimum:
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`
- For schema changes, load `yeon-project-context` and follow DB migration rules before editing.

</verification_baseline>

<collaboration_safety>

- Multiple agents may be working. Stage only owned paths; avoid `git add .`.
- Do not revert unrelated modifications.
- If another agent touches the same file, resolve the smallest semantic conflict instead of overwriting.
- Keep diffs small enough to review; move low-frequency details into skills rather than expanding this file.

</collaboration_safety>

</project_agent_contract>
