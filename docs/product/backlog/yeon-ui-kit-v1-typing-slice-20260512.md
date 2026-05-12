# Yeon UI Kit v1 타자 서비스 적용 백로그

## 배경

- shadcn/ui를 패키지로 설치하지 않고, Yeon 기존 흰 배경 미니멀 톤을 보존하는 내부 primitive를 먼저 만든다.
- 첫 적용 범위는 타자 서비스의 반복 버튼/입력/카드/배지 패턴으로 제한한다.
- 게임 엔진, 레이스 상태 전이, 서버 API, DB schema는 변경하지 않는다.

## 1차 — 내부 primitive 추가

### 작업내용

- `apps/web/src/components/yeon-ui/`에 `YeonButton`, `YeonField`, `YeonSurface`, `YeonBadge`와 barrel export를 추가한다.
- `as const` variant map과 작은 `joinClassNames` 유틸로 className을 조합한다.
- 새 의존성(`clsx`, `tailwind-merge`, `class-variance-authority`, shadcn/ui`)은 추가하지 않는다.

### 논의 필요

- v1 primitive를 타자/카드 흰 배경 구간 전용으로 둘지, 이후 상담 `.app-theme`까지 확장할지.

### 선택지

1. 흰 배경 서비스 전용 primitive로 시작한다.
2. 전체 서비스 공통 primitive로 바로 확장한다.

### 추천

- 1번. 상담 워크스페이스는 CSS 변수 기반 토큰 체계가 달라 별도 phase에서 다룬다.

### 사용자 방향

-

## 2차 — 타자 서비스 반복 UI 치환

### 작업내용

- 타자 서비스 홈/덱/방 로비의 CTA, secondary/danger 버튼, 카드 표면, 상태 배지, 입력 필드 반복 className을 primitive로 치환한다.
- 기존 시각 톤과 spacing은 유지한다.
- race engine, multiplayer 화면 상태 로직, seed/protocol은 건드리지 않는다.

### 논의 필요

- 버튼 hover 색을 기존 `#333` 계열에서 허용 색상 기반 opacity로 정리해도 되는지.

### 선택지

1. 새 primitive 내부만 허용 색상 기반으로 정리하고 화면 구조는 그대로 둔다.
2. 기존 화면의 모든 비정규 회색까지 대규모 정리한다.

### 추천

- 1번. v1 범위를 작게 유지하고, 전체 색상 정리는 별도 백로그로 분리한다.

### 사용자 방향

-

## 3차 — 검증 및 main 배포

### 작업내용

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- owned file만 stage하여 한국어 커밋 → push → PR(main) → merge.

### 논의 필요

- 검증 중 기존 타 작업 파일이 변경되면 revert하지 않고 owned file staging에서 제외할지.

### 선택지

1. owned file만 stage하고 타 작업 변경은 그대로 둔다.
2. 타 작업 변경까지 정리한다.

### 추천

- 1번. 현재 작업 범위 밖 변경은 건드리지 않는다.

### 사용자 방향

-
