# vitest 회귀 12건 정리 (그룹 B+C+D+E)

## 목적

`pnpm --filter @yeon/web test:coverage` 풀 실행 시 회귀 82건 중 그룹 B(typing-decks fixture), C(cloud-oauth callback URI), D(analyze-route mock), E(use-import-draft-recovery) 4묶음 = 12건을 정리. 그룹 A(~70건, schema mock transitive)는 별도 세션으로 분리.

## 결과

- 13 failed test files / 82 failed tests → **7 failed test files / 70 failed tests** (정확히 12건 감소)
- 그룹 B+C+D+E 영역 vitest: **6 파일 / 16 테스트 모두 PASS**
- typecheck / lint: exit 0

## 수정 파일 (7개)

### 그룹 B — typing-decks fixture (8건)

- `apps/web/src/server/services/__tests__/typing-decks-service.test.ts` — `EXPECTED_DEFAULT_DECKS` title `진달래꽃 (시집)` → `진달래꽃`, `손자병법 / The Art of War` → `The Art of War`
- `apps/web/src/app/api/v1/typing-decks/__tests__/route.test.ts` — 동일
- `apps/web/src/app/api/v1/typing-decks/[deckId]/__tests__/default-detail-route.test.ts` — 동일

근거: `default-typing-deck-sources.ts`의 `title` 필드가 source of truth. `(시집)`은 `sourceWorkTitle` 필드에만, 영어 deck은 영어 단독이 일관.

### 그룹 C — cloud-oauth callback URI (2건)

- `apps/web/src/server/services/googledrive-service.ts` — `getRedirectUri()`에서 `resolveApiHrefForBasePath` 호출 제거, `DEFAULT_COUNSELING_SERVICE_BASE_PATH` 직접 prefix 사용
- `apps/web/src/server/services/onedrive-service.ts` — 동일

근거: `resolveApiHrefForBasePath`는 same-app routing helper로 `appBasePath === DEFAULT_COUNSELING_SERVICE_BASE_PATH`이면 prefix 미적용 (의도된 동작). OAuth redirect는 외부 absolute URL이라 prefix 필수. AGENTS.md OAuth URI 규칙(`/counseling-service/api/v1/integrations/<provider>/auth/callback`) 준수.

### 그룹 D — analyze-route test mock (1건)

- `apps/web/src/app/api/v1/integrations/local/__tests__/analyze-route.test.ts` — `mockGetImportDraftBuffer` row에 `publicId: "draft-1"` 누락 추가

근거: production이 `draft.row.publicId`를 사용하는데 test mock의 row 객체에 publicId가 없어 `activeDraftId === undefined` → 500 반환. test mock이 production schema를 안 따라간 회귀.

### 그룹 E — use-import-draft-recovery (1건)

- `apps/web/src/features/cloud-import/hooks/use-import-draft-recovery.ts` — `useEffect`에 `initialDraftId` 미명시 시 `localStorage.getItem(storageKey)` fallback 검사 추가

근거: 테스트 "복구 실패 시 저장된 draft 상태를 비운다"는 initialDraftId 미명시 + localStorage 사전 저장 시 hook이 stored draft를 검사하고 loadDraft가 null 반환하면 비우는 동작 기대. fallback 분기가 회귀로 빠진 상태였음.

## 비포함 (의도적)

- **그룹 A (schema mock transitive ~70건)** — `member-fields-service`(47건), `members-service`(8건), `member-field-values-service`(0 test, 모듈 로드 실패), `import-drafts-service`, `counseling-records-service`(7건), `space-templates-service`(4건), `student-board-service`(4건)의 schema mock이 service의 transitive 의존(`spaces`, `memberTabDefinitions`, `counselingRecords` 등)을 안 노출해 cascade fail. 각 테스트 파일에 `vi.mock("../spaces-service", ...)`/`vi.mock("../member-tabs-service", ...)` 등 의존 격리 mock 추가가 필요한 큰 작업이라 별도 세션으로 분리.
- 의심 root: `#194` "워킹 트리 누적 변경 동기화" commit에서 service에 transitive 의존이 추가되면서 testing 인프라가 따라가지 못한 회귀.

## 남은 70건 다음 세션 메모

- `member-fields-service.test.ts` (47건) — spaces-service + member-tabs-service mock 추가하면 일괄 회복 추정
- 동일 패턴: `members-service`, `space-templates-service`, `student-board-service`, `counseling-records-service`, `import-drafts-service`, `member-field-values-service`

## 시간

시작 0115 ~ 종료 0120
