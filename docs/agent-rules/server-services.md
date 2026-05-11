# Server — Spring 백엔드 전용 원칙과 Next 전환 경계

> SSOT. `.claude/rules/server-services.md`와 `.codex/skills/SHARED/server-services/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## 백엔드 역할의 원천

- 신규 백엔드 역할은 Spring(`apps/backend`)만 담당한다.
- Next.js(`apps/web`)는 신규 비즈니스 로직, DB 쓰기/조회 소유권, 권한 판정, 세션/인증 상태 변경, 장기 상태 원천을 추가하지 않는다.
- `apps/web/src/app/api/**/route.ts`는 전환 기간 동안 요청 파싱, 쿠키/헤더 브리지, Spring 호출, 응답 매핑만 수행한다.
- `apps/web/src/server/**`에 남아 있는 서비스/DB/인증 로직은 Spring 이전 전까지의 legacy/migration debt로 취급하며, 기능 확장 시 먼저 Spring 이관 계획을 세운다.
- 예외적으로 파일 다운로드 프록시, OAuth callback 브리지, Next 렌더링에 필요한 최소 세션 조회는 허용하되 도메인 규칙의 source of truth가 되어서는 안 된다.

## 레이어 규칙 (건너뛰기 금지)

```
Spring Controller
  → Spring Service      (비즈니스 로직)
    → Spring Repository (DB 쿼리)
      → DB schema/migration
```

## 주요 경로

- Spring 앱: `apps/backend/src/main/java/world/yeon/backend/`
- Spring 서비스: `{domain}/service/` — 비즈니스 로직 기본 위치
- Spring 레포지터리: `{domain}/repository/` — DB 접근 기본 위치
- Web Spring client: `apps/web/src/server/*-spring-client.ts` — Next route에서 Spring을 호출하는 얇은 어댑터
- Legacy web server code: `apps/web/src/server/services/`, `apps/web/src/server/repositories/`, `apps/web/src/server/db/`, `apps/web/src/server/auth/` — 신규 확장 금지, 이관 후보

## DB 변경 시 필수 절차

1. Spring/Flyway 또는 해당 백엔드 마이그레이션 절차를 우선 사용한다.
2. legacy Drizzle 스키마를 건드리는 경우에만 `pnpm --filter @yeon/web db:diff`로 drift를 사전 점검한다.
3. `apps/web/src/server/db/migrations/` 신규 추가는 Spring 이전 계획 없이 진행하지 않는다.
4. SQLSTATE 이중 처리 확인 (PostgreSQL 에러 코드)
5. 자동 배포 파이프라인 영향 확인

## Route Handler 원칙

- 요청 파싱 + 서비스 호출 + 응답 반환만
- 비즈니스 로직을 route handler에 넣지 않음
- 기본 호출 대상은 Spring client(`*-spring-client.ts`)다.
- 인증 검사는 Spring/공용 계약으로 이관하는 것을 우선한다. 기존 `src/server/auth/` 함수 사용은 legacy 호환 경계에서만 허용한다.

## 테스트

- 신규 백엔드 단위/통합 테스트는 `apps/backend`에 작성한다.
- Next route 테스트는 Spring client 호출/응답 매핑과 쿠키/헤더 브리지만 검증한다.
- legacy DB 연동 테스트는 목 금지, 실제 DB 사용 원칙을 유지한다.
