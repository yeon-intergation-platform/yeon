# Spring Backend Bootstrap Preflight Checklist

`apps/backend`에서 실제 Spring Boot 프로젝트 생성에 들어가기 전에 반드시 통과해야 하는 **preflight checklist SSOT**다.

이 문서는 “코드 생성 직전 마지막 점검표”다.
즉 아직 Spring Initializr 실행, Gradle wrapper 생성, 애플리케이션 기동을 수행하지 않는다.

## 목적

- bootstrap 시작 전에 빠뜨리면 안 되는 결정과 확인 항목을 한 장에 고정한다.
- toolchain 문서, core runtime 문서, bootstrap runway 문서를 실제 실행 전 점검표로 연결한다.
- 작은 단계로 시작하고 실패 시 즉시 멈출 수 있는 기준을 만든다.

## Scope / Non-goals

### In scope
- 코드 생성 직전 확인해야 할 필수 항목
- 첫 로컬 기동의 최소 성공 기준
- 첫 health check 확인 기준
- 첫 Next 연동 smoke 확인 기준
- stop / retry / fallback 규칙

### Out of scope
- Spring Initializr 실제 실행
- build.gradle 작성
- application.yml 작성
- dependency 실제 선택
- DB 연결
- 인증 연동
- 배포 자동화

## Inputs this checklist depends on

이 체크리스트는 아래 문서가 먼저 존재한다고 가정한다.

- `spring-backend-bootstrap-boundary.md`
- `spring-backend-core-runtime-tech-stack.md`
- `spring-backend-jdk-gradle-ratification.md`
- `docs/product/backlog/spring-bootstrap-runway.md`

## Preflight checklist

### 1. 위치 / 책임 경계
- [ ] `apps/backend`를 bootstrap 시작 위치로 유지한다.
- [ ] `apps/web`는 bootstrap 단계에서 UI / SSR / 임시 BFF 역할을 유지한다.
- [ ] `apps/race-server`는 bootstrap 단계에서 독립 realtime runtime으로 남긴다.
- [ ] 이번 턴에서 기능 이관을 시작하지 않는다는 점을 다시 확인한다.

### 2. Toolchain baseline
- [ ] preferred baseline이 `Java 25 LTS + Gradle 9.5.0`인지 다시 확인한다.
- [ ] preferred가 막히면 `Java 21 LTS + Gradle 9.5.0` fallback으로 내릴 수 있는지 확인한다.
- [ ] local shell에서 target JDK를 확인할 수 있다.
- [ ] Gradle line이 Spring Boot 4.0.x 요구사항과 충돌하지 않는다.
- [ ] 이 턴에서 wrapper 생성 여부를 분리해서 다룬다는 점을 이해한다.

### 3. 생성 직전 환경 준비
- [ ] 기본 애플리케이션 포트 후보를 하나로 고정한다.
- [ ] local profile naming 원칙을 미리 정한다.
- [ ] 첫 실행에 필요한 환경변수는 “없거나 최소” 상태로 시작한다.
- [ ] 외부 연동 없이도 기동 가능한 skeleton을 목표로 한다.
- [ ] DB, Redis, Kafka, OAuth 같은 외부 의존성은 첫 기동 성공 기준에서 제외한다.

### 4. 첫 로컬 기동 성공 기준
- [ ] 애플리케이션 프로세스가 예외 없이 올라온다.
- [ ] 로그에서 startup complete 신호를 확인할 수 있다.
- [ ] HTTP endpoint 하나가 200으로 응답한다.
- [ ] 성공 기준은 business endpoint가 아니라 health endpoint다.
- [ ] 실패 시 원인을 toolchain / config / port conflict / app error 중 하나로 분류한다.

### 5. Health endpoint 기준
- [ ] 첫 health endpoint는 Spring 표준 actuator health 경로를 우선 고려한다.
- [ ] 첫 확인 경로는 `/actuator/health`를 기본 후보로 둔다.
- [ ] readiness / liveness 분리는 첫 bootstrap에서 강제하지 않는다.
- [ ] secret 없이 단순 GET으로 확인 가능한 형태만 허용한다.
- [ ] health 200 확인 전에는 다음 단계로 넘어가지 않는다.

### 6. Next 최소 연동 smoke 기준
- [ ] 첫 연동은 사용자 기능이 아니라 backend 존재 확인용 smoke만 본다.
- [ ] 응답 payload는 health 또는 ping 수준으로 제한한다.
- [ ] 인증 / 쿠키 / 세션 없는 요청만 먼저 본다.
- [ ] SSR/CSR 중 하나만 먼저 선택해 최소 fetch 확인을 한다.
- [ ] 연동 실패 시 network / proxy / backend boot / route mismatch로 분류한다.

### 7. Stop rule
- [ ] JDK baseline이 애매하면 코드 생성 전에 멈춘다.
- [ ] Gradle baseline이 애매하면 wrapper 생성 전에 멈춘다.
- [ ] health endpoint 설계가 불명확하면 실행 전에 멈춘다.
- [ ] Next smoke scope가 커지기 시작하면 그 턴은 중단한다.
- [ ] “기동 확인”과 “기능 구현”이 섞이기 시작하면 그 턴은 실패로 본다.

## First execution success definition

다음 4개를 모두 만족하면 bootstrap 첫 실행은 성공으로 본다.

1. `apps/backend`에 Spring Boot skeleton이 생성되었다.
2. 로컬에서 프로세스가 정상 기동되었다.
3. `/actuator/health` 또는 동등 health endpoint가 `200`을 반환했다.
4. Next 또는 별도 curl smoke에서 backend 응답 존재를 확인했다.

## Retry / fallback rule

### Retry first
아래는 먼저 재시도한다.
- 포트 충돌
- profile 오타
- 환경변수 누락
- wrapper / toolchain 경로 문제

### Fallback second
아래는 fallback으로 내릴 수 있다.
- Java 25만 로컬/배포 환경에서 막히는 경우 → Java 21
- Gradle 9.5.0만 환경 도구와 충돌하는 경우 → Gradle 8.14.x

### Hard stop
아래는 중단 후 문서 재정리로 되돌린다.
- Spring 4.0.x line 자체 변경
- health endpoint 정책 변경 필요
- bootstrap 단계인데 DB/인증/배포 자동화가 같이 들어오려는 경우

## Next turn entry rule

이 체크리스트를 쓴 다음 턴에서는 **아래 한 가지 작업만** 수행한다.

- `apps/backend` bootstrap 생성 스펙 문서 작성
또는
- 실제 Spring Initializr / wrapper 생성 실행

둘을 한 턴에 동시에 하지 않는다.

## Summary

Yeon의 Spring bootstrap은 다음 순서로만 진행한다.

1. 경계 문서 확인
2. toolchain ratification 확인
3. preflight checklist 통과
4. Spring skeleton 생성
5. 로컬 기동
6. health 200 확인
7. Next 최소 smoke 확인

즉, 다음 코드 턴은 반드시 **“잘 뜨는지 확인”만 목표**로 가져가야 하고, 기능 이전은 그 다음이다.
