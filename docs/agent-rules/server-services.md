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

## Persistence / DDD 원칙

- 기본 persistence 방식은 `JdbcTemplate` 또는 명시 SQL 기반 Repository다.
- 신규 도메인 구현을 위해 JPA Entity를 기본 도입하지 않는다.
- DDD는 JPA 사용 여부가 아니라 도메인 규칙, 상태 전이, 불변조건을 Spring 백엔드 안에서 명시적으로 보호하는 방식으로 적용한다.
- 핵심 도메인에서도 우선순위는 다음 순서다.
  1. raw string 상태값/역할값을 도메인 타입 또는 상수로 모은다.
  2. 상태 전이와 권한/역할 검증을 의미 있는 메서드로 분리한다.
  3. Service는 트랜잭션과 유스케이스 순서를 담당하고, 규칙은 작은 정책/도메인 메서드로 모은다.
  4. Repository는 SQL과 저장소 경계를 명확히 하고, Service가 DB 세부 구현에 끌려가지 않게 row/mapper/helper 경계를 둔다.
  5. 상태 전이 규칙은 테스트로 고정한다.
- JPA 신규 도입은 예외적으로만 허용한다. 도입 전 아래 조건을 모두 만족해야 한다.
  - 단순 CRUD보다 JPA가 명확한 유지보수 이득을 준다는 근거가 있다.
  - lazy loading, flush timing, cascade, dirty checking, N+1, transaction 경계에 대한 실패 시나리오를 설명할 수 있다.
  - AI/다중 에이전트가 실수해도 우회 setter, 암묵적 flush, 연관관계 side effect로 도메인 상태가 오염되지 않도록 테스트와 코드 경계가 있다.
  - 기존 JdbcTemplate/명시 SQL 구조와 섞일 때의 경계가 문서화되어 있다.
- 이미 존재하는 JPA Entity는 유지보수할 수 있지만, 신규 핵심 도메인의 기본 선택지로 확장하지 않는다.
- Entity와 순수 Domain 객체 분리는 기본값이 아니다. 상태 전이/불변조건이 충분히 안정되고, 매핑 비용보다 상태 오염 방지 이익이 클 때만 별도 설계한다.

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
