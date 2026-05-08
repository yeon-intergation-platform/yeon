# jdk25 설치 및 backend 승격

- 작업 목표: 로컬 JDK 25 설치 후 apps/backend를 Java 25 toolchain으로 승격
- 작업 범위: JDK 25 설치, build.gradle toolchain 25 변경, Gradle 확인
- 기준: 기능 구현 없이 toolchain 승격만 수행
- 비목표: bootRun/health 확인, 추가 starter 도입
