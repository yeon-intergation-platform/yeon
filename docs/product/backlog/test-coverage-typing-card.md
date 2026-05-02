# 테스트 커버리지 보강 — 타자서비스 / 카드서비스

타자서비스(typing-service)와 카드서비스(card-service) 두 영역에 한해 누락된 테스트를 도메인 entity 수직 슬라이스 단위로 차수 분할한 backlog. deep-interview 산출물(SSOT)이며 `.omc/specs/deep-interview-test-coverage-typing-card.md` 는 이 파일을 가리키는 포인터다.

## Metadata

- Source: `/oh-my-claudecode:deep-interview` (Sonnet 4.6, 2026-05-03)
- Rounds: 5
- Final Ambiguity: 16% (threshold 20% 통과)
- Type: brownfield
- 분할 축: **컨텍스트 응집 — 도메인 entity 수직 슬라이스** (Round 3 정정 반영, 위험도 우선 폐기)
- Spec depth: 차수별 파일 경로 + 추천 테스트 케이스 3~7개
- 검증 도구: vitest 4.1.4, @testing-library/react 16.3.2, @playwright/test 1.59.1

## Clarity Breakdown

| Dimension          | Score | Weight | Weighted        |
| ------------------ | ----- | ------ | --------------- |
| Goal Clarity       | 0.90  | 0.35   | 0.315           |
| Constraint Clarity | 0.92  | 0.25   | 0.230           |
| Success Criteria   | 0.70  | 0.25   | 0.175           |
| Context Clarity    | 0.80  | 0.15   | 0.120           |
| **Total Clarity**  |       |        | **0.840**       |
| **Ambiguity**      |       |        | **0.160 (16%)** |

## Goal

타자서비스와 카드서비스 두 영역의 미검증 비즈니스 로직, 상태 머신, 게스트/서버 분기, 멀티플레이 무결성 코드를 도메인 entity 단위 수직 슬라이스로 묶어 차수별 backlog 로 정리한다. 실제 vitest/Playwright 테스트 코드 작성은 본 문서 산출 후 차수 단위로 별도 세션에서 수행한다.

## Constraints

- 범위: `apps/web/src/features/typing-service/**`, `apps/web/src/features/card-service/**`, `apps/web/src/server/services/typing-decks*`, `card-decks*`, 관련 `apps/web/src/app/api/v1/**` route handlers, `apps/race-server/**`, `packages/typing-race-engine/**`, `packages/race-shared/**`, `packages/api-contract/src/typing-decks.ts`, `card-decks.ts`, `apps/web/src/lib/guest-card-service-store/**`.
- 모바일(`apps/mobile/**`) 은 본 backlog 대상 아님(별도 세션에서 다룬다).
- 차수 분할은 같은 차수 안의 파일들이 한 번에 컨텍스트 로딩되어 같이 읽히도록 도메인 entity 단위로 묶는다. 위험도 기반 분할은 채택하지 않는다.
- 한 차수의 평균 분량은 vitest 단위 테스트 기준 4~8 파일, 추천 테스트 케이스 합계 약 20~40개 수준으로 유지.
- 본 문서는 spec/plan 만 산출한다. 코드 작성은 별도 세션.

## Non-Goals

- 모바일 앱(`apps/mobile/**`) 테스트.
- counseling, auth, contest 등 타 서비스 테스트.
- 커버리지 정량 목표(예: 80%) 설정 — coverage 수치보다 누락된 도메인 무결성 검증 우선.
- Phaser 기반 `packages/typing-race-engine` 의 시각 렌더링 단위 테스트(7차수에서 Playwright 권장만 명시).
- 기존 통과 중인 테스트의 리팩토링/스타일 정정.

## Acceptance Criteria

- [ ] 7 개 차수가 각각 yeon `AGENTS.md` 백로그 규칙(작업내용/논의 필요/선택지/추천/사용자 방향)을 모두 포함한다.
- [ ] 각 파일 항목은 절대/상대 경로 + 추천 테스트 케이스 3~7개를 갖는다.
- [ ] 차수 1~7 의 합집합이 본 문서 Constraints 의 범위를 모두 덮는다(누락 없음).
- [ ] 같은 도메인 entity 의 server/route/hook/component 가 같은 차수 안에 모인다.
- [ ] 이미 테스트가 존재하는 영역(예: `packages/race-shared/src/typing-race.ts`)은 "보강 케이스" 로만 명시하고 중복 작성 금지.
- [ ] `.omc/specs/deep-interview-test-coverage-typing-card.md` 가 본 파일을 단방향 포인터로 참조한다.

## Assumptions Exposed & Resolved

| Assumption                                         | Challenge                                                                           | Resolution                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 산출물은 실제 테스트 코드여야 한다                 | "spec 만 만들고 작성은 별도 세션이 더 빠를 수도 있다"                               | spec/plan 문서만 (Round 1)                                           |
| 모든 레이어를 한 spec 에 담으면 AI 가 처리 못 한다 | 사용자가 직접 우려 표명 (Round 2 메타 코멘트)                                       | `AGENTS.md` 의 차수 단위 backlog 형식으로 한 문서 안에서 차수별 분할 |
| 차수는 위험도 순으로 자르는 게 맞다                | "차수 안에 서버/클라/엔진 다 섞이면 컨텍스트 로딩이 비효율적" (Round 3 사용자 정정) | 도메인 entity 수직 슬라이스로 변경 (Round 4 ContextCluster 도입)     |
| 파일별로 모킹 전략까지 다 적어야 한다 (CONTRARIAN) | "작성 시점에 코드 보고 정하는 게 더 정확"                                           | 추천 케이스 3~7개만 포함, 모킹은 작성 단계 결정 (Round 4)            |
| 응집의 단위가 feature 디렉터리다                   | feature 안에 서버/클라 분리되어 병합 명세 분산                                      | 도메인 entity 수직(A) 채택 (Round 5)                                 |

## Technical Context

| 영역                                                          | 이미 테스트 있음                                      | 미검증 핵심                                          |
| ------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `packages/race-shared/src/typing-race.ts`                     | ✓ WPM/CPM 계산, 정확도/진행률 클램핑, 4단계 순위 정렬 | (보강만)                                             |
| `packages/api-contract/src/__tests__/`                        | ✓ 2 파일                                              | —                                                    |
| `apps/web/src/server/services/typing-decks-service.ts`        | △ 부분(deck shape 만)                                 | seed 서명/검증, 권한 분기, 언어 필터                 |
| `apps/web/src/server/services/card-decks-service.ts`          | ✗ 없음                                                | SRS 1/3/4일, 카드 정렬, 트랜잭션                     |
| `apps/web/src/features/card-service/hooks/use-merge-guest.ts` | ✗ 없음                                                | dump→merge→clear 순서, 100ms backoff 3회             |
| `apps/race-server/src/rooms/typing-race-room.ts`              | ✗ 없음                                                | seed 검증(timing-safe), 진행률 경계, 라운드 전환     |
| `apps/web/src/features/typing-service/use-race-room.ts`       | ✗ 없음                                                | idle→connecting→connected→error/disconnected, rejoin |

설치된 도구는 Vitest 4.1.4 + @vitest/browser + @vitest/coverage-v8 + @testing-library/react + jsdom 29 + Playwright 1.59 + axe-core/playwright. 추가 의존성 없이 진행 가능.

## Ontology (Key Entities)

| Entity          | Type        | Fields                                                              | Relationships             |
| --------------- | ----------- | ------------------------------------------------------------------- | ------------------------- |
| TestPlan        | core domain | scope, deliverable=backlog, layers=[server, client, pure, realtime] | 차수 1..N 으로 분할       |
| BacklogChapter  | core domain | 차수 번호, 도메인, 파일 목록, 추천 케이스                           | yeon AGENTS.md 형식 준수  |
| ContextCluster  | core domain | 도메인 entity 수직 슬라이스 단위                                    | BacklogChapter ↔ 1:1      |
| TestTarget      | core domain | 절대 경로, 레이어, 복잡도                                           | BacklogChapter has many   |
| TestCase        | supporting  | 한 줄 시나리오                                                      | TestTarget has many (3~7) |
| TestLayer       | supporting  | server, client, pure, realtime                                      | TestTarget tagged with    |
| ServiceScope    | supporting  | typing, card                                                        | BacklogChapter belongs to |
| BacklogDocument | supporting  | yeon backlog 5개 섹션                                               | BacklogChapter wraps      |

## Ontology Convergence

| Round | Entity Count | New                           | Changed                        | Stable | Stability |
| ----- | ------------ | ----------------------------- | ------------------------------ | ------ | --------- |
| 1     | 5            | 5                             | —                              | —      | N/A       |
| 2     | 6            | 1 (TestLayer)                 | 0                              | 5      | 83%       |
| 3     | 8            | 2 (BacklogChapter, RiskLevel) | 0                              | 6      | 75%       |
| 4     | 8            | 1 (ContextCluster)            | -1 (RiskLevel 제거)            | 7      | 87%       |
| 5     | 8            | 0                             | 1 (ContextCluster 정의 구체화) | 7      | 100%      |

도메인 모델이 5라운드 만에 완전 수렴.

## Interview Transcript

<details>
<summary>Full Q&A (5 rounds)</summary>

### Round 1 (Targeting: Success Criteria)

**Q:** 이 작업의 최종 산출물은 무엇이어야 하나요?
**A:** spec/plan 문서만 (실제 작성은 별도)
**Ambiguity:** 47.5%

### Round 2 (Targeting: Constraints)

**Q:** spec에 포함할 테스트 레이어 범위는 어디까지인가요? (다중 선택)
**A:** 4개 모두 + 메타 우려 ("AI 가 잘 처리할 수 있나?")
**Ambiguity:** 40%

### Round 3 (Targeting: Constraints) — 정정 발생

**Q:** backlog 차수는 어떤 기준으로 쉬는 게 좋을까요?
**A:** (초기) 위험도 우선 → (정정) 컨텍스트 유리한 방향
**Ambiguity:** 31% → 정정 후 재계산

### Round 4 (Targeting: Success Criteria, Mode: CONTRARIAN)

**Q:** 차수 안에 추천 케이스/모킹 전략까지 다 적어야 하나? 가벼운 backlog 도 충분하지 않은가?
**A:** 실행 가능: 경로 + 추천 케이스 3~7개
**Ambiguity:** 20.25%

### Round 5 (Targeting: Constraints — 응집 단위)

**Q:** "컨텍스트 유리한 방향"의 단위는?
**A:** (A) 도메인 entity 수직
**Ambiguity:** 16% ✅

</details>

---

# 차수별 Backlog

## 차수 1 — 카드 덱/아이템 서버 vertical (SRS 핵심)

### 작업내용

도메인 entity = `Card Deck` + `Card Item` 의 서버 측 수직 슬라이스. 비즈니스 로직 서비스 + route handlers 의 권한/계산/순서 보장 검증. 카드서비스의 가장 핵심적인 SRS(spaced repetition) 알고리즘이 여기에 모여 있어 단일 차수로 묶는다.

| 파일                                                                                | 추천 테스트 케이스                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/server/services/card-decks-service.ts`                                | (1) `reviewCardDeckItem` 가 hard 결과에 대해 nextReviewAt = now + 1d 를 설정한다. (2) good 결과는 +3d, easy 결과는 +4d 다. (3) `getCardDeckDetail` 이 nextReviewAt 오름차순(null 우선 또는 정해진 정책)으로 정렬한다. (4) 비소유자가 isPublic=false 덱을 조회하면 권한 에러. (5) bulk add 트랜잭션 도중 일부 실패 시 전체 롤백. (6) 카드 add/delete 시 deck.updatedAt 이 동시 갱신된다. |
| `apps/web/src/app/api/v1/card-decks/[deckId]/route.ts`                              | (1) 비인증 GET 은 401. (2) 다른 사용자의 비공개 덱 GET 은 403. (3) PATCH 시 Zod 스키마 위반은 400. (4) 정상 GET 은 contract 스키마와 100% 일치.                                                                                                                                                                                                                                         |
| `apps/web/src/app/api/v1/card-decks/[deckId]/items/route.ts` 및 `[itemId]/route.ts` | (1) 카드 추가 시 contract validation. (2) 본인 아닌 사용자의 item 수정/삭제 거부. (3) 존재하지 않는 itemId 는 404. (4) review POST 가 services 의 nextReviewAt 계산을 호출.                                                                                                                                                                                                             |

### 논의 필요

- nextReviewAt 정렬 정책: null 우선인지, 기본값 채워두는지(현재 코드 근거 확인 필요).
- bulk add 의 트랜잭션 경계가 service 레이어인지 repository 레이어인지(파일 읽고 결정).
- review POST 응답 스키마에 다음 review 시각을 노출하는지 vs 클라가 다시 fetch 하는지.

### 선택지

- A) services 단위 테스트만 (DB mock fake) + route handler 통합 테스트 1~2 개 smoke
- B) services + route 모두 vitest 단위, DB 는 in-memory pg-mem 또는 sqlite 어댑터
- C) services + route 모두 실제 dev DB 사용(yeon 기존 서버 테스트 패턴 추종)

### 추천

(C) yeon 기존 `src/server/services/__tests__/` 테스트 27 개가 이미 실제 DB 패턴을 채택. 일관성 유지가 우선이고 SRS 계산은 DB 의존이 적어 비용도 작다.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 2 — 게스트→서버 병합 흐름 vertical

### 작업내용

도메인 entity = `Guest Merge`. cross-cutting 흐름이지만 응집도가 매우 높아 별도 차수로 분리. 게스트 store dump → merge route 호출 → 로컬 clear 의 3단계 순서, 100ms × 3회 backoff 재시도, 부분 실패 시 에러 전파 정책을 검증.

| 파일                                                                         | 추천 테스트 케이스                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/lib/guest-card-service-store/**` (index/repository/idb 어댑터) | (1) 덱/카드 add → list 가 add 순서 또는 정해진 정렬을 보장. (2) clear 후 list 는 빈 배열. (3) IndexedDB 트랜잭션 도중 throw 시 store 가 일관 상태 유지. (4) public ID 가 동일한 게스트 덱은 dedupe 또는 명시 정책.                           |
| `apps/web/src/features/card-service/hooks/use-merge-guest.ts`                | (1) 정상 흐름: dump → POST merge → clear 순으로 호출됨. (2) merge route 5xx 면 100ms 후 재시도, 최대 3회. (3) 3회 모두 실패해도 컴포넌트로 throw 하지 않고 상태만 업데이트. (4) merge 성공 후 query invalidation 이 게스트/서버 양쪽에 발생. |
| `apps/web/src/features/card-service/components/merge-guest-dialog.tsx`       | (1) 게스트 덱 0 개면 다이얼로그가 열리지 않거나 즉시 닫힘. (2) 병합 중 로딩 상태 표시. (3) 실패 시 사용자에게 보일 한국어 에러 메시지가 정확.                                                                                                |
| `apps/web/src/app/api/v1/card-decks/merge-guest/route.ts` (또는 동등 경로)   | (1) Zod 스키마 위반 입력은 400. (2) 비인증은 401. (3) 동일 게스트 덱 중복 호출 idempotency. (4) 병합 결과가 덱 목록에 즉시 반영.                                                                                                             |

### 논의 필요

- IndexedDB 테스트 환경: jsdom + fake-indexeddb 사용 vs vitest browser mode.
- merge route 의 정확한 경로명과 contract 위치 확인(grep `merge-guest`).
- 100ms backoff 가 Date 의존이라 fake timer 필요.

### 선택지

- A) `fake-indexeddb` 추가하여 jsdom 환경에서 그대로 실행
- B) vitest browser(`@vitest/browser`) 로 실제 IndexedDB 사용
- C) store 를 인터페이스 추상화하고 테스트는 in-memory 구현으로 대체

### 추천

(A) 의존성 1개 추가로 가장 빠르고 기존 vitest.config 의 jsdom 환경과 호환. 의존성 추가 비용은 최소.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 3 — 카드 학습 세션(Deck Play Session) vertical

### 작업내용

도메인 entity = `Deck Play Session`. 학습 화면 상태 머신 + 복습 결과 제출 mutation 의 클라 측 수직 슬라이스. URL 동기화, shuffle/flip 상태, mutation invalidation 이 한 세션 안에서 맞물린다.

| 파일                                                                                  | 추천 테스트 케이스                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/card-service/hooks/use-deck-play-state.ts`                     | (1) 초기 진입 시 currentIndex=0, isFlipped=false. (2) shuffle 토글 ON → 카드 순서가 동일 seed 로 결정적이어야 한다. (3) shuffle 토글 시 currentIndex 가 0 으로 리셋. (4) currentIndex 변경 시 isFlipped 자동 false. (5) URL 파라미터(card=N) 와 currentIndex 양방향 동기화. |
| `apps/web/src/features/card-service/hooks/use-card-mutations.ts` (review 부분 위주)   | (1) 게스트 모드에서 review mutation 은 guest store 만 호출. (2) 인증 모드에서 review mutation 은 API 만 호출. (3) review 성공 후 deck-detail 쿼리 invalidate. (4) optimistic update 가 있다면 실패 시 롤백.                                                                 |
| `apps/web/src/features/card-service/deck-play-screen.tsx`                             | (1) 카드가 0 장이면 빈 상태 UI 표시. (2) 마지막 카드 review 후 결과 화면 또는 처음으로 돌아간다(현재 정책 확인). (3) 키보드 스페이스/화살표 단축키 동작.                                                                                                                    |
| `apps/web/src/features/card-service/components/play-card.tsx` (현재 브랜치 수정 대상) | (1) 휴지통 아이콘 클릭 1회 → 확인 상태 진입. (2) 확인 상태에서 다시 클릭 → 실제 삭제 호출. (3) 편집 모드 동안 휴지통 숨김(현재 브랜치 수정 검증). (4) ESC 또는 외부 클릭으로 확인 상태 취소.                                                                                |

### 논의 필요

- `play-card.tsx` 는 현재 `feat/card-row-delete-ux` 브랜치에서 수정 중 → 작성 시점에 최신 상태 기준.
- shuffle seed 가 deckId 기반인지 random 인지 결정적 테스트 가능 여부.

### 선택지

- A) hook 단위 테스트는 `@testing-library/react` 의 `renderHook` 사용
- B) 컴포넌트는 jsdom + user-event 로 상호작용 테스트
- C) deck-play-screen 은 통합 테스트 1~2 개로 hook + component 합쳐 검증

### 추천

(A+B+C 조합) hook 은 단위, 작은 컴포넌트(play-card)는 단위, screen 은 통합. yeon `apps/web/src/features/typing-service` 기존 14 파일 패턴과 일치.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 4 — 카드 덱 클라이언트 CRUD vertical

### 작업내용

도메인 entity = `Card Deck` 의 클라이언트 측 수직 슬라이스. 게스트/서버 분기 hook + 덱 상세 화면. SRS 자체는 차수 1·3 에서 다루므로 여기는 CRUD 와 listing 에 집중.

| 파일                                                             | 추천 테스트 케이스                                                                                                                                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/card-service/hooks/use-deck-list.ts`      | (1) 비인증 사용자: guest store 호출, API 미호출. (2) 인증 사용자: API 호출, guest store 미호출. (3) 인증 상태 변경 시 쿼리 키 변경으로 자동 refetch. (4) API 5xx 시 에러 상태 노출.                               |
| `apps/web/src/features/card-service/hooks/use-deck-detail.ts`    | (1) deckId 가 게스트 덱 ID 형식이면 guest store. (2) 서버 덱 ID 면 API. (3) 존재하지 않으면 not-found 상태.                                                                                                       |
| `apps/web/src/features/card-service/hooks/use-deck-mutations.ts` | (1) create/rename/delete 각각 게스트/서버 분기 호출. (2) 성공 후 list 쿼리 invalidate. (3) 게스트 모드에서 createDeck 은 store 에만 영향.                                                                         |
| `apps/web/src/features/card-service/deck-detail-screen.tsx`      | (1) 비어있는 덱은 빈 상태 안내 + "카드 추가" CTA. (2) 인라인 편집 모드 토글이 단일 카드만 활성화. (3) 추가 패널이 추가 전용으로 분리된 동작 확인(최근 PR #190 회귀). (4) 덱 내보내기 CTA 클릭 시 다운로드 트리거. |

### 논의 필요

- 게스트 덱 ID 와 서버 덱 ID 형식 구분 규칙(prefix? UUID 길이?) — store 코드에서 확인.
- TanStack Query 의 staleTime/cacheTime 이 테스트 동작에 영향 → `QueryClientProvider` 래퍼 헬퍼 필요.

### 선택지

- A) hook 별 단위 테스트
- B) hook + 화면 통합 1 개로 묶음
- C) MSW(Mock Service Worker) 도입해 fetch 레벨 모킹

### 추천

(A) + 헬퍼 1개 (`renderHookWithQueryClient`). MSW 는 본 차수에선 과도하다.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 5 — 타자 덱(Typing Deck) vertical

### 작업내용

도메인 entity = `Typing Deck` 의 서버+클라 수직 슬라이스. seed 서명/검증은 멀티플레이 무결성의 출발점이므로 본 차수의 핵심.

| 파일                                                                                  | 추천 테스트 케이스                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/src/server/services/typing-decks-service.ts`                                | (1) `signTypingRaceSeed` → `verifyRaceSeedToken` round-trip 이 동일 payload 복원. (2) 서명 변조 시 verify 가 false. (3) `languageMatches` 가 'mixed' 입력에 대해 ko/en 모두 매칭. (4) 비공개 덱은 owner 만 read. (5) admin 사용자는 모든 덱 read. (6) `findDefaultDeck` 이 정적 기본 덱을 반환하고 DB 미조회. (7) 사용자 덱 리스트가 visibility + ownership 으로 필터링. |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/route.ts` (그리고 `default-detail` 등) | (1) 기본 덱 GET 200 + contract 일치(기존 테스트 보강). (2) 비공개 사용자 덱 GET 비소유자 403. (3) PATCH 본인 아님 403. (4) DELETE 본인 아님 403.                                                                                                                                                                                                                         |
| `apps/web/src/features/typing-service/use-typing-decks.ts`                            | (1) 11 개 mutation/query 가 각자 고유 query key 를 갖는다. (2) deck 생성 mutation 성공 후 list invalidate. (3) deck 삭제 후 detail 캐시 제거.                                                                                                                                                                                                                            |
| `apps/web/src/features/typing-service/typing-decks-screen.tsx`                        | (1) 3 개 탭(default/mine/public) 전환 시 표시 데이터셋 분리. (2) 생성 모달/편집 모달/삭제 다이얼로그 동시에 1개만 열림. (3) 정렬 토글 클릭 시 표시 순서 변화.                                                                                                                                                                                                            |

### 논의 필요

- HMAC secret 의 테스트용 환경 변수 주입 방식(env 모킹 vs 함수 인자).
- `typing-decks-screen` 의 sample 데이터(default deck)가 contract 와 같은 출처인지 확인.

### 선택지

- A) seed 서명/검증을 별도 작은 모듈로 추출 후 단위 테스트
- B) 현 위치에서 service 단위 테스트로 검증
- C) integration test 로 route handler 까지 한 번에 검증

### 추천

(B). 추출 리팩토링은 본 backlog 범위 밖. 추출이 필요하면 별도 backlog.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 6 — 타자 멀티플레이 방(Typing Race Room) vertical

### 작업내용

도메인 entity = `Typing Race Room`. 멀티플레이 무결성의 정점. race-server 의 Colyseus 룸 + 클라 hook + 룸 화면이 한 흐름. race-shared 는 이미 잘 테스트되어 있으므로 보강만.

| 파일                                                                | 추천 테스트 케이스                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/race-server/src/rooms/typing-race-room.ts`                    | (1) seed token 변조 입장 거부. (2) seed 가 timing-safe 하게 비교됨(타이밍 분산 검증은 단위 어려우니 함수 호출 path 만 확인). (3) 진행률 0~100 범위 외 입력은 클램프 또는 거부. (4) 라운드 시작 카운트다운 후 live 전환. (5) 모든 참여자 finish → finished 상태로 1회만 전환. |
| `apps/web/src/features/typing-service/use-race-room.ts`             | (1) 상태 전이: idle→connecting→connected. (2) 연결 실패 시 error 상태로 종결, 자동 재시도 없음(또는 정책). (3) seat 예약 호환성 처리: 구버전 서버 응답에서도 좌석 인덱스 정상 추출. (4) 메시지 송신은 connected 상태에서만 허용.                                             |
| `apps/web/src/features/typing-service/typing-room-screen.tsx`       | 기존 부분 테스트 보강. (1) waiting → countdown → live 화면 전환. (2) 본인 좌석 강조. (3) 다른 참가자 진행률 막대 동기화.                                                                                                                                                     |
| `apps/web/src/features/typing-service/typing-room-lobby-screen.tsx` | (1) 호스트만 시작 버튼 활성화. (2) 최소 인원 미달 시 시작 비활성화. (3) 준비 토글 상태 동기화.                                                                                                                                                                               |
| `packages/race-shared/src/typing-race.ts`                           | (보강) 동점 처리, 음수 입력, NaN 입력 케이스 보강. 기존 통과 케이스 유지.                                                                                                                                                                                                    |

### 논의 필요

- Colyseus 룸 단위 테스트 패턴: `@colyseus/testing` 사용 가능 여부 + 의존성 추가 필요한지.
- `useRaceRoom` 의 WebSocket 모킹 전략: `vi.mock` vs 어댑터 패턴.

### 선택지

- A) `@colyseus/testing` 추가하여 race-room 단위 테스트
- B) seed 검증/진행률 클램프만 별도 함수로 추출 → 함수 단위 테스트
- C) 룸 자체는 e2e 로만 검증, 단위 테스트는 hook 수준에서만

### 추천

(A) seed 무결성은 멀티플레이의 신뢰 기반이라 룸 레벨 테스트가 가장 가치 있다.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 7 — 타자 솔로/설정/엔진(보너스)

### 작업내용

도메인 entity = `Solo Typing Run` + `Typing Settings` + `Engine`. 핵심 흐름 외 부수 영역. 단위 테스트가 어렵고 시각 동작 검증은 Playwright 가 더 효율적이라 보너스 차수로 배치.

| 파일                                                               | 추천 테스트 케이스                                                                                                                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/features/typing-service/typing-race-solo-screen.tsx` | (1) 입력 시작 시 타이머 작동, 마지막 글자 입력 시 자동 완료. (2) 오타 카운터가 race-shared 계산과 일치. (3) 결과 화면에서 다시하기 시 상태 초기화.                     |
| `apps/web/src/features/typing-service/use-typing-settings.ts`      | (1) 초기값 기본 locale=ko, mode=race. (2) localStorage 에 영속화 후 다음 마운트에서 복원. (3) 부분 업데이트 시 다른 필드 보존. (4) locale 전환 시 sample 덱 목록 변경. |
| `packages/typing-race-engine/src/index.ts`                         | Playwright e2e 권장(`apps/web/e2e/typing-room.spec.ts` 보강). 단위 테스트 미적용.                                                                                      |

### 논의 필요

- Phaser 인스턴스 단위 테스트는 비용이 매우 높고 가치가 낮음 → e2e 로 위임 결정 확정 필요.
- localStorage 모킹: jsdom 기본 + spy 면 충분한지.

### 선택지

- A) 솔로/설정만 vitest, 엔진은 Playwright 보강 1 개
- B) 솔로/설정도 e2e 만 추가
- C) 본 차수 통째로 후순위/스킵

### 추천

(A). 7차수는 1~6차수가 모두 끝난 뒤 시간이 남을 때 진행한다.

### 사용자 방향

(빈칸이면 추천 진행)

---

## 차수 합산 검증

| 차수 | 도메인 entity                | 파일 수(대략) | 추천 케이스(대략) | 레이어                                     |
| ---- | ---------------------------- | ------------- | ----------------- | ------------------------------------------ |
| 1    | Card Deck + Card Item (서버) | 4             | 18                | server, route                              |
| 2    | Guest Merge                  | 4             | 14                | pure(store), client(hook+component), route |
| 3    | Deck Play Session            | 4             | 16                | client(hook+component+screen)              |
| 4    | Card Deck (클라)             | 4             | 13                | client(hook+screen)                        |
| 5    | Typing Deck (수직)           | 4             | 18                | server, route, client                      |
| 6    | Typing Race Room (수직)      | 5             | 18                | realtime, client, pure 보강                |
| 7    | Solo/Settings/Engine         | 3             | 10                | client, e2e                                |

총 28 파일, 약 107 추천 케이스. 7차수로 분할되어 차수당 평균 4 파일 / 15 케이스로 컨텍스트 한도 안에서 처리 가능.

## 다음 단계

본 backlog 산출 후 차수 단위로 별도 세션에서 실제 테스트 코드를 작성한다. 권장 순서: 차수 1 → 2 → 3 → 5 → 6 → 4 → 7 (서버 핵심 → 데이터 무결성 → 학습/멀티 → CRUD → 보너스). 각 차수 시작 시 `사용자 방향` 빈칸이면 `추천` 으로 진행한다.
