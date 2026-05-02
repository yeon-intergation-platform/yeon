---
name: service-context-auth-credential
description: 인증/credential 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. 로그인, 회원가입, 이메일 인증, 비밀번호 재설정, social auth/session 작업에 사용한다.
user_invocable: true
---

# service-context-auth-credential

인증/credential lane을 맡았으면 이 스킬을 먼저 읽는다. 인증은 보안과 사용자 복구 흐름이 중요하므로 UI, API contract, server auth 경계를 함께 확인한다.

## 한 줄 서비스 톤

**계정 연결·검증·복구 상태가 분명한, 신뢰 중심의 다크 오렌지 인증 플로우.**

## 근거 상태

- 기존 근거 부족: 별도 인증 제품/디자인 문서는 확인되지 않았다.
- 현재 구현과 API contract가 주 근거다. 보안/정책을 추측하지 않는다.

## 라우팅 번들

- Auth routes: `apps/web/src/app/auth/**`
- Credential feature: `apps/web/src/features/auth-credentials/**`
- API routes: `apps/web/src/app/api/auth/**`, `apps/web/src/app/api/v1/auth/**`
- Web auth libs/server: `apps/web/src/lib/auth/**`, `apps/web/src/server/auth/**`
- Contracts: `packages/api-contract/src/auth.ts`, `packages/api-contract/src/credential.ts`
- Deployment/security docs when token/session behavior changes: `docs/deployment/oauth-token-encryption-rollout.md`

## 먼저 읽을 근거

1. `packages/api-contract/src/credential.ts` — email/password policy and response contracts.
2. `packages/api-contract/src/auth.ts` — session/user DTO contract.
3. `apps/web/src/features/auth-credentials/**` — form states and user-facing copy.
4. `apps/web/src/server/auth/**` and `apps/web/src/app/api/auth/**` — session/provider behavior.

## 기능 기준

- 주요 흐름은 로그인, 회원가입, 이메일 인증, 인증 메일 재발송, 비밀번호 재설정, 소셜 계정 연결/충돌 안내다.
- password policy와 error message는 contract/server/client가 일치해야 한다.
- 계정 연결/인증 실패/메일 발송 실패 같은 복구 상태를 숨기지 않는다.
- mobile credential response처럼 public contract가 갈라지는 경우 web/mobile 영향 범위를 확인한다.

## 디자인 기준

- 현재 credential UI는 어두운 표면, 오렌지 CTA/focus, 높은 대비의 form 중심 톤이다.
- 인증 화면에서는 장식보다 신뢰, 상태 설명, 복구 액션이 먼저 보여야 한다.
- 오류/성공/메일 발송/링크 필요 상태는 명확한 한국어 문장과 role/status 접근성을 유지한다.

## 팀 작업 체크

- 인증 변경은 API contract, server auth, client forms, session refresh 영향을 함께 본다.
- 보안/토큰/암호화/쿠키 변경은 별도 검증 범위를 넓힌다.
- 정책이 문서화되지 않은 부분은 새 정책을 발명하지 말고 기존 구현과 contract에 맞춘다.
