# PULL-IT 포트폴리오 경로 복구 작업 로그

## 작업 상태

- 상태: 완료
- 시작: 2026-07-24 18:59 KST
- 종료: 2026-07-24 19:55 KST

## 목표

- `portfolio.yeon.world/pull-it`에서 PULL-IT 앱, API, 문서를 다시 제공할 수 있는 상태를 만든다.
- 키와 기존 데이터가 없어도 코드 빌드와 경로 계약을 검증한다.

## 작업 위치

- Yeon 작업 워크트리: `/Users/osuma/coding_stuffs/yeon-3`
- Yeon 브랜치: `feat/pullit-portfolio-revival-20260724`
- PULL-IT 원본:
  - `Hyeonjun0527/pullit-docs-server`
  - `kakao-tech-campus-3rd-step3/Team2_BE`
  - `kakao-tech-campus-3rd-step3/Team2_FE`

## 작업 전 상태

- `https://pull.it.kr`의 정적 프론트는 응답하지만 빌드가 `https://qa.api.pull.it.kr`을 호출한다.
- `qa.api.pull.it.kr`과 `api.pullit.kr`은 DNS가 해제되어 있다.
- `https://pullit-docs-server.vercel.app`은 응답한다.
- 정상 철자 `portfolio.yeon.world`은 DNS가 없고 기존 운영 주소는 `portforlio.yeon.world`였다.

## 영향 범위

- PULL-IT FE: Vite base, Router basename, API/OAuth/SSE 경로
- PULL-IT BE: OAuth callback, redirect, cookie domain/path, proxy header
- PULL-IT docs: 정적 자산과 API base path, OpenAPI URL
- Yeon web: host rewrite, `/pull-it` reverse proxy, 포트폴리오 CTA, SEO
- 운영: Cloudflare Published application route, 독립 PULL-IT compose

## 키 지연 주입

- Kakao REST API key/client secret
- Gemini API key
- S3 access/secret/region/bucket
- JWT secret
- MariaDB/Redis/RabbitMQ/PostgreSQL 접속 정보
- 선택 항목: Sentry DSN/auth token

키 값은 저장소에 기록하지 않는다.

## 완료 내용

- Team2_FE와 Team2_BE를 `Hyeonjun0527` 계정으로 포크하고 세 저장소에
  포트폴리오 복구 브랜치를 만들었다.
- FE의 Vite base, Router basename, API/OAuth/SSE 주소를 `/pull-it` 계약으로
  통일했다.
- BE의 OAuth callback, redirect allowlist, cookie domain/path, CORS와 외부 키를
  환경변수로 분리하고 독립 Docker Compose 런타임을 추가했다.
- docs의 정적 자산, 문서 API, OpenAPI 경로를 `/pull-it/docs` 기준으로 바꿨다.
- Yeon에 정상 철자 host, 오타 host 308 전환, origin별 reverse proxy와
  키 대기 안내 화면을 추가했다.
- Cloudflare DNS와 원격 tunnel ingress를 등록했다.
  - tunnel config: v37 → v38
  - `portfolio.yeon.world` → `http://yeon-prod-web:3000`

## 검증 결과

- FE: `pnpm tsc-check`, `pnpm lint-check`, `pnpm build` 통과
- BE: `./gradlew codeCheck test` 통과
- BE Compose: 필수 placeholder 주입 후 `docker compose config --quiet` 통과
- docs: `npm run build`, Node 문법 검사, `jq empty vercel.json` 통과
- Yeon: lint, typecheck, build, parity, 관련 Vitest, SSOT 검증 통과
- 로컬 reverse proxy:
  - `/pull-it` PULL-IT HTML과 `/pull-it/assets/*` 반환 확인
  - deep link query 보존 확인
  - API와 docs origin rewrite 확인
- Cloudflare: 공개 DNS 응답과 v38 ingress를 API 재조회해 확인

## 남은 외부 설정

- `.env.example`에 적힌 Kakao, Gemini, S3, JWT, DB, RabbitMQ 키 입력
- PULL-IT FE/BE/docs origin 배포 후 Yeon 운영 환경의
  `PULLIT_*_ORIGIN` 3개 설정
- 기존 MariaDB/S3/PostgreSQL 백업이 있으면 신규 런타임에 별도 복원

## 롤백 계획

- PULL-IT 독립 런타임과 Yeon 프록시를 각각 제거할 수 있게 결합도를 낮게 유지한다.
- 키와 origin이 없는 동안에는 안내 화면을 유지한다.
