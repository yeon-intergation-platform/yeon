# space-templates snapshot spring cutover

- 작업 목표: space snapshot-template 경로를 Spring backend로 이전하고 Next route의 기존 snapshotSpaceAsTemplate 직접 호출을 제거한 뒤 연동 검증까지 완료
- 작업 범위: backend snapshot endpoint/service/repository, web spring client/route cutover, 테스트/verify, 필요시 runtime smoke
- 기준: Next는 outward auth/BFF 유지, Spring은 snapshot create source of truth 담당
- 비목표: apply/auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.

## 검증 증거

- `cd apps/backend && ./gradlew test` 통과
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/space-templates/__tests__/route.test.ts 'src/app/api/v1/space-templates/[templateId]/__tests__/route.test.ts' 'src/app/api/v1/space-templates/[templateId]/duplicate/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/snapshot-template/__tests__/route.test.ts'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- runtime smoke: public space/tab/field fixture 생성 -> Spring `POST /spaces/{spaceId}/snapshot-template` 201 -> detail GET에서 tabs/fields 반영 확인 -> cleanup DELETE 204 -> DB 잔존 row 0 확인

## 추가 재발방지 메모

- internal token bridge는 특정 prefix 하드코딩보다 현재 Spring internal app 전체(non-actuator)에 적용하는 편이 새 cutover 경로 누락을 줄인다.
- snapshot smoke처럼 public data를 읽고 yeon_backend 템플릿을 쓰는 경우 FK 대상 스키마(public/yeon_backend)를 각각 확인하고 fixture를 양쪽에 넣어야 한다.
