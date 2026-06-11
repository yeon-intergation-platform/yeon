# MoodDesk 마음 저널 — 플랫폼 5번째 서비스 카드 추가 (완료)

- 브랜치: `feat/mooddesk-service` (origin/main 기준)
- 워크트리: yeon-2

## 한 일

1. 정적 자산 배치: `apps/web/public/mooddesk/`
   - index.html, src/styles.css, src/main.js
   - src/assets/mood-room-loop.mp4 (배경 루프 영상, 워터마크 delogo 처리본)
   - src/assets/cards/\*.png (rembg로 배경 제거한 카드 11종: note/sound/quote/color/week + 감정 스티커 6종)
2. `platform-services.ts`: `mooddesk` descriptor 추가 → 홈 카드 5번째, "현재 5가지 서비스" 자동 반영.
3. `landing-home.tsx`: 정적 `*.html` 진입은 일반 `<a>`로 렌더(NextLink 클라이언트 라우팅 우회). 기존 서비스 링크는 미변경.

## 검증

- typecheck / lint 통과.
- platform-services 단위테스트 4/4 통과.
- 정적 자산 HTTP 200 (html/css/js/mp4/png).
- 랜딩 `/`는 root-auth Spring(8081) 미기동 시 dev-login fetch로 500 — 기존 동작이며 카드 로직과 무관.

## 남은 일 / 리스크

- 랜딩 카드 실제 렌더 시각 확인은 backend 포함 환경(dev:all 또는 배포)에서 수행.
- 배포 시 yeon.world에서 `publicHref`(`/mooddesk/index.html`) 동일 오리진으로 동작.
- 후속: 전용 서브도메인 승격 여부 결정(backlog 참고).
