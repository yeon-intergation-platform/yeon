# React Query 도입/표준화 계획 2026-05-12

## 배경

`apps/web`에는 이미 `@tanstack/react-query`와 `QueryClientProvider`가 들어와 있고 카드 서비스 일부는 queryKey 함수화, fetch wrapper, mutation invalidation 패턴이 비교적 잘 정리되어 있다. 반면 상담/학생관리/typing/life-os/check 등에는 raw `queryKey` 배열, 컴포넌트 내부 fetch, 도메인별 다른 에러 처리, 무효화 범위 불일치가 섞여 있다.

따라서 이번 계획의 목표는 “신규 라이브러리 도입”이 아니라 **React Query를 서버 상태 표준으로 확정하고 서비스별로 단계적 정리**하는 것이다.

## 현재 구현 스냅샷

- Provider: `apps/web/src/lib/query-provider.tsx`에 `QueryClientProvider` 존재.
- 기준 구현: `apps/web/src/features/card-service/hooks/*`.
  - `cardDecksQueryKey(isAuthenticated)` / `cardDeckDetailQueryKey(isAuthenticated, deckId)`처럼 queryKey 함수화.
  - mutation `onSuccess`에서 관련 key를 명시 invalidate.
  - 게스트/인증 분기를 hook 내부에서 감춤.
- 정리 필요 영역 예시:
  - `features/student-management/**`: 일부 queryKey 함수가 있으나 `['members']`, `['spaces']`, `['student-board', ...]` raw key도 많음.
  - `app/counseling-service/**`: app route 내부 hook과 component에 raw key가 흩어짐.
  - `features/typing-service/**`: 일부 함수형 key와 raw key가 혼재.
  - `features/life-os/life-os.tsx`, `app/check/[token]/page.tsx`, `features/cloud-import/**`: 컴포넌트 내부 query/mutation이 많아 훅 분리 후보.

## 원칙

- React Query는 **서버 상태(source of truth: 서버/API)** 전용으로 쓴다.
- 순수 UI 상태, 폼 입력 중간값, 애니메이션/모달 open 상태는 React Query로 올리지 않는다.
- queryKey는 raw 배열을 컴포넌트에 흩뿌리지 않고 함수로 export한다.
- fetch는 도메인별 wrapper를 경유한다.
- mutation은 `use<Verb><Entity>` 단위로 책임을 쪼갠다.
- mutation 성공 후 영향받는 queryKey를 `onSuccess`에서 명시적으로 invalidate한다.
- 에러 메시지는 한국어 `~지 못했습니다.` 형태로 통일한다.
- optimistic update는 onMutate/onError rollback까지 설계된 경우에만 도입한다.
- 게스트 ↔ 인증 분기는 사용처가 아니라 query/mutation hook 내부에서 처리한다.

## 1차: 기준선 고정과 린트 가능한 패턴 문서화

### 작업내용

- 카드 서비스 훅을 기준 구현으로 확정한다.
- `docs/architecture/` 또는 `docs/agent-rules/`에 “web server-state with TanStack Query” 짧은 공식 문서를 추가한다.
- 문서에는 다음 항목을 포함한다.
  - queryKey factory 네이밍 규칙
  - fetch wrapper 규칙
  - mutation/invalidation 규칙
  - 게스트/인증 분기 규칙
  - 금지 예시: raw `queryKey: [`, 직접 `fetch`, 영문 에러 메시지, 무효화 누락
- 기존 `.codex/skills/SHARED/tanstack-query-conventions`와 내용이 충돌하지 않게 SSOT 위치를 정한다.

### 논의 필요

- 공식 문서 위치를 `docs/architecture/web-server-state.md`로 둘지, `docs/agent-rules/tanstack-query.md`로 둘지.

### 선택지

1. `docs/architecture/web-server-state.md`: 제품/구조 설계 문서로 유지.
2. `docs/agent-rules/tanstack-query.md`: 에이전트 실행 규칙으로 유지.

### 추천

- 1번. React Query는 코드 구조와 상태 소유권 문제이므로 architecture 문서가 맞다. 에이전트 스킬은 그 문서를 가리키는 얇은 실행 지침으로 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차: queryKey inventory와 충돌 제거

### 작업내용

- `apps/web/src` 전체에서 React Query 사용 지점을 수집한다.
- raw `queryKey: [` 목록을 서비스별로 분류한다.
- 같은 의미인데 다른 key를 쓰는 항목을 통합한다.
  - 예: `['members']`, `['members', selectedSpaceId]`, `['modal-space-members', selectedSpaceId]`의 소유 경계 명확화.
- 각 서비스별 queryKey factory 파일/위치를 정한다.
  - `features/<service>/hooks/use-*.ts` 안에 가까운 key factory를 두거나,
  - 규모가 커지면 `features/<service>/hooks/<service>-query-keys.ts`로 분리.

### 논의 필요

- 공용 `queryKeys` 중앙 파일을 만들지 여부.

### 선택지

1. 서비스별 queryKey factory 유지.
2. 전역 `src/lib/query-keys.ts` 중앙화.

### 추천

- 1번. Yeon은 서비스 경계가 중요하므로 전역 key 파일은 결합도를 높인다. 서비스별로 두고 교차 invalidation이 필요한 경우만 명시 import한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차: card-service 기준 패턴 유지/보강

### 작업내용

- 카드 서비스는 기준 구현이므로 대규모 변경하지 않는다.
- 남은 raw key가 있으면 함수화한다.
  - 예: card room 관련 `['card-rooms']` 계열.
- fetch wrapper 미경유 지점이 있으면 wrapper로 통일한다.
- mutation invalidation 누락 여부를 테스트/리뷰한다.

### 논의 필요

- 없음. 카드 서비스는 기준선 보강만 한다.

### 선택지

1. 카드 서비스부터 완전 정리 후 다른 서비스로 확산.
2. 바로 상담/학생관리로 확산.

### 추천

- 1번. 기준 구현이 흔들리면 이후 마이그레이션 품질이 낮아진다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 4차: counseling/student-management 서버 상태 정리

### 작업내용

- 상담/학생관리 도메인 fetch wrapper를 명확히 한다.
  - 이미 있는 API helper를 유지할지, 도메인별 `*-fetch.ts`를 만들지 결정.
- `spaces`, `members`, `member-detail`, `student-board`, `member-tabs`, `custom-tab-fields`, `member-memos`, `counseling-records` queryKey를 함수화한다.
- mutation 성공 시 관련 key invalidation을 명시한다.
- 컴포넌트 내부에 긴 query/mutation이 있으면 hook으로 분리한다.
- optimistic update가 이미 있는 곳은 rollback 기준을 재검토한다.

### 논의 필요

- `app/counseling-service/**`에 남아 있는 hook을 `features/student-management`로 이동할지 여부.

### 선택지

1. 우선 위치 이동 없이 key/fetch/invalidation만 정리.
2. feature slice로 파일 이동까지 함께 수행.

### 추천

- 1번. 파일 이동과 server-state 정리를 섞으면 diff가 커져 리뷰 리스크가 커진다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 5차: typing-service/life-os/check/cloud-import 정리

### 작업내용

- typing-service:
  - `typingDecksQueryKey`, `typingDeckDetailQueryKey` 계열을 기준으로 raw key를 제거한다.
  - deck/passages/character frame/room lobby key의 계층 구조를 정한다.
- life-os:
  - `lifeOsDayQueryKey(date)`와 save mutation invalidation을 분리한다.
  - 화면 컴포넌트 내부 mutation을 hook으로 이동할지 검토한다.
- public check:
  - token/entryMode 기반 queryKey factory를 만들고 verify/submit mutation 책임을 나눈다.
- cloud-import:
  - file-preview/local-drafts queryKey를 함수화하고 preview fetch wrapper를 정리한다.

### 논의 필요

- public check처럼 단일 페이지 전용 기능도 hook 분리를 강제할지 여부.

### 선택지

1. 단일 페이지라도 server-state는 hook으로 분리.
2. 단일 페이지는 queryKey factory만 만들고 컴포넌트 내부 query를 허용.

### 추천

- 2번. 단일 페이지의 간단한 query까지 과분리하면 오히려 탐색 비용이 증가한다. 단, mutation이 2개 이상이거나 invalidation이 생기면 hook으로 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 6차: 검증과 회귀 방지

### 작업내용

- 서비스별 변경마다 최소 검증을 분리한다.
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web lint`
  - 관련 hook 테스트가 있으면 해당 테스트 실행
  - 영향 큰 변경은 `pnpm --filter @yeon/web build`
- raw queryKey 감시 스크립트를 추가할지 검토한다.
  - 단순 grep 기반: `rg 'queryKey:\s*\[' apps/web/src/features apps/web/src/app`
  - 예외 허용 주석을 둘지 결정.
- 문서/스킬에 “새 React Query 코드 작성 전 queryKey factory부터 만든다”를 고정한다.

### 논의 필요

- raw queryKey를 즉시 lint rule로 막을지, 초기에는 문서+리뷰로 관리할지.

### 선택지

1. 즉시 lint rule/스크립트로 실패 처리.
2. 1~2차 정리 후 실패 처리로 강화.

### 추천

- 2번. 현재 raw key가 많으므로 바로 실패 처리하면 기존 debt 때문에 개발이 막힌다. 먼저 inventory/정리 후 CI gate를 올린다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 작업 순서 제안

1. 공식 문서 작성 + 기준 구현 링크 고정.
2. raw queryKey inventory 문서/표 생성.
3. card-service 보강 PR.
4. student-management 핵심 key factory PR.
5. counseling records/space hooks PR.
6. typing-service deck/room query PR.
7. life-os/check/cloud-import 소규모 PR.
8. grep 기반 guard 또는 lint rule 도입 PR.

## 완료 조건

- 신규 React Query 코드는 queryKey factory, fetch wrapper, mutation invalidation 규칙을 따른다.
- 서비스별 queryKey가 충돌 없이 계층화된다.
- 주요 mutation은 성공 후 영향받는 cache를 명시 invalidate한다.
- 게스트/인증 분기가 hook 외부 UI 컴포넌트로 새지 않는다.
- 사용자 노출 에러 메시지는 한국어로 통일된다.
