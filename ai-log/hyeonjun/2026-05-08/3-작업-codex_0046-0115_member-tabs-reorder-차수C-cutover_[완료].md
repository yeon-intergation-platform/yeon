# member-tabs reorder 차수C cutover

- 작업 목표: reorder lane의 controller + Next cutover 구현
- 작업 범위: `MemberTabReorderController`, controller test, Next reorder route를 Spring fetch로 전환, route test 추가
- 기준: reset 제외, reorder 기존 direct service 호출 제거
- 검증: backend targeted/full test, web route test, typecheck, build, runtime smoke
- 결과: `MemberTabReorderController`, controller test, Next reorder Spring fetch cutover, reorder route test 추가 완료
- 검증:
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReorderControllerTests'`
  - `cd apps/backend && ./gradlew test`
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/__tests__/route.test.ts'`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - Spring direct runtime smoke: `PATCH /spaces/{spaceId}/member-tabs/reorder` 200 + DB order 반영 확인
