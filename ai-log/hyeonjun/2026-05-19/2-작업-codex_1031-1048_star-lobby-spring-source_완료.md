# 스타 로비 Spring source of truth 작업 로그

- 시작: 2026-05-19 10:31 KST
- 브랜치: `feat/star-lobby-keyword-alert`
- 목표: 키워드 기반 스타 로비 MVP의 관측 방/알림 조건 저장과 매칭 판단을 Spring 백엔드로 추가한다.

## 진행

- Flyway V9 스타 로비 테이블 추가
- Spring `star_lobby` controller/service/repository/dto 추가
- 관측 snapshot 수집, 최근 방 조회, 알림 조건 생성/목록 API 추가
- 포함/제외 키워드와 인원 조건 기반 매칭 저장 로직 추가
- Spring controller/service 테스트 추가

## 검증

- `pnpm --filter @yeon/api-contract typecheck` 통과
- `pnpm --filter @yeon/api-contract lint` 통과
- `./gradlew test --tests '*StarLobby*'` 통과 (`apps/backend`)
- `git diff --check` 통과
