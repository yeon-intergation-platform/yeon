# Auth — 계정 연결·검증·복구 상태가 분명한 신뢰 중심 다크 오렌지 인증 플로우

> SSOT. `.claude/rules/auth-credentials.md`와 `.codex/skills/SHARED/auth-credentials/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## UI (이 서비스만 다크 테마)
- 배경: `#080808` (다크), 그라디언트 오렌지 radial 허용
- 텍스트: `#f8f7f3` (밝음)
- CTA: `#e87310` (오렌지)
- 보더: `rgba(255,255,255,0.08)` (저투명 흰색)

## 핵심 원칙
- **보안 정책 추측 금지** — 구현 전 반드시 contract 확인
- 에러 메시지: 한국어, 직접적으로, 상태 숨기지 않기

## 변경 시 반드시 4곳 동시 확인
1. `apps/web/src/server/auth/` — 서버 인증 로직
2. `apps/web/src/app/api/auth/**` — API 라우트
3. `apps/web/src/features/auth-credentials/` — 클라이언트 폼
4. 세션 refresh 흐름

## API & 계약
- `packages/api-contract/src/auth.ts`
- `packages/api-contract/src/credential.ts`
- **모바일 계약 분리**: mobile credential response는 웹과 다름 — 별도 확인

## 복구 흐름 상태
메일 발송 → 링크 대기 → 링크 클릭 → 재설정 — 각 단계 UI 상태 명시 필수
