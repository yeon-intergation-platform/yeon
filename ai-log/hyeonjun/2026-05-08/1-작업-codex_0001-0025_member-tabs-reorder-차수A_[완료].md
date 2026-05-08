# member-tabs reorder 차수A

- 작업 목표: reorder lane의 dto + repository + repository test 차수 A 구현
- 작업 범위: `ReorderMemberTabsRequest`, `OkResponse`, `MemberTabReorderRepository`, `MemberTabReorderRepositoryTests`
- 기준: reset/Next cutover는 제외, repository 단계 검증만 먼저 확보
- 검증: backend targeted/full test, diff check, SSOT check
- 결과: reorder dto 2개와 `MemberTabReorderRepository`, repository integration test 추가 완료
- 검증:
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReorderRepositoryTests'`
  - `cd apps/backend && ./gradlew test`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`
