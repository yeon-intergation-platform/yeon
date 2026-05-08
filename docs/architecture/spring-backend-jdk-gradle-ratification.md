# Spring Backend JDK / Gradle Ratification

`apps/backend`에 둘 Spring bootstrap app의 **JDK / Gradle baseline ratification 기준**을 고정하는 SSOT 문서다.

이 문서는 toolchain baseline만 다룬다.
다음 항목은 아직 포함하지 않는다.

- 실제 Gradle wrapper 생성
- Spring Boot 코드 생성
- dependency 전체 세트 확정
- CI/CD toolchain image 확정
- DB / API / security stack 확정

## 목적

- Spring Boot `4.0.x` / Framework `7.0.x` 선호선과 맞는 JDK / Gradle 조합을 정한다.
- “latest stable/LTS” 방향을 유지하면서도 bootstrap 실패 시 되돌아갈 fallback을 남긴다.
- 이후 실제 `apps/backend` bootstrap 전에 확인해야 할 ratification gate를 문서화한다.

## Scope / Non-goals

### In scope
- JDK candidate baseline 선정
- Gradle candidate baseline 선정
- preferred / fallback toolchain 조합 정의
- bootstrap 전 재검증 조건 정의

### Out of scope
- actual install command
- sdkman / asdf / mise 등 버전 매니저 선택
- IDE 세팅
- Docker base image 선택
- CI runner image 선택
- build cache / remote cache 전략

## Write-day primary-source verification

- Verification date (UTC): **2026-05-07**
- Sources used:
  - Spring Boot system requirements: https://docs.spring.io/spring-boot/system-requirements.html
  - Spring Framework versions wiki: https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-Versions
  - Gradle compatibility matrix: https://docs.gradle.org/current/userguide/compatibility.html

### Observed facts
- Spring Boot `4.0.6` requires at least Java `17` and supports Gradle `8.14+ / 9.x`.
- Spring Framework team states that they fully test and support JDK `17`, `21`, `25` LTS lines.
- Spring Framework team explicitly recommends **JDK `25` or higher** for production use with Spring Framework `7.x`.
- Gradle compatibility matrix page is currently version `9.5.0`.
- Gradle matrix shows:
  - Java `21` can run on Gradle `8.5+`
  - Java `25` can run on Gradle `9.1.0+`
  - Java `26` can run on Gradle `9.4.0+`

## Decision framing

이 문서의 baseline은 **새로운 Spring 7 계열 백엔드 bootstrap** 기준이다.

즉 아래 우선순위를 따른다.

1. Spring 7 production 권장선과 맞을 것
2. LTS JDK를 사용할 것
3. Gradle은 현재 stable line을 우선 사용할 것
4. preview / RC / snapshot 기반 선택은 하지 않을 것

## Preferred baseline

### Preferred JDK
- **Java `25` LTS**

### Preferred Gradle
- **Gradle `9.5.0`**

### Why this is preferred
- Spring Framework `7.x`가 production use 기준으로 JDK `25+`를 권장한다.
- Java `25`는 현재 Spring 측이 명시적으로 fully tested LTS line으로 취급한다.
- Gradle `9.5.0`은 현재 stable line이며 Java `25` 실행 요구사항(`9.1.0+`)을 만족한다.
- 새 `apps/backend`를 장기 운영 전제로 시작할 때, 너무 낮은 baseline으로 시작했다가 초반에 다시 올리는 비용을 줄일 수 있다.

## Conservative fallback baseline

### Fallback JDK
- **Java `21` LTS**

### Fallback Gradle
- **Gradle `9.5.0`**

### Why this fallback exists
- Java `21`도 Spring 측 fully tested LTS line이다.
- 팀/로컬 환경/배포 기반이 Java `25`를 아직 바로 받지 못할 경우 가장 무난한 fallback이다.
- Gradle은 굳이 `8.x`로 낮추지 않고 현재 stable `9.5.0`을 유지하는 편이 향후 bootstrap 문맥을 단순하게 만든다.

## Escape hatch baseline

아래 조합은 **권장 baseline은 아니지만** 환경 제약이 강할 때만 허용 후보로 남긴다.

- Java `21` LTS
- Gradle `8.14.x`

이 조합은 Spring Boot `4.0.6` requirements를 만족한다.
다만 새 backend의 기본선으로 채택하지는 않는다.

## Baselines we do not choose by default

기본선으로는 아래를 택하지 않는다.

- Java `17`
  - minimum requirement는 만족하지만, 새 Spring 7 backend의 장기 기준으로는 너무 보수적이다.
- Java `26`
  - compatibility range 안에는 있지만 LTS 고정 원칙과 맞지 않는다.
- Gradle `8.x`
  - supported line이지만 새 bootstrap의 기본선을 일부러 낮출 이유가 약하다.
- RC / milestone / snapshot Gradle
- preview-only JDK feature baseline

## Ratification gate before actual bootstrap

다음 5가지를 모두 통과하기 전에는 이 문서를 실제 bootstrap 승인으로 간주하지 않는다.

1. same-day 공식 문서 재검증
2. 로컬 개발 환경에서 Java `25` 설치/실행 가능 확인
3. 로컬 개발 환경에서 Gradle `9.5.0` 또는 wrapper 기반 실행 가능 확인
4. 배포 환경이 Java `25` 런타임을 수용 가능한지 확인
5. 실패 시 Java `21` fallback으로 바로 낮출 수 있는지 확인

## Ratification outcome rule

### If all checks pass
- `apps/backend` bootstrap 기본선은:
  - **Java `25` LTS**
  - **Gradle `9.5.0`**

### If Java 25 only is blocked
- `apps/backend` bootstrap fallback 기본선은:
  - **Java `21` LTS**
  - **Gradle `9.5.0`**

### If Gradle 9 line is blocked by environment tooling
- 한시적 escape hatch로:
  - **Java `21` LTS**
  - **Gradle `8.14.x`**
- 단, 이 경우는 이유와 해제 조건을 별도 문서/작업로그에 남겨야 한다.

## Verification checklist for the next turn

실제 bootstrap 시작 직전에는 최소 아래를 다시 확인한다.

- `java -version`
- target JDK가 local shell / IDE / deploy runtime에서 같은지
- Gradle wrapper target version
- Spring Boot plugin line과 wrapper line 충돌 여부
- `./gradlew -v` 실행 가능 여부

## Summary

현재 Yeon Spring bootstrap toolchain 방향은 아래로 본다.

- preferred:
  - **Java `25` LTS**
  - **Gradle `9.5.0`**
- fallback:
  - **Java `21` LTS**
  - **Gradle `9.5.0`**
- escape hatch:
  - **Java `21` LTS**
  - **Gradle `8.14.x`**

즉, 새 `apps/backend`는 **Spring 7 권장선에 맞춰 Java 25 / Gradle 9.5.0을 기본 목표로 잡되**, 실제 bootstrap 직전 ratification gate를 한 번 더 통과한 뒤 코드 생성으로 넘어간다.
