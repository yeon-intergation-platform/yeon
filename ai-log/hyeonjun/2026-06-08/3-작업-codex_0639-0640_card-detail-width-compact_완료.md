# 카드 덱 상세 화면 폭 축소

- 시작: 0639
- 종료: 0640
- 대상: apps/web/src/features/card-service/deck-detail-screen.tsx
- 요청: 카드 덱 상세/목록 화면의 가로 크기를 현재보다 약 0.8배로 축소

## 변경

- 웹 카드 덱 상세 화면 header/main 최대폭을 1280px에서 1024px(Tailwind max-w-5xl)로 축소했다.
- 카드 서비스 디자인 규칙(흰 배경, #111 텍스트, #e5e5e5 보더)은 유지했다.
- 모바일 패리티 레지스트리 확인 결과 screen-layout-chrome은 platform-divergent라 모바일 파일은 변경하지 않았다.

## 검증

- pnpm --filter @yeon/web lint
- pnpm --filter @yeon/web typecheck
- git diff --check
