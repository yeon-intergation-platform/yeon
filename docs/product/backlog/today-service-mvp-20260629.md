# Today 서비스 MVP 백로그

## 배경

`todo.yeon.world`에서 바로 사용할 수 있는 개인용 오늘 할 일 관리 서비스를 만든다. 목표는 특별한 자동화보다, 오늘 처리할 일을 빠르게 고르고 지금 할 일 하나에 집중하게 하는 실용성이다.

## 1차

### 작업내용

- `apps/web`에 `/todo-service` 화면을 추가한다.
- `todo.yeon.world` host는 기존 서비스 subdomain과 같은 방식으로 `/todo-service`에 rewrite한다.
- `yeon.world/todo-service`는 `https://todo.yeon.world`로 308 redirect한다.
- 홈 서비스 목록과 SEO/sitemap/robots 설정에 Today 서비스를 추가한다.
- 첫 버전 저장소는 브라우저 localStorage로 둔다.

### 논의 필요

- 로그인 계정 기반 동기화는 지금 넣지 않는다.
- 모바일 앱 화면은 이번 차수에 만들지 않는다.
- Cloudflare Zero Trust Published application route는 기존 `yeon-prod-web:3000` 공개 host 컨벤션을 따른다.

### 선택지

- 선택지 A: web localStorage MVP로 빠르게 배포한다.
- 선택지 B: Spring API, Flyway, api-contract까지 포함한 계정 동기화 버전으로 시작한다.
- 선택지 C: 기존 Life OS 화면에 todo 기능을 흡수한다.

### 추천

선택지 A를 추천한다. 오늘 바로 쓸 수 있는 서비스가 목적이고, B는 인증/DB/API/모바일 패리티까지 범위가 커진다. C는 서비스 정체성이 흐려져 `todo.yeon.world`라는 독립 도메인과도 맞지 않는다.

### 사용자 방향

`todo.yeon.world` 도메인으로 새 Today 서비스 MVP를 만들고, 기존 Cloudflare Zero Trust public hostname 컨벤션에 맞춰 배포한다.

## 2차

### 작업내용

- 로컬 사용성이 확인되면 Spring backend에 사용자별 Today task API를 추가한다.
- `packages/api-contract`에 Today task DTO/요청/응답 스키마를 둔다.
- web/mobile 공통 queryKey와 route identity가 필요하면 Universal UI Parity Registry에 등록한다.

### 논의 필요

- 계정별 동기화가 필요한지, 개인 브라우저 저장만으로 충분한지 판단한다.
- 완료 이력 보관 기간과 삭제 정책을 정한다.

### 선택지

- 선택지 A: 계정 동기화 없이 localStorage를 유지한다.
- 선택지 B: 로그인 사용자만 서버 동기화를 제공하고 게스트는 localStorage를 유지한다.
- 선택지 C: 모든 사용자를 로그인 필수로 전환한다.

### 추천

선택지 B를 추천한다. 개인용 빠른 진입은 유지하면서 기기 간 동기화가 필요해졌을 때만 서버 저장을 제공할 수 있다.

### 사용자 방향

1차 사용 후 결정한다.

## 완료 조건

- `todo.yeon.world`와 `/todo-service` 라우팅이 기존 subdomain 서비스와 같은 규칙으로 동작한다.
- 오늘 할 일 추가, 오늘 목록 이동, 진행중 지정, 완료, 미루기, 삭제, 다음 날 정리가 가능하다.
- lint/typecheck/test와 로컬 브라우저 smoke가 통과한다.
- PR은 `main` 대상으로 생성/머지하고 운영 배포 후 `https://todo.yeon.world`를 확인한다.
