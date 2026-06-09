# SOLID SRP 후속 40 — 모바일 카드 온보딩 게이트 책임 분리

## 목표

- 백로그 195번(`card-onboarding-gate.tsx`)의 큰 파일 책임 분리 항목을 완료한다.
- 온보딩 화면의 섹션 렌더링/스타일 책임을 별도 파일로 분리해 게이트 파일은 상태와 인증 액션 조정에 집중한다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- `yeon-4`에서 `origin/main` 기반 브랜치 `codex/solid-exception-followup-40` 생성.
- `card-onboarding-gate-sections.tsx`를 추가해 hero/social/divider/secondary/guest/email sheet 렌더링 책임을 분리했다.
- `card-onboarding-gate-styles.ts`를 추가해 온보딩 게이트 스타일과 브랜드 버튼 상수를 분리했다.
- `card-onboarding-gate.tsx`는 인증 상태와 액션 조정 중심으로 축소했다.
- 백로그 195번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint` 통과.
- `CI=true pnpm --filter @yeon/mobile typecheck` 통과.
- `CI=true pnpm verify:parity` 통과.
- `git diff --check` 통과.
- 백로그 집계: 300개 중 완료 178개, 다음 미완료 196번.

## 결과

- 모바일 카드 온보딩 게이트 파일은 157라인으로 축소됐다.
- 섹션 렌더링과 스타일 책임이 별도 파일로 이동했다.
