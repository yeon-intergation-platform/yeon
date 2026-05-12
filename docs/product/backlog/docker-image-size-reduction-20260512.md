# Docker 이미지 크기 축소 백로그 (2026-05-12)

## 배경

운영 배포가 Pi self-hosted runner에서 이미지 pull과 저장소 누적으로 느려질 가능성이 크다. 백엔드 553MB 자체는 Spring Boot 기준 비정상은 아니지만, race-server/web/backend 모두 최종 이미지에 불필요한 런타임·개발 의존성이 남을 여지가 있다.

## 1차

### 작업내용

- race-server 최종 이미지를 production 의존성 중심으로 축소한다.
- 현재 `deps` stage를 그대로 runner로 쓰는 구조를 바꿔 devDependencies와 빌드 캐시가 최종 이미지에 남지 않게 한다.
- start에 필요한 런타임 의존성은 명확히 production dependency로 둔다.

### 논의 필요

- TypeScript 소스를 런타임에서 `tsx`로 실행할지, 별도 JS 빌드 산출물로 실행할지 결정이 필요하다.

### 선택지

- A. `tsx`를 production dependency로 이동하고 `pnpm deploy --prod`로 최종 파일만 복사한다.
- B. 번들러를 추가해 JS 단일 산출물로 만든다.

### 추천

- 신규 번들러 의존성을 추가하지 않는 A를 우선 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차

### 작업내용

- web 최종 이미지를 더 작은 Node 런타임 베이스로 전환한다.
- Next standalone 산출물, static asset, public asset, static ffmpeg만 최종 이미지에 남긴다.

### 논의 필요

- distroless 계열은 shell이 없어 운영 디버깅이 불편할 수 있다.

### 선택지

- A. `gcr.io/distroless/nodejs22-debian12:nonroot`로 runner를 축소한다.
- B. `node:22-bookworm-slim`을 유지하고 파일만 더 정리한다.

### 추천

- 배포 pull 병목을 줄이는 목적이므로 A를 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차

### 작업내용

- backend runner를 JRE slim 계열에서 더 작은 JRE Alpine 계열로 전환한다.
- 빌드 stage는 안정성을 위해 기존 JDK Jammy를 유지하고, 최종 stage만 줄인다.

### 논의 필요

- Alpine/musl 런타임은 일부 네이티브 라이브러리 의존성이 있으면 위험할 수 있다. 현재 백엔드는 순수 Java/Spring 중심이라 위험은 낮다.

### 선택지

- A. `eclipse-temurin:21-jre-alpine`으로 runner를 전환한다.
- B. Jammy JRE를 유지하고 layer cleanup만 한다.

### 추천

- A를 적용하되 Docker build와 최소 Spring boot jar 빌드 검증으로 확인한다.

### 사용자 방향

- 추천 기준으로 진행한다.
