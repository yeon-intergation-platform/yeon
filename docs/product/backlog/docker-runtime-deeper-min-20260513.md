# Docker 런타임 추가 축소 및 Java 25 전환 백로그 (2026-05-13)

## 배경

1차 Docker 이미지 축소는 distroless/JRE Alpine 전환으로 pull 용량을 줄였지만, race-server는 여전히 `tsx`로 TypeScript 소스를 런타임 실행하고 backend Gradle toolchain SSOT는 Java 21로 남아 있다. 2026년 5월 기준 Spring Boot 4.0.6은 Java 17 이상과 Java 26까지 호환되며, 사용 의도에 맞춰 Java 25를 SSOT로 명시한다.

## 1차

### 작업내용

- backend Gradle Java toolchain SSOT를 25로 변경한다.
- backend Docker builder/runner를 Java 25 Temurin 이미지로 맞춘다.

### 논의 필요

- Java 25는 현재 프로젝트 런타임 의도와 맞지만, 운영 배포 뒤 health 확인이 필요하다.

### 선택지

- A. Gradle/Docker 모두 Java 25로 맞춘다.
- B. Gradle은 21로 유지하고 Docker만 25로 실행한다.

### 추천

- source of truth 오염을 막기 위해 A를 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차

### 작업내용

- race-server 런타임에서 TypeScript 실행기 `tsx`를 제거한다.
- build stage에서 JS 산출물을 만들고 runner는 `dist/index.js`만 실행한다.
- production dependency에는 실제 런타임 라이브러리만 남긴다.

### 논의 필요

- workspace 패키지 `@yeon/race-shared`는 현재 TS source export라 Node 런타임에서 직접 import하기 어렵고, Colyseus meta package는 uWebSockets/playground 등 미사용 의존성을 크게 끌어온다. race-server bundle에 shared 순수 로직과 Colyseus 실행 경로를 포함한다.

### 선택지

- A. esbuild로 race-server entry를 Node ESM bundle로 만들고 runner에는 `dist/index.js`만 복사한다.
- B. workspace 전체에 JS build/export 체계를 도입한다.

### 추천

- 런타임 node_modules를 제거해 이미지 크기를 가장 크게 줄이는 A를 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차

### 작업내용

- web은 이미 Next standalone, cache 제외, distroless runner 구조이므로 동일 기준을 유지한다.
- 새 변경으로 이미지 크기와 runtime smoke를 다시 측정한다.

### 논의 필요

- web 추가 감량은 ffmpeg 분리나 기능 구조 변경이 필요해 이번 PR 범위에서 제외한다.

### 선택지

- A. web runner 구조는 유지하고 회귀 검증만 수행한다.
- B. ffmpeg를 web 이미지에서 분리한다.

### 추천

- 기능 영향이 큰 B는 별도 설계로 넘기고 A를 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.
