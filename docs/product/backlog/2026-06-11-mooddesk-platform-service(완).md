# MoodDesk 마음 저널 — 플랫폼 5번째 서비스 카드 추가

## 배경

영상 배경 + HTML UI 레이어로 만든 감성 저널 정적 사이트(MoodDesk)를 yeon 플랫폼 홈의 서비스 카드로 노출한다. 기존 4종(타자·카드·커뮤니티·Discord AI)에 이어 5번째 서비스로 추가한다.

## 1차: 정적 호스팅 + 서비스 카드 등록

### 작업내용

- `apps/web/public/mooddesk/`에 정적 자산 배치(index.html, src/styles.css, src/main.js, src/assets/mood-room-loop.mp4, src/assets/cards/\*.png).
- `apps/web/src/lib/platform-services.ts`의 `PLATFORM_SERVICES`에 `mooddesk` descriptor 추가(`status: live`, `listedInPlatformHome: true`, `accessPolicy: anonymous`). 카드 개수("현재 N가지")는 배열 길이로 자동 반영.
- `apps/web/src/features/landing-home/landing-home.tsx`: 진입 href가 정적 `*.html`이면 클라이언트 라우팅 대상이 아니므로 일반 `<a>`로 렌더하도록 분기 추가(NextLink 우회).

### 논의 필요

- 서비스 진입 도메인. 현재는 같은 오리진 정적 경로(`/mooddesk/index.html`). 타 서비스처럼 `mooddesk.yeon.world` 서브도메인으로 분리할지.
- 카드 타이틀. 현재 "마음 저널"(브랜드 표기 MoodDesk). 한글 카드 톤에 맞춰 한글 채택.

### 선택지

- A. 같은 오리진 정적 호스팅(`/mooddesk/index.html`) — 인프라 추가 없음, 즉시 배포. (채택)
- B. 전용 서브도메인 분리 — 다른 서비스와 일관되나 배포/DNS 추가 필요.

### 추천

A로 우선 출시하고, 트래픽/요구가 생기면 B로 승격.

### 사용자 방향

(비어 있으면 추천대로 진행)

## 검증

- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `vitest run src/lib/__tests__/platform-services.test.ts` 4/4 통과.
- 로컬 web dev에서 정적 자산 200 확인(`/mooddesk/index.html`, `src/styles.css`, `src/main.js`, `src/assets/mood-room-loop.mp4`, `src/assets/cards/note.png`).
- 랜딩 `/` 시각 확인은 root-auth Spring(8081) 기동이 필요(web 단독 기동 시 dev-login fetch 실패로 500). 카드 노출 로직 자체는 백엔드와 무관(정적 descriptor).
