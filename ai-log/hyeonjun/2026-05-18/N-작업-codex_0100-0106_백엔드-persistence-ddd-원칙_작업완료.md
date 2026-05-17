# 백엔드 persistence/DDD 원칙 정리

## 목표

- Spring 공식 백엔드 규칙에 JPA Entity 신규 도입 제한과 JdbcTemplate/명시 SQL 기본값을 명문화한다.
- DDD는 JPA 도입이 아니라 도메인 규칙의 명시화로 접근한다.

## 변경 파일

- `docs/agent-rules/server-services.md`

## 핵심 결정

- 신규 도메인의 기본 persistence는 `JdbcTemplate` 또는 명시 SQL 기반 Repository다.
- JPA Entity는 기본 도입하지 않고, 명확한 유지보수 이득과 실패 시나리오 방어가 있을 때만 예외적으로 허용한다.
- Entity/Domain 분리는 기본값이 아니며, 상태 전이/불변조건이 안정되고 매핑 비용보다 이익이 클 때만 설계한다.
- DDD는 raw string 제거, 상태 전이 메서드화, Service 규칙 정리, Repository 경계 정리, 테스트 고정으로 점진 적용한다.

## 검증

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
