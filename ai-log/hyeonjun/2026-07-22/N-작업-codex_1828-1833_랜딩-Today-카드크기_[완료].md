# 랜딩 YEON Today 카드 크기 정합성 수정

- 작업자: codex
- 상태: 완료
- 시작: 2026-07-22 18:28 KST
- 종료: 2026-07-22 18:33 KST
- 대상: `/` 랜딩 5번 YEON Today 카드
- 백로그: `docs/product/backlog/2026-07-22-landing-frame-break-service-card-16.md`

## 확인된 원인

- 게스트의 Today 카드는 `BUTTON`, 옆 Discord 카드는 `A`로 렌더링된다.
- Today wrapper에 `YeonButton` 기본 `px-4 py-2`, `items-center`, `justify-center`, `font-semibold`가 남는다.
- 1228px에서 Today 이미지 폭은 274.17px, Discord 이미지 폭은 364.66px다.

## 작업 방향

- 이미지나 카드 내부 마크업은 변경하지 않는다.
- 프레임브레이크 카드 wrapper에서 버튼 기본 패딩·정렬·본문 굵기만 명시적으로 초기화한다.
- 링크 카드와 로그인 게이트 버튼 카드가 같은 계산 스타일을 갖게 한다.
- Playwright 전후 화면과 계산 스타일, 로그인 모달 동작을 확인한다.

## 디자인 점검

- `design-workflow`: 상태별 wrapper 차이를 제거하고 기존 카드 위계를 보존한다.
- `ui-ux-pro-max`: 375px·1024px·1440px 반응형 및 focus 가시성 기준을 적용한다.
- 21st refiner: API 키 오류로 결과를 받지 못해 실제 DOM 계산값을 기준으로 수정한다.
- `design-eye`: 빈 공간, 이미지 폭, 본문 굵기, CTA 위치가 인접 카드와 동일한지 확인한다.

## 작업 결과

- 프레임브레이크 카드 공통 class에 `!p-0`, `!items-stretch`, `!justify-start`, `!font-normal`을 추가했다.
- `YeonButton`의 기본 패딩·중앙 정렬·semibold 상속만 카드 경계에서 초기화하고 이미지와 내부 마크업은 유지했다.
- 동일한 class가 링크와 버튼에 적용돼 인증 상태에 따른 시각적 차이가 사라졌다.

## 시각 검증

- 경로: `ai-log/hyeonjun/2026-07-22/landing-today-card-size-screenshots/`
- 375px: Today·Discord 외곽 327×426.59px, 이미지 325×192px로 일치, 가로 스크롤 없음.
- 1040px: 외곽 304×442.59px, 이미지 302×208px로 일치, 가로 스크롤 없음.
- 1228px: Today 이미지 274.17px → 364.67px, 외곽 높이 458.59px → 442.59px로 Discord와 일치.
- 1440px: 외곽 폭 424px, 이미지 422×208px로 일치. 설명 줄 수에 따른 자연스러운 카드 높이 차이만 유지.
- Today 클릭 시 공통 로그인 dialog 노출을 확인했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm verify:parity` 통과 — 검증 개념 14종, registry 개념 29종
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- `pnpm --filter @yeon/web build` 통과 — Spring 미기동 시 내장 콘텐츠 fallback 경고만 발생
