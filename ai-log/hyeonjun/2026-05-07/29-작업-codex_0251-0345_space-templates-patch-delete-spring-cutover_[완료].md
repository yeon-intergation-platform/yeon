# space-templates PATCH/DELETE spring cutover

- 작업 목표: space-templates PATCH/DELETE를 Spring backend로 이전하고 Next route의 기존 구현을 제거한 뒤 연동 검증까지 완료
- 작업 범위: backend write endpoint/service/repository, web spring client 확장, Next PATCH/DELETE route cutover, backend/web 테스트, runtime smoke evidence
- 기준: Next는 outward auth/BFF 유지, Spring은 내부 write source of truth 담당
- 비목표: POST/duplicate/snapshot/apply/auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.

## 검증 증거

- `cd apps/backend && ./gradlew test` 통과
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/space-templates/__tests__/route.test.ts 'src/app/api/v1/space-templates/[templateId]/__tests__/route.test.ts'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- runtime smoke: Spring `PATCH /space-templates/{templateId}` 200, `DELETE /space-templates/{templateId}` 204, DB 잔존 row 0 확인

## 추가 재발방지 메모

- Spring backend 에러 body는 top-level `message`일 수 있으므로 Next bridge parser가 nested/error 양쪽을 모두 읽어야 한다.
- security smoke는 실제 controller profile 유무에 흔들리지 않도록 테스트 전용 smoke route로 transport auth만 검증해야 한다.
