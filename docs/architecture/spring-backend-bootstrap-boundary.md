# Spring Backend Bootstrap Boundary

Spring 중심 전환의 첫 단계에서 `apps/backend`를 어디에 두고, 기존 앱/패키지와 어떤 역할 경계를 가질지 고정하는 SSOT 문서다.

이 문서는 **bootstrap runway 전용**이다.
아직 Spring Boot 코드 생성, DB 변경, CI/CD 변경, 기능 마이그레이션은 포함하지 않는다.

## 목적

- Spring Boot 시작 위치를 `apps/backend`로 고정한다.
- `apps/web`, `apps/backend`, `apps/race-server`의 초기 역할을 분리한다.
- bootstrap 단계에서 무엇을 아직 옮기지 않을지 명시한다.

## 결정

### 1. Spring Boot 시작 위치

- Spring Boot 신규 런타임 앱의 시작 위치는 `apps/backend`로 한다.
- `services/backend` 또는 별도 repo는 **지금 차수의 기본안이 아니다**.
- 위치 재논의는 bootstrap runway가 실패하거나, monorepo 제약이 명확히 확인된 뒤에만 한다.

### 2. 앱 역할 경계

| 경로 | 현재/초기 역할 | 이번 단계에서 하지 않는 것 |
| --- | --- | --- |
| `apps/web` | 사용자 UI, SSR, SEO, 임시 BFF 역할 | 핵심 비즈니스 로직의 신규 확장 지점으로 삼지 않음 |
| `apps/backend` | Spring 중심 코어 API의 시작 위치 | 아직 기능 이관, 인증 이관, DB ownership 전환은 하지 않음 |
| `apps/race-server` | 타자 레이스 실시간 전용 서버 | bootstrap 단계에서 Spring backend로 흡수하지 않음 |

### 3. 패키지 재사용 원칙

- `packages/api-contract`는 웹/모바일/향후 backend 간 계약 공유 후보로 유지한다.
- `packages/domain`은 순수 도메인 규칙이 남아 있을 때 재사용 후보로 유지한다.
- `packages/utils`는 framework-free helper만 공유 대상으로 본다.
- bootstrap 단계에서는 backend가 shared package를 **소비하는 방향**만 열어두고, 실제 재구성은 뒤 차수에서 판단한다.

## 왜 `apps/backend`인가

1. 현재 저장소는 이미 `apps/web`, `apps/mobile`, `apps/race-server` 구조를 사용한다.
2. 새 런타임 앱을 추가하는 의미가 가장 직접적으로 드러난다.
3. shared package와의 관계를 monorepo 안에서 점진적으로 검증하기 쉽다.
4. 장기적으로 `apps/web = UI/BFF`, `apps/backend = 코어 API` 구도가 가장 설명 가능성이 높다.

## bootstrap 단계의 명시적 비목표

- Spring Boot 프로젝트 파일을 아직 생성하지 않는다.
- `apps/web` route handler나 server action을 아직 옮기지 않는다.
- 인증/세션 source of truth를 아직 바꾸지 않는다.
- DB schema, migration, ownership을 아직 바꾸지 않는다.
- `apps/race-server`의 runtime 책임을 아직 바꾸지 않는다.

## 다음 단계 진입 전제

다음 단계로 넘어가려면 아래 문서화가 먼저 필요하다.

1. local backend run 원칙
2. 최소 배포 runway 원칙
3. health check / readiness 기준
4. Next 최소 연동 smoke 기준

위 네 가지가 문서로 먼저 고정되기 전에는 `apps/backend` 코드 생성을 시작하지 않는다.

## 재논의 조건

아래 중 하나가 발생하면 `apps/backend` 결정은 다시 검토할 수 있다.

- monorepo build/runtime 제약 때문에 backend 독립성이 지나치게 떨어지는 경우
- 배포 파이프라인이 앱 단위보다 repo 단위 분리를 강하게 요구하는 경우
- shared package 전략이 오히려 backend 구조를 과도하게 왜곡하는 경우
- 팀이 별도 backend repo 운영을 명시적으로 선택한 경우

## 현재 단계 완료 기준

이 문서는 아래 세 가지를 명시하면 완료다.

1. `apps/backend`를 Spring 시작 위치로 확정했다.
2. `apps/web` / `apps/backend` / `apps/race-server` 역할을 분리했다.
3. bootstrap 단계에서 아직 하지 않을 것을 명확히 적었다.
