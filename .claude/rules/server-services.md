---
globs:
  - apps/web/src/server/**
---
# Server — 서비스 → 레포지터리 → DB 레이어 구조

## 레이어 규칙 (건너뛰기 금지)
```
Route Handler / Server Action
  → src/server/services/     (비즈니스 로직)
    → src/server/repositories/ (DB 쿼리)
      → src/server/db/         (Drizzle ORM + schema)
```

## 주요 경로
- 서비스: `src/server/services/` — 비즈니스 로직 여기에만
- 레포지터리: `src/server/repositories/` — DB 접근 여기에만
- 세션/인증: `src/server/auth/` — 직접 조작 금지, auth 함수 경유
- 이메일: `src/server/email/`
- Server Actions: `src/server/actions/`

## DB 변경 시 필수 절차
1. `pnpm --filter @yeon/web db:diff` — drift 사전 점검
2. `src/server/db/migrations/` 에 migration 파일 추가
3. SQLSTATE 이중 처리 확인 (PostgreSQL 에러 코드)
4. 자동 배포 파이프라인 영향 확인

## Route Handler 원칙
- 요청 파싱 + 서비스 호출 + 응답 반환만
- 비즈니스 로직을 route handler에 넣지 않음
- 인증 검사: `src/server/auth/` 함수 사용

## 테스트
- 서비스 단위 테스트: `src/server/services/__tests__/`
- DB 연동 테스트: 목 금지, 실제 DB 사용
