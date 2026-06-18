# 01 작업 - card service visual loop

## 목표

- 카드 서비스를 한 서비스 범위로 고정해 Playwright 스크린샷 기반 화면 품질 루프를 수행한다.
- 실제 사용자 흐름에서 P0/P1을 찾고, 가장 작은 독립 묶음만 수정한 뒤 재발 방지 게이트를 추가한다.

## 제약

- base/PR target은 `main`이다.
- `develop`은 사용하지 않는다.
- 디자인 시스템 자체는 바꾸지 않는다.
- 색상 체계는 카드 서비스 SSOT: 흰 배경, `#111` 텍스트/CTA, `#e5e5e5` 보더를 따른다.
- API contract/DB/auth/권한 변경이 필요하면 중단 보고한다.
- web UI 변경 시 Universal UI parity registry를 확인한다.

## 진행 메모

- 브랜치: `qa/card-service-visual-loop-20260619`
- 시작 기준: `origin/main`
- 서비스 범위: `card-service`
- 주요 근거:
  - `docs/agent-rules/card-service.md`
  - `apps/web/src/features/card-service/**`
  - `packages/api-contract/src/card-decks.ts`
  - `packages/api-contract/src/card-deck-merge-guest.ts`
  - `docs/architecture/universal-ui-parity-registry.yaml`
- 디자인 방향: 흰 배경의 생산성형 카드 학습 UI. 덱 생성, 카드 편집, 학습 진입이 먼저 보여야 한다.

## 사이클 1 계획

- 카드 홈/덱 목록/덱 상세/학습 화면 source of truth 확인
- 로컬 dev 서버 재사용 또는 기동
- Playwright 데스크톱/모바일 스크린샷 수집
- P0/P1/P2 분류
- P0/P1 최소 묶음 수정
- 수정 후 screenshot + 관련 검증

## 사이클 1 결과

### 발견

- P1: 빈 덱 상세 화면의 최상단 기본 CTA가 `학습 시작`이었다.
  - 실제 클릭 결과는 `/play` 빈 상태의 `덱으로 돌아가기` dead-end였다.
  - 증거:
    - `ai-log/hyeonjun/2026-06-19/card-service-visual-loop-screenshots/before/05-desktop-detail-empty-before.png`
    - `ai-log/hyeonjun/2026-06-19/card-service-visual-loop-screenshots/before/06-desktop-play-empty-dead-end-before.png`
- P2: 빈 덱 상세에서 카드 추가 버튼이 여러 위치에 중복되어 다음 행동 우선순위가 흐려졌다.
- `127.0.0.1:3005`로 Next dev를 열면 dev resource cross-origin 차단 때문에 덱 목록 로딩이 멈춘 것처럼 보였다. 실제 검증 URL은 dev 서버가 안내한 `http://localhost:3005`로 고정했다.

### 수정

- 빈 덱 상세의 최상단 CTA를 `+ 첫 카드 추가`로 바꾸고, 클릭 시 카드 추가 모달을 연다.
- 카드가 1장 이상일 때만 `학습 시작` 링크를 보여준다.
- 빈 덱 상세에서는 목록 헤더/empty panel의 중복 카드 추가 버튼을 숨겨 기본 행동을 하나로 고정했다.
- 기존 카드 덱 목록 시각 회귀 테스트에서 플로팅 위젯을 제외해 스냅샷을 결정적으로 만들었다.

### 수정 후 증거

- `ai-log/hyeonjun/2026-06-19/card-service-visual-loop-screenshots/after/01-desktop-detail-empty-after.png`
- `ai-log/hyeonjun/2026-06-19/card-service-visual-loop-screenshots/after/02-desktop-first-card-add-dialog-after.png`
- `ai-log/hyeonjun/2026-06-19/card-service-visual-loop-screenshots/after/04-mobile-detail-empty-after.png`

### 검증

- PASS: `PLAYWRIGHT_BASE_URL=http://localhost:3005 pnpm --filter @yeon/web exec playwright test e2e/card-service-empty-deck-cta.spec.ts --project=chromium`
- PASS: `PLAYWRIGHT_BASE_URL=http://localhost:3005 pnpm --filter @yeon/web exec playwright test e2e/card-service-visual-regression.spec.ts --project=chromium`
- PASS: `pnpm --filter @yeon/web lint`
- PASS: `pnpm --filter @yeon/web typecheck`
- PASS: `git diff --check`
