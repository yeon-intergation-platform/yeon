# member-tabs reorder 차수B

- 작업 목표: reorder lane의 service + service test 차수 B 구현
- 작업 범위: `MemberTabReorderService`, `MemberTabReorderServiceTests`
- 기준: controller/Next cutover는 제외, reorder source of truth를 Spring service에 고정
- 검증: backend targeted/full test, diff check, SSOT check
- 결과: `MemberTabReorderService`, `MemberTabReorderServiceTests` 추가 완료
- 검증:
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReorderServiceTests'`
  - `cd apps/backend && ./gradlew test`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`
