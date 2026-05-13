### 작업 내역 (2026-05-13)

- 차수: 커뮤니티/피드 연동 백엔드 연결 실패 대응
  - 작업내용: 커뮤니티 presence heartbeat의 실패를 감싸고(`unhandledRejection` 방지), Spring fetch 경로에서 커넥션 실패를 503 커스텀 예외로 래핑해 API 라우트가 500 대신 의도한 오류 응답을 반환하도록 함.
  - 논의 필요: 없음
  - 선택지: 연결 실패 시 empty fallback vs 503 응답
  - 추천: 503 응답 유지
  - 사용자 방향: 추천 적용
  - 실행 상태: 완료
- 대상 파일:
  - `apps/web/src/features/community/components/community-presence-tracker.tsx`
  - `apps/web/src/server/community-chat-spring-client.ts`
  - `apps/web/src/server/chat-service-feed-spring-client.ts`
  - `docs/product/backlog/community-local-backend-connection-error-handling-2026-05-13.md`
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
