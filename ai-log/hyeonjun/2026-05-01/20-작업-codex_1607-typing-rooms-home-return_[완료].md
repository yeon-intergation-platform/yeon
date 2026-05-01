# 작업 로그 — 타자 서비스 헤더 규격 통일

- 시작: 2026-05-01 16:07 KST
- 브랜치: `fix/typing-rooms-home-return`
- 문제:
  - `/typing-service/rooms`에서 `/typing-service`로 돌아가는 경로가 명확하지 않다.
  - 타자방, 연습덱 관리, 레이스, 메인 화면의 헤더 규격이 서로 다르다.
- 목표:
  - 타자방 로비처럼 full-width, 76px 높이, 큰 좌측 브랜드, 우측 주요 경로 내비게이션 구조로 통일한다.
  - 모든 주요 타자 서비스 화면에서 `타자연습 홈`, `타자방`, `연습 덱`, `레이스` 경로가 보이게 한다.
  - 덱/방/레이스 화면은 고유 타이틀만 바꾸고 헤더 규격은 공유한다.

## 완료 내용

- `TypingServiceHeader` 공통 컴포넌트를 추가했다.
- `/typing-service` 메인, `/typing-service/rooms`, `/typing-service/decks`, `/typing-service/decks/[deckId]`, 레이스 솔로/멀티/연결 화면, 방 대기 화면에 공통 헤더를 적용했다.
- 로비 기준처럼 `max-width`에 갇힌 헤더/주요 컨테이너를 풀고 `px-6 md:px-10` 기반 full-width 구조로 맞췄다.
- `/typing-service/rooms`는 공통 nav의 `타자연습 홈`으로 홈 복귀 경로를 제공한다.
- 덱 라이브러리는 모바일에서도 생성 CTA가 사라지지 않도록 본문 CTA 그룹에 `새 덱 만들기`를 유지했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `rm -rf apps/web/.next && pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
