# 14 작업 codex 2056-2115 star-lobby-discord-webhook 완료

## 목표

- 스타 로비 키워드 매칭 결과를 Discord 알림으로 보낸다.
- Discord 전역 환경변수는 지금 비워둬도 배포가 실패하지 않게 한다.
- 운영 페이지에서 Discord 알림 저장 상태와 테스트 발송 가능 여부를 확인할 수 있게 한다.

## 변경

- Spring/Flyway가 사용자/게스트별 Discord 웹훅 URL 저장 원천을 담당하도록 `star_lobby_discord_webhooks` 테이블을 추가했다.
- 웹훅 URL은 Spring 서비스에서 보호 문자열로 저장하고, 매칭 발생 후 트랜잭션 커밋 뒤 Discord로 전송한다.
- 전역 Discord 환경변수는 필수값으로 두지 않았다. 전용 보호 키가 없으면 기존 인증 secret 또는 로컬 기본값으로 동작한다.
- Next.js는 `/api/v1/star-lobby/discord-webhook` BFF로 연결/해제/상태 조회만 전달한다.
- `/star-lobby` 화면에서 Discord 웹훅 URL 연결, 상태 확인, 해제를 제공한다.
- `/admin/star-lobby` 운영 페이지에서 환경변수 필수 여부, 보호 키 설정 여부, 등록/활성 웹훅 수, 테스트 발송을 확인할 수 있게 했다.

## 제외

- Discord 봇 OAuth/DM 구조는 후속이다.
- OCR 관측기 개발은 실제 스타크래프트 로비 스크린샷 수집 후 진행한다.

## 검증

- `./gradlew test --tests '*StarLobby*'`
- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/api-contract lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
