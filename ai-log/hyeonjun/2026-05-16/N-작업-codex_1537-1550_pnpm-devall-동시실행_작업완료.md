# 작업 로그

- 주제: dev:all에서 익명친구/카드서비스 모바일 동시 실행 구성
- 시작: 2026-05-16 15:37
- 종료: 2026-05-16 15:50
- 상태: 완료
- 내용:
  - `scripts/dev-all.mjs`에서 모바일 서비스를 두 개로 분리:
    - 익명친구: `EXPO_PUBLIC_MOBILE_VARIANT=anonymous`, 기본 포트 8081
    - 카드서비스: `EXPO_PUBLIC_MOBILE_VARIANT=card`, 기본 포트 8082
  - `MOBILE_CARD_PORT` 환경변수로 카드서비스 포트 커스터마이즈 가능하도록 반영
  - `apps/mobile/README.md`에 `pnpm dev:all`이 2개 변이를 동시 기동함을 문서화
