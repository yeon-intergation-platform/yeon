# 카드 복습 모드 정답보기 게이트 정비

## 요청

- 복습 모드는 처음 문제와 정답보기 버튼만 표시.
- 정답보기 후 문제/정답/어려움·좋음·쉬움 액션 표시.
- 우측 상단 `자기평가형 복습` 문구 제거 후 스킵 버튼 배치.
- PR 없이 main 직접 반영.

## 진행

- 작업 전 `git status --short --branch` 확인: main clean.
- 카드 서비스 규칙과 web/mobile 패리티 레지스트리 확인.
- 웹 복습 카드 우측 상단 문구 제거, 정답보기 라벨 적용.
- 모바일 복습 정답보기 라벨 동기화.
- 모바일 typecheck 중 카드방 상세 경로 Href 단언 기존 오류가 검증을 막아 SSOT 템플릿 유지 + unknown 경유 단언으로 최소 수정.

## 변경 파일

- `apps/web/src/features/card-service/components/deck-play-review-mode-card.tsx`
- `apps/web/src/features/card-service/deck-play-screen.tsx`
- `apps/mobile/src/features/card-service/card-service-copy.ts`
- `apps/mobile/src/features/card-service/rooms/card-room-lobby-screen.tsx`
- `docs/product/backlog/card-review-answer-reveal-gate-20260608.md`

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm verify:parity` 통과
- `pnpm build:web` 통과
- `git diff --check` 통과

## 결과

- 복습 모드 초기 화면은 문제와 `정답보기` 버튼만 표시하는 기존 상태 게이트를 유지한다.
- `정답보기` 후 정답과 어려움/좋음/쉬움 버튼이 표시된다.
- 웹 우측 상단 `자기평가형 복습` 문구를 제거하고 `스킵` 버튼만 남겼다.
