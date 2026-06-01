# AGENTS.md — Yeon Agent Onboarding

This file is the project-level onboarding contract for coding agents in Yeon. Keep it short and broadly applicable. Detailed procedures belong in `docs/`, `.codex/skills/`, or local `README.md` files and should be loaded only when relevant.

## Why this repository exists

Yeon is a private product monorepo for education/workspace services, mobile experiences, and realtime typing-race features. Agents should optimize for small, verified changes that preserve ownership boundaries and can be shipped safely to production.

## What is where

- `apps/web/` — Next.js App Router web app; web UI, route handlers, server actions, and temporary migration/BFF adapters. Do not add new backend ownership here.
- `apps/backend/` — Spring backend. New backend business logic, persistence ownership, API behavior, auth/session mutations, and domain writes belong here by default.
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

Service context for `omx team` / multi-agent kickoff:

- Load only the service context skill(s) relevant to the assigned lane. If a task crosses services, load every touched service context.
- `typing-race` — 기능이 먼저 보이는 흰 배경의 미니멀 레이스 UI + 작은 픽셀 게임 감성: `.codex/skills/SHARED/service-context-typing-race/SKILL.md`
- `counseling-workspace` — 상담 원문 신뢰와 수강생 우선순위가 먼저 보이는 업무형 AI 학생관리 CRM: `.codex/skills/SHARED/service-context-counseling-workspace/SKILL.md`
- `card-decks` — 덱 생성·카드 편집·학습 진입이 먼저 보이는 흰 배경 생산성 UI(기존 근거 제한): `.codex/skills/SHARED/service-context-card-decks/SKILL.md`
- `auth-credential` — 계정 연결·검증·복구 상태가 분명한 신뢰 중심 인증 플로우(기존 근거 제한): `.codex/skills/SHARED/service-context-auth-credential/SKILL.md`
- `contest` — 교강사용 AI 학생관리 CRM의 문제·기능·효과를 정리하는 문서/서사 중심 컨텍스트: `.codex/skills/SHARED/service-context-contest/SKILL.md`

Prefer pointers to copies. Do not paste long policies, command catalogs, or code snippets into this file.

## High-priority project policy

- `develop` is temporarily suspended. Default base branch, PR target, and deployment path are `main` / `origin/main`.
- Do not create, rebase onto, merge into, deploy from, or open PRs against `develop` unless the user explicitly reactivates it.
- Direct pushes to `main` are forbidden unless explicitly requested and allowed; use branch → commit → push → PR(main) → merge.
- **작업하고 나면 즉시 main에 배포한다. 이는 언제나 반드시 지킨다.** 코드 또는 저장소 파일이 변경되면 예외 없이 commit → push → PR(main) → merge를 완료한다.
- **Next.js는 신규 백엔드 역할을 맡지 않는다. 백엔드 역할은 Spring(`apps/backend`)만 담당한다.** `apps/web`의 API route/server code는 기존 호환, 인증 쿠키 브리지, 외부 API 프록시, Spring 호출 BFF처럼 명시된 전환 역할만 허용한다. 신규 DB 스키마, 비즈니스 규칙, 도메인 쓰기 로직, 권한 판정, 장기 상태 원천은 Spring에 구현한다.
- Multiple agents may be active. Do not overwrite unrelated human/agent changes; stage only owned paths and avoid `git add .`.
- **유지보수 대상 서비스는 카드(`card-service`)·타자(`typing-service`)·커뮤니티(`community`) 3종뿐이다.** 상담 워크스페이스(`counseling-workspace` — 상담 기록·스페이스·수강생/학생관리·시트 연동 등 CRM 전반)는 **유지보수하지 않는다(동결)**: 신규 기능, 버그 수정, 리팩토링, 테스트 추가, 품질 게이트 확장의 대상이 아니다. 사용자의 명시적 지시가 없는 한 해당 코드/스키마/문서는 변경하지 않고 그대로 둔다. 추적성/커버리지/Karate 등 품질 도구의 범위도 위 3종 서비스에 한정한다.

## How agents should work here

- 로컬 디버깅/수정 세션에서 사용자가 PR 생성·merge 금지를 명시하면, 해당 세션은 로컬 환경에서 수정 → Playwright 직접 확인 → 검증 통과 후 로컬 commit까지만 진행한다. 이 경우 PR 생성, push, merge, 배포는 하지 않으며 마지막 확인은 사용자가 로컬에서 수행한다.
- 멀티 워크트리 운영 규칙(요청 반영):
  - 기본 개발은 `yeon-2`, `yeon-3`, `yeon-4` 3개 워크트리를 사용한다.
  - `yeon` 워크트리는 작업용이 아니라 로컬 환경 확인/검증용으로 유지한다.
  - 요청이 올 때마다 3개 작업 워크트리를 순환 사용하고, 동일 브랜치 동시 충돌을 피하기 위해 `yeon-2/3/4` 이외 새 임시 워크트리 생성은 기본적으로 하지 않는다.
  - `yeon`의 `main`은 필요 시점마다 원격 `origin/main` 기준으로 최신화한다.
  - `yeon` 기준의 모바일/웹 `.env` 및 `.env.example`는 작업 워크트리들과 동일 값을 공유한다.

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

- Code changes: run relevant lint and typecheck plus required tests based on the owning workspace scripts.
- 로컬에서 `pnpm build`는 아래 케이스에서만 기본 실행한다.
  1. 배포하기 직전
  2. main/dev 같은 중요 브랜치 합치기 직전
  3. 라우팅 구조 변경
  4. `next.config.js`, `tsconfig`, `package.json`, `pnpm-lock.yaml` 변경
  5. 서버 컴포넌트/클라이언트 컴포넌트 경계 변경
  6. import/export 구조 대규모 변경
  7. 환경변수 사용 코드 변경
  8. 이미지, 폰트, `dynamic import`, `middleware`, API route 변경
  9. `Dockerfile` 또는 배포 설정 변경
  10. “운영에서 깨질 수 있는 큰 리팩토링” 후

- 버튼/문구 텍스트 수정, CSS/Tailwind class 약간 수정, 여백/색/폰트 수정, 단순 배치 변경, 로컬에서 즉시 시각 확인되는 소규모 UI 수정, README/주석/문서 수정은 기본적으로 `pnpm build` 필수 대상이 아니다.
- 웹 빌드 변경이 필요한 경우 CD 이미지 빌드(배포 파이프라인)에서 `build` 게이트를 수행하고, 로컬 커밋 훅은 `pnpm --filter @yeon/web lint`/`typecheck` 중심으로 선검증한다.
- Schema changes: load `yeon-project-context` DB/migration guidance before editing and run drift checks afterward.
- Docs/rules/skills-only changes: at minimum run:
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`

If a check cannot run, report the exact command and reason. Final reports should name changed files, verification evidence, and remaining risks.

## Source-of-truth hygiene

- Project rules live here; `CLAUDE.md` and `CLAUDE.local.md` are one-line pointers only.
- Global shared rules live in `~/.codex/AGENTS.md`; this file contains only Yeon-specific overrides.
- Stable product/architecture/deployment knowledge belongs in `docs/` or the appropriate skill source, not in chat-only memory.

## OAuth 리디렉션 URI 규칙

상담 연동 OAuth 앱(Google Drive, Microsoft 등) 설정 시 리디렉션 URI는 반드시 4개를 등록한다:

```
http://localhost:3000/counseling-service/api/v1/integrations/<provider>/auth/callback
https://yeon.world/counseling-service/api/v1/integrations/<provider>/auth/callback
https://www.yeon.world/counseling-service/api/v1/integrations/<provider>/auth/callback
https://dev.yeon.world/counseling-service/api/v1/integrations/<provider>/auth/callback
```

루트 소셜 로그인(Kakao, Google Sign-In)은 별도이며 `/api/auth/<provider>/callback`를 유지한다.

## 작업 스타일

- 설명은 간결하게, 핵심만 전달한다.
- 불필요한 확인 질문 없이 바로 실행한다.
- 한 번에 끝낼 수 있는 수정은 계획만 길게 쓰지 않고 바로 구현한다.

## 커밋 메시지 세부 규칙

- 커밋 메시지는 반드시 한국어로 작성한다.
- 최소한 변경 대상, 핵심 동작 변화, 수정 의도가 드러나야 한다.
- `fix: 수정`, `fix: 리뷰 반영`, `refactor: 정리`처럼 모호한 메시지는 금지한다.
- 좋은 예: `fix: 웹 인증 세션 분기에서 모바일 공용 계약 참조로 통일`
- 좋은 예: `feat: 웹 온보딩 카드에 디자인 시스템 기반 CTA 구조 추가`
- 나쁜 예: `fix: 세션 정리`

## 개발 계획 / 백로그 규칙

- 코드 수정, 리팩토링, 설계 변경, API 추가, DDL 변경처럼 실제 개발 작업에 들어가기 전에는 반드시 먼저 백로그 문서를 작성한다.
- 백로그 문서는 공식 실행 항목이므로 `docs/product/backlog/` 아래 주제별 문서에 작성한다. 과거 날짜별 백로그는 `docs/product/backlog/history/YYYY-MM-DD/` 아래에 보관한다.
- 이미 같은 주제의 백로그를 완료했다면 기존 파일명에는 `(완)`을 붙여 보관하고, 새 백로그는 숫자를 이어 붙인 새 파일로 만든다.
- 실행 주체 기반 작업 문서는 별도 네이밍을 쓴다: `N-작업-{claude|codex}_{시작HHMM}-{종료HHMM}_{주제}_[작업중|완료].md`. `ai-log/{person}/YYYY-MM-DD/` 아래에 작성하고 백로그와 섞지 않는다.
- 개발 계획은 `차수` 단위 backlog 형식으로 작성한다.
- 각 차수에는 최소한 `작업내용`, `논의 필요`, `선택지`, `추천`, `사용자 방향` 항목이 있어야 한다.
- `사용자 방향`이 비어 있으면 `추천` 기준으로 진행한다.

## 구현 원칙

- 값이 진실의 원천(source of truth)이 되도록 설계한다.
- raw 문자열을 분기 곳곳에 흩뿌리지 않는다. 같은 의미를 두 번 이상 비교해야 하면 상수 객체로 승격한다.
- TypeScript `enum`은 런타임 산출물이 실제로 필요한 경우에만 사용한다. 기본값은 `as const` 객체와 literal union 조합이다.
- Single Responsibility Principle을 지킨다. 파일, 함수, 훅, 컴포넌트는 가능한 한 하나의 이유로만 변경되게 유지한다.
- 조건 분기를 줄인다. 깊은 `if` 중첩보다 의미 있는 상태 변수, 조기 반환, 매핑 테이블, 작은 보조 함수나 컴포넌트 분리를 우선한다.
- 주석은 필요한 곳에만 단다. "무엇인가"보다 "왜 따로 존재하는지"를 설명할 때만 단다.
- 로그 메시지, 오류 메시지, 실패 이유 문자열은 한국어를 기본으로 한다.

## 코드 리뷰 원칙

- 목표는 "어떤 리뷰가 와도 상태 전이, source of truth, 실패 경계, 사용자 영향까지 근거로 설명하고 방어할 수 있는 코드"를 만드는 것이다.
- 리뷰어가 문제 삼을 수 있는 상태 오염 가능성 자체를 먼저 제거하는 방어적 리팩토링을 우선한다.
- 사용자가 코드리뷰를 요청하면 `critical 3개 이상`, `major 3개 이상`, `minor 3개 이상`의 검토 포인트를 찾는 것을 기본 목표로 삼는다.
- 상태 정합성 중심으로 검토한다. 정상 흐름만 보지 말고 상태가 깨지는 지점을 먼저 의심한다.
- 먼저 source of truth를 식별한다. 원본 상태와 파생 상태를 구분한다.
- `set`, `save`, `write`, `add` 로직을 보면 `delete`, `clear`, `remove`, `reset` 로직도 반드시 함께 확인한다.
- 캐시, 파생값, 메모이즈, 저장소, 폼 상태처럼 원본을 복제하는 구조는 원본 변경 시 함께 갱신되거나 폐기되는지 확인한다.
- 비동기 로직은 항상 순서 뒤집힘과 레이스를 의심한다.
- 리뷰 기준은 "맞아 보이는가"가 아니라 "거짓 상태가 남을 수 있는가"다.
- 리뷰 체크리스트:
  - 이 값의 원본은 무엇인가
  - 실패하면 이전 상태가 남는가
  - 로그아웃, 만료, 예외 시 정리되는가
  - 서버와 클라이언트 규칙이 같은가
  - 여러 번 실행해도 상태가 꼬이지 않는가

## 스타일링 원칙

- 기본 Tailwind 유틸리티 사용을 허용한다.
- 기본 scale로 충분하면 그대로 쓴다.
- dynamic Tailwind class 생성은 하지 않는다.
- arbitrary value는 기존 scale이나 토큰으로 표현할 수 없고 반복 가능성이 있을 때만 쓴다.
- 전역 CSS에는 화면 전용 스타일이나 임시 수정용 스타일을 넣지 않는다.

## 릴리즈 / 최소 버전관리 규칙

- 운영 제품 버전의 SSOT는 성공한 `main` 배포 뒤 생성되는 GitHub Release tag `vMAJOR.MINOR.PATCH`이다.
- 자동 릴리즈 하네스는 배포 커밋 범위의 commit/PR title/body/label을 읽어 MAJOR/MINOR/PATCH를 결정한다.
- 세부 자동 판정 기준과 예외 처리는 `docs/agent-rules/deployment-versioning.md`를 따른다.
- breaking/minor 의도가 있으면 PR title/body/label에 `semver:major`, `semver:minor`, `BREAKING CHANGE`, `feat:` 같은 결정적 신호를 남긴다.
- root `package.json`의 `version`은 자동 운영 릴리즈 번호를 막거나 대체하는 기준으로 쓰지 않는다.
- PR 생성/merge 명령을 수행한 뒤에는 머지 상태 재조회나 CI/CD/배포/릴리즈 완료 대기로 오래 멈추지 않는다. 후속 상태는 GitHub Actions 비동기 흐름에 맡기고, 필요한 URL만 남긴다.
- Playwright 같은 로컬 브라우저 확인이 필요한 경우 에이전트가 직접 `pnpm dev:all`을 기동해도 된다. 단, 사용자 컴퓨터의 RAM을 아껴야 하므로 중복 기동을 금지한다. 먼저 `lsof -nP -iTCP:3000 -iTCP:3001 -iTCP:3002 -iTCP:8000 -iTCP:8081 -iTCP:8082 -iTCP:8083 -iTCP:2567 -sTCP:LISTEN`처럼 관련 포트 점유 상태를 확인한다. 이미 `pnpm dev:all`로 web/backend/mobile/race-server가 정상 기동 중이면 재사용하고, 매번 끄고 다시 켜지 않는다. 필요한 포트가 비어 있거나 기존 프로세스가 죽은 상태일 때만 `pnpm dev:all`을 실행한다. 충돌 프로세스를 종료해야 할 때는 Yeon 로컬 개발 프로세스인지 확인하고, unrelated 프로세스를 함부로 죽이지 않는다. 확인 후에는 Playwright로 실제 동작을 검증하고, 에이전트가 새로 띄운 dev 서버는 검증 종료 후 필요하면 정리한다.
- 타자 서비스(`typing-service`)를 로컬에서 테스트하거나 Playwright로 검증할 때는 web/backend뿐 아니라 race-server(`apps/race-server`, 기본 2567)도 함께 실행·재사용한다. 타자방/점령전/레이스 화면은 race-server 연결을 전제로 하므로, 포트 확인 후 기존 race-server가 없으면 `pnpm dev:all` 또는 해당 race-server dev 명령으로 같이 띄운 뒤 검증한다.
- 로컬 검증 중 Docker 컨테이너가 필요한 경우에도 먼저 `docker ps`/`docker ps -a`로 기존 컨테이너를 확인하고 재사용한다. 같은 목적의 DB/MCP/테스트 컨테이너를 반복 생성해 RAM을 낭비하지 않는다. 불필요하게 쌓인 에이전트 생성 컨테이너가 보이면 소유와 용도를 확인한 뒤 정리하며, 프로젝트/사용자 장기 실행 컨테이너는 근거 없이 중지하지 않는다.
- 로컬 커밋 훅에서 `pnpm build`를 기본적으로 강제하지 않는다. `pnpm --filter @yeon/web lint`/`typecheck`로 선검증하고, 웹 빌드는 CD 이미지 빌드 단계에서 실패 게이트를 수행한다.

## Claude CLI / OMC skill 참고

이 저장소는 OMC(oh-my-claudecode) 레이어를 사용한다. Claude 측에서만 의미 있는 skill 기호:

- `/oh-my-claudecode:ralph`, `/oh-my-claudecode:autopilot`, `/oh-my-claudecode:cancel` 등 OMC 표준 skill
- `/ralph-strict` — 이 저장소 로컬 스킬 (ralph에 deep-interview + code-review 의무화)
- `/validate`, `/ship`, `/deploy-all`, `/code-review`, `/wrap` 등 로컬 스킬

Codex 측 대응 wrapper는 `.codex/skills/<name>/SKILL.md`에 자동 생성된다 (`bin/sync-skills.sh`). hook: `~/.claude/hooks/reminder.sh`가 매 UserPromptSubmit에서 SSOT 경로와 핵심 규칙을 주입한다.
