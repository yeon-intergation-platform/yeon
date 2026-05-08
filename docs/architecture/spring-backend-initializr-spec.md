# Spring Backend Initializr Spec

`apps/backend`에 생성할 첫 Spring Boot skeleton의 **Initializr 입력값 SSOT**다.

이 문서는 실제 생성 명령을 실행하지 않는다.
목적은 다음 코드 턴에서 **무엇을 어떤 값으로 생성할지** 미리 고정하는 것이다.

## 목적

- `apps/backend` bootstrap 생성 입력값을 하나로 고정한다.
- 첫 skeleton은 **잘 뜨는지 확인**에만 집중하고, 기능 구현/DB/인증은 넣지 않는다.
- Initializr 기본값과 Yeon 기준값을 구분해서 기록한다.

## Scope / Non-goals

### In scope
- Initializr project type
- language / packaging / Java version
- group / artifact / name / package name
- starter 최소 세트
- 첫 bootstrap에서 제외할 starter

### Out of scope
- 실제 `starter.zip` 다운로드
- 실제 `build.gradle` 생성
- 실제 `gradlew bootRun` 실행
- application 설정 파일 작성
- DB, Security, Cloud 의존성 추가

## Write-day official-source verification

- Verification date (UTC): **2026-05-07**
- Sources used:
  - Spring Initializr metadata: https://start.spring.io/metadata/client
  - Spring Boot docs overview: https://docs.spring.io/spring-boot/documentation.html

### Observed Initializr defaults
- default Spring Boot version: `4.0.6.RELEASE`
- default project type: `gradle-project`
- default packaging: `jar`
- default language: `java`
- default Java version in Initializr UI metadata: `17`

### Important interpretation
- Initializr default Java `17`은 **UI 기본값**이다.
- Yeon bootstrap 기준의 preferred toolchain은 별도 문서에서 **Java `25` LTS / Gradle `9.5.0`** 으로 ratification한다.
- 따라서 실제 생성 시점에는 Initializr default를 그대로 따르지 않고, Yeon ratified baseline을 우선 적용한다.

## Chosen Initializr inputs

### Project type
- **Gradle Project (Groovy DSL)**

### Why
- Spring Initializr의 기본 project type이다.
- 첫 bootstrap 단계에서 Kotlin DSL까지 동시에 도입할 이유가 약하다.
- 문서/예제/운영 자료가 풍부해 초기 기동 리스크를 줄인다.

## Language
- **Java**

### Why
- 현재 사용자 방향이 Java/Spring 중심 전환이다.
- 첫 skeleton 단계에서 Kotlin/Groovy 언어 선택까지 늘리지 않는다.

## Spring Boot line
- **4.0.x line**
- 생성 시점의 stable patch를 사용한다.
- write-day 관측값은 `4.0.6.RELEASE`다.

## Java version
- **preferred: `25`**
- **fallback: `21`**

### Why
- 별도 ratification 문서와 일치시킨다.
- Spring Framework 7 production 권장선에 맞춘다.

## Packaging
- **Jar**

### Why
- 단독 실행형 backend bootstrap app 목적과 맞다.
- 첫 배포/health check/preview 흐름을 단순하게 만든다.

## Coordinates

### Group
- **`world.yeon`**

### Artifact
- **`backend`**

### Name
- **`yeon-backend`**

### Package name
- **`world.yeon.backend`**

### Version
- **`0.0.1-SNAPSHOT`**

### Why these coordinates
- 운영 도메인 `yeon.world`의 reverse-domain 관례와 맞춘다.
- 모노레포 앱 위치 `apps/backend`와 artifact 명이 단순하게 대응된다.
- package name이 앞으로 auth, counseling, workspace 등 하위 모듈을 담기 쉬운 중립 이름이다.

## Minimal starter set for first bootstrap

첫 skeleton에는 아래만 넣는다.

1. **Spring Web** (`web`)
2. **Spring Boot Actuator** (`actuator`)
3. **Validation** (`validation`)

### Why these three
- `web`: HTTP endpoint와 간단한 ping/health smoke 확인에 필요하다.
- `actuator`: `/actuator/health` 기준을 빠르게 충족할 수 있다.
- `validation`: 이후 request DTO 기본선으로 무리 없이 이어진다.

## Starters intentionally excluded in first bootstrap

첫 skeleton에서는 아래를 넣지 않는다.

- **Spring Security**
- **Spring Data JPA**
- **JDBC API**
- **R2DBC**
- **Flyway / Liquibase**
- **Docker Compose support**
- **DevTools**
- **Lombok**
- **Testcontainers**

### Why excluded
- 지금 목표는 기능이 아니라 **기동 확인**이다.
- DB/security/migration이 들어오면 실패 원인 분리가 어려워진다.
- Lombok은 팀 규칙/코드스타일 합의 없이 기본선으로 넣지 않는다.
- Testcontainers 등은 테스트 스택 문서에서 따로 결정한다.

## Directory expectation

- 생성 대상 경로: **`apps/backend`**
- 생성 후 기대 파일군:
  - Gradle wrapper
  - `build.gradle`
  - `settings.gradle`
  - 기본 Application class
  - 기본 test class

## First generated app success target

생성 직후 목표는 아래뿐이다.

1. `apps/backend`에 skeleton이 생성된다.
2. 로컬에서 부팅된다.
3. `/actuator/health`가 `200`을 반환한다.
4. Next 또는 curl로 backend 존재를 확인한다.

그 외 도메인 기능은 첫 턴 범위가 아니다.

## Replan triggers

아래면 생성 전에 다시 문서를 열어야 한다.

- Spring Boot `4.0.x` stable line이 바뀐 경우
- Java `25` ratification이 환경에서 막힌 경우
- Groovy DSL 대신 Kotlin DSL을 강하게 요구하는 팀 정책이 생긴 경우
- 첫 skeleton에 security/data 의존성을 꼭 넣어야 한다는 운영 요구가 생긴 경우

## Summary

현재 Yeon의 첫 Spring Initializr 생성 스펙은 아래다.

- path: `apps/backend`
- type: **Gradle Project (Groovy DSL)**
- language: **Java**
- boot line: **4.0.x** (write-day observed `4.0.6.RELEASE`)
- java: **25**, fallback **21**
- packaging: **jar**
- group: **`world.yeon`**
- artifact: **`backend`**
- name: **`yeon-backend`**
- package: **`world.yeon.backend`**
- starters:
  - `web`
  - `actuator`
  - `validation`

즉 다음 코드 턴은 이 스펙으로 **최소 Spring skeleton 생성**만 하고 멈추는 것이 맞다.
