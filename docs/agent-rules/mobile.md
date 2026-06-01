# Mobile — Expo 기반 React Native, 웹과 API 계약 공유

> SSOT. `.claude/rules/mobile.md`와 `.codex/skills/SHARED/mobile/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## 런타임

- Expo (React Native) — 웹 컴포넌트(`div`, `className`) 사용 불가
- React Native 컴포넌트: `View`, `Text`, `TouchableOpacity`, `StyleSheet`

## 색상 (웹과 다름 — 의도적 차이)

- 파일: `apps/mobile/src/theme/colors.ts`
- Accent: `#4B57FF` (파란색) — 웹의 검정/중립 톤과 다름, 유지할 것
- Error: `#D92D20`, Border: `#DFE3E8`

## 웹과 공유하는 것

- API 계약: `@yeon/api-contract` (동일 Zod 스키마)
- HTTP 클라이언트: `@yeon/api-client`
- 카드 서비스 feature: `apps/mobile/src/features/card-service/` ↔ 웹과 동일 API

## contract 변경 시

- `packages/api-contract/` 변경 → 모바일 소비자 경로도 확인
- mobile credential response는 웹과 별도 계약 (`auth.ts`의 mobile 분기)

## 상태 관리

- Zustand 기반 로컬 상태
- TanStack Query로 서버 상태 (웹과 동일 패턴)
