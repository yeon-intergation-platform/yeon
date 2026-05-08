# space-templates POST spring cutover

- 작업 목표: space-templates POST 생성 경로를 Spring backend로 이전하고 Next route의 기존 createTemplate 직접 호출을 제거한 뒤 연동 검증까지 완료
- 작업 범위: backend create endpoint/service/repository, request validation, web spring client/create route 전환, 테스트/verify, 필요시 runtime smoke
- 기준: Next는 outward auth/BFF 유지, Spring은 template create source of truth 담당
- 비목표: duplicate/snapshot/apply/auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.

## 검증 증거

- `cd apps/backend && ./gradlew test` 통과
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/space-templates/__tests__/route.test.ts 'src/app/api/v1/space-templates/[templateId]/__tests__/route.test.ts'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- runtime smoke: Spring `POST /space-templates` 201 생성, 같은 사용자 `GET /space-templates` 목록 반영, `DELETE /space-templates/{templateId}` 204, DB 잔존 row 0 확인

## 추가 재발방지 메모

- create validation source of truth를 Spring으로 옮기는 차수에서는 Next route의 상세 schema를 유지하지 말고 JSON parse만 남겨야 중복 규칙 드리프트를 막을 수 있다.
- JPA entity를 write lane에서 직접 생성해야 하면 protected 생성자/불변 필드 설계가 write service 요구와 충돌하지 않는지 먼저 확인해야 한다.
