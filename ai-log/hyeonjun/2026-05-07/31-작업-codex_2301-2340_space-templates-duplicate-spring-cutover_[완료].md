# space-templates duplicate spring cutover

- 작업 목표: space-templates duplicate 경로를 Spring backend로 이전하고 Next route의 기존 duplicateTemplate 직접 호출을 제거한 뒤 연동 검증까지 완료
- 작업 범위: backend duplicate endpoint/service/repository, web spring client/route cutover, 테스트/verify, 필요시 runtime smoke
- 기준: Next는 outward auth/BFF 유지, Spring은 template duplicate source of truth 담당
- 비목표: snapshot/apply/auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.

## 검증 증거

- `cd apps/backend && ./gradlew test` 통과
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/space-templates/__tests__/route.test.ts 'src/app/api/v1/space-templates/[templateId]/__tests__/route.test.ts' 'src/app/api/v1/space-templates/[templateId]/duplicate/__tests__/route.test.ts'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- runtime smoke: Spring source template POST 201, duplicate POST 201, same-user list에 원본/복제본 모두 반영, cleanup DELETE 204/204, DB 잔존 row 0 확인

## 추가 재발방지 메모

- duplicate는 read 접근 규칙과 write 저장 규칙이 섞이므로 `findAccessibleTemplate` 같은 별도 경계를 repository에 분명히 둬야 한다.
- duplicate smoke는 source/duplicate 둘 다 cleanup하지 않으면 다음 반복에서 목록 검증이 오염될 수 있다.
