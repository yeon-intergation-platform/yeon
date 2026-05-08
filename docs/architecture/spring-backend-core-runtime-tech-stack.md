# Spring Backend Core Runtime Tech Stack

`apps/backend`에 둘 **새 Spring bootstrap app**의 코어 런타임 방향을 고정하는 SSOT 문서다.

이 문서는 bootstrap 단계의 **코어 런타임 프레이밍**만 다룬다.
다음 항목은 아직 포함하지 않는다.

- DB migration / ownership 전략
- 기존 Next backend logic 이전 전략
- dependency 설치
- Gradle wrapper 생성
- 실제 Spring Boot 코드 생성

## 목적

- `apps/backend`를 Spring bootstrap 시작 위치로 유지한다.
- Spring platform line의 **preferred / fallback** 방향을 먼저 고정한다.
- JDK/Gradle은 아직 최종 확정하지 않고 **ratification gate** 뒤에 둔다.
- bootstrap 단계에서 `apps/web`와 `apps/race-server`의 현재 runtime 역할이 유지된다는 점을 함께 명시한다.

## 현재 bootstrap 경계

- `apps/backend`는 **새 Spring 코어 API bootstrap app 시작 위치**다.
- bootstrap 단계에서 `apps/web`는 **UI / SSR / 임시 BFF** 역할을 유지한다.
- bootstrap 단계에서 `apps/race-server`는 **realtime runtime** 역할을 유지한다.
- 이 문서는 `apps/web` 또는 `apps/race-server`의 기존 runtime 책임을 제거하는 문서가 아니다.

## Scope / Non-goals

### In scope
- Spring platform line preferred/fallback 결정 프레임
- same-day 공식 문서 검증 결과 기록
- JDK/Gradle ratification gate 정의
- out-of-scope / deferred decision 명시

### Out of scope
- DB schema / migration / ORM ownership
- Next route handler / server action 이전
- 인증 / 세션 source of truth 변경
- CI/CD / deploy implementation
- Java package structure 세부안
- 코드 생성 및 실제 bootstrap 실행

## Write-day primary-source verification

- Verification date (UTC): **2026-05-07**
- Sources used:
  - Spring Boot documentation overview: https://docs.spring.io/spring-boot/documentation.html
  - Spring Boot system requirements: https://docs.spring.io/spring-boot/system-requirements.html
  - Spring support policy: https://spring.io/support-policy/
  - Spring Framework versions wiki: https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-Versions
  - Gradle compatibility matrix: https://docs.gradle.org/current/userguide/compatibility.html

### Observed current lines
- Spring Boot stable lines observed: `4.0.6`, `3.5.13`, `3.4.13`, `3.3.13`
- Spring Framework support posture observed:
  - `7.0.x` = current production line
  - `6.2.x` = final feature branch of the 6th generation
- Spring support policy observed:
  - last minor line of a major version such as `3.5` has special extended enterprise support treatment

### Ratification-gated compatibility notes
- Spring Boot `4.0.6` system requirements indicate:
  - Java `17+`
  - Gradle `8.14+ / 9.x`
  - Spring Framework `7.0.7+`
- `7.0.x` line is compatible with Java 17 baseline while recommending newer LTS use in practice.
- Gradle runtime compatibility notes must be rechecked when actual bootstrap begins.

## Preferred provisional platform line

### Preferred line
- **Spring Boot `4.0.x`**
- **Spring Framework `7.0.x`**

### Why this line is preferred
- 현재 공식 stable generation 기준으로 가장 앞선 production line이다.
- 새 `apps/backend` bootstrap app을 시작할 때 장기적으로 다시 platform line을 올리는 비용을 줄일 수 있다.
- “latest stable/LTS-oriented”라는 현재 사용자 방향과 가장 잘 맞는다.

### What this does NOT mean
이 선호는 아래를 자동 확정하지 않는다.

- Java 최종 baseline
- Gradle 최종 baseline
- 실제 dependency set
- implementation 승인

즉, 이 preferred line은 **provisional** 이고, 실제 bootstrap 전에는 ratification gate를 다시 통과해야 한다.

## Conservative provisional fallback line

### Fallback line
- **Spring Boot `3.5.x`**
- **Spring Framework `6.2.x`**

### Why this line remains a fallback
- 현재 `3.x` 계열의 마지막 minor line 기준 fallback으로 설명하기 좋다.
- 더 보수적인 bootstrap 경로가 필요할 때 고려 가능한 대안이다.
- 공식 support posture가 바뀌지 않는 한, preferred line이 현실 제약으로 막힐 때 되돌아올 수 있는 경로다.

### Important nuance
이 fallback은 **“preferred보다 더 낫다”**는 뜻이 아니다.  
또한 open-source support/enterprise support의 세부 차이는 **실제 채택 시점에 다시 공식 문서로 검증**해야 한다.

## JDK / Gradle ratification gate

이 문서는 **JDK와 Gradle을 아직 최종 승인하지 않는다**.

현재는 아래 정도만 고정한다.

- JDK baseline은 Spring line과 Gradle runtime compatibility를 함께 보고 ratify한다.
- Gradle baseline은 Spring Boot system requirements와 실제 bootstrap 환경 제약을 함께 보고 ratify한다.
- write-day 관측값은 참고 정보일 뿐, normative final decision이 아니다.

### Ratification criteria
아래를 모두 만족할 때만 JDK/Gradle을 normative baseline으로 승격한다.

1. official Spring source recheck
2. Gradle compatibility recheck
3. local bootstrap 실행 가능성 확인
4. bootstrap runway 문서와 충돌 없음

## Deferred decisions

다음은 후속 문서/후속 턴으로 미룬다.

- Java exact baseline ratification
- Gradle exact baseline ratification
- package/module 구조 세부안
- data access stack
- API / validation stack
- test stack
- observability stack
- security / authentication stack

## Material mismatch triggers

아래 중 하나면 이 문서는 다시 계획을 열고 수정해야 한다.

1. Spring Boot `4.0.x`가 더 이상 current stable production line이 아님
2. Spring Boot `3.5.x`가 더 이상 relevant last-3.x fallback으로 보기 어려움
3. Spring Framework `7.0.x` / `6.2.x` support posture가 preferred/fallback framing과 달라짐
4. system requirements 변화로 JDK/Gradle ratification wording이 더 이상 맞지 않음

## Excluded baselines

이 문서에서는 아래를 채택 대상으로 두지 않는다.

- RC / milestone / snapshot line
- nightly build
- preview / incubator feature baseline
- absolute-latest만을 이유로 한 line 선택

## Update / revalidation rule

이 SSOT는 고정 진실 문서가 아니다.  
아래 상황에서는 반드시 재검증 후 갱신한다.

- 실제 `apps/backend` bootstrap 착수 직전
- JDK / Gradle ratification 직전
- Spring stable/support posture가 변한 뒤
- preferred/fallback line을 뒤집어야 할 근거가 생긴 경우

## Summary

현재 단계에서 Yeon은:

- `apps/backend`를 **새 Spring bootstrap 시작 위치**로 둔다.
- platform line은 우선
  - preferred: `Boot 4.0.x / Framework 7.0.x`
  - fallback: `Boot 3.5.x / Framework 6.2.x`
  로 본다.
- 하지만 **JDK / Gradle은 아직 ratified decision이 아니다**.
- bootstrap 단계 동안 `apps/web`, `apps/race-server`의 기존 runtime 책임은 유지된다.
