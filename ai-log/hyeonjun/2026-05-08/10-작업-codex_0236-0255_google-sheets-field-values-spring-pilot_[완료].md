# google-sheets field-values spring pilot

- 작업 목표: `google-sheets-export-service.ts`에 남아 있던 `member-field-values-service` direct read/write 의존을 Spring 기반으로 치환한다.
- 작업 범위: import 경로의 current values read / bulk upsert write 전환, dead helper 정리, 테스트/검증, 재발방지 기록.
- 기준: Next는 import/export coordinator만 남고, member field values source of truth는 Spring으로 모은다.
- 비목표: google-sheets integration 전체의 Spring 이전, auth/session migration.

## 이번에 한 일
- backlog / architecture 문서 추가
  - `docs/product/backlog/spring-google-sheets-field-values-pilot.md`
  - `docs/architecture/spring-google-sheets-field-values-pilot-inventory.md`
  - `docs/architecture/README.md` 갱신
- `google-sheets-export-service.ts` cutover
  - direct `getFieldValuesForDefinitions(...)` 제거
  - direct `bulkUpsertFieldValues(...)` 제거
  - Spring client 기반으로 치환
    - `fetchMemberFieldValuesFromSpring(...)`
    - `bulkUpsertMemberFieldValuesInSpring(...)`
- diff key 보정
  - current payload 비교를 internal definition id가 아니라 `definition.publicId` 기준으로 맞춤
- dead Next backend 로직 정리
  - `apps/web/src/server/services/member-field-values-service.ts`를 `buildValueColumns(...)`만 남는 최소 helper로 축소
  - dead read/write/upsert/bulk exports 제거
  - `apps/web/src/server/services/__tests__/member-field-values-service.test.ts`를 `buildValueColumns` 중심 테스트로 축소

## 실제로 제거한 Next direct 로직
- `apps/web/src/server/services/google-sheets-export-service.ts`
  - direct `getFieldValuesForDefinitions(...)` 제거
  - direct `bulkUpsertFieldValues(...)` 제거
- `apps/web/src/server/services/member-field-values-service.ts`
  - dead `getFieldValues(...)` 제거
  - dead `getFieldValuesForDefinitions(...)` 제거
  - dead `upsertFieldValue(...)` 제거
  - dead `bulkUpsertFieldValues(...)` 제거
- 확인: repo 전체 `rg` 기준 위 direct 함수 호출 no matches

## 검증
- tests
  - `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/member-field-values-service.test.ts' 'src/server/services/__tests__/google-sheets-export-service.test.ts'` 통과
- type/build
  - `pnpm --filter @yeon/web typecheck` 통과
  - `pnpm --filter @yeon/web build` 통과
- direct 제거 확인
  - `rg -n "bulkUpsertFieldValues\(|getFieldValuesForDefinitions\(|getFieldValues\(|upsertFieldValue\(" apps/web/src` → no matches
  - `rg -n "member-field-values-service" apps/web/src` 결과는 `buildValueColumns` import와 관련 테스트만 남음

## 남은 것 / 다음 작업
- `google-sheets-export-service.ts`는 여전히 Next 서버 오케스트레이션/DB join 로직이 크다.
- 특히 `buildSpaceExportRows(...)`는 `members/member_field_definitions/member_field_values`를 직접 읽는다.
- 다음 lane 목표:
  - google-sheets integration 전체의 Spring boundary inventory
  - export row builder / import coordinator 중 무엇을 먼저 Spring으로 분리할지 결정
