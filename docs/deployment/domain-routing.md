# Domain Routing

기준일: 2026-06-01

## 목적

서비스별 path URL을 subdomain URL로 전환할 때 확인할 운영 기준을 기록한다.

## URL 매핑

| 서비스         | 기존 URL                            | 목표 URL                       | 기본 처리                                                     |
| -------------- | ----------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| typing-service | `https://yeon.world/typing-service` | `https://typing.yeon.world`    | 신규 subdomain 검증 후 기존 path 호환 유지 또는 redirect 결정 |
| card-service   | `https://yeon.world/card-service`   | `https://card.yeon.world`      | 신규 subdomain 검증 후 기존 path 호환 유지 또는 redirect 결정 |
| community      | `https://yeon.world/community`      | `https://community.yeon.world` | 신규 subdomain 검증 후 기존 path 호환 유지 또는 redirect 결정 |

## 현재 확인된 운영 라우트 근거

출처: `docs/deployment/cloudflare-warp-db-access.md`

```text
ssh.yeon.world    -> ssh://192.168.0.2:22
api.yeon.world    -> http://yeon-prod-backend:8081
yeon.world        -> http://yeon-prod-web:3000
www.yeon.world    -> http://yeon-prod-web:3000
race.yeon.world   -> http://yeon-prod-race:2567
dev.yeon.world    -> http://yeon-dev-web:3000
db.yeon.world     -> tcp://yeon-prod-db:5432
dbdev.yeon.world  -> tcp://yeon-dev-db:5432
Catch-all         -> http_status:404
```

## Cloudflare Tunnel public hostname 설정 상태

사용자 설정 완료 시점: 2026-06-01

```text
10 typing.yeon.world     * -> http://yeon-prod-web:3000
11 card.yeon.world       * -> http://yeon-prod-web:3000
12 community.yeon.world  * -> http://yeon-prod-web:3000
```

## 목표 Cloudflare Tunnel public hostname

| Hostname               | Service                     | 비고                                      |
| ---------------------- | --------------------------- | ----------------------------------------- |
| `typing.yeon.world`    | `http://yeon-prod-web:3000` | Next.js web app에서 host/path 라우팅 처리 |
| `card.yeon.world`      | `http://yeon-prod-web:3000` | Next.js web app에서 host/path 라우팅 처리 |
| `community.yeon.world` | `http://yeon-prod-web:3000` | Next.js web app에서 host/path 라우팅 처리 |

## Cloudflare에서 확인할 항목

- DNS 레코드
  - `typing.yeon.world`
  - `card.yeon.world`
  - `community.yeon.world`
- 각 레코드는 Tunnel public hostname 생성으로 자동 CNAME 생성 가능 여부 확인
- Proxy 상태는 Cloudflare proxied 사용
- SSL/TLS 인증서가 `*.yeon.world` 또는 각 hostname을 커버하는지 확인
- Tunnel 위치
  - Cloudflare Zero Trust
  - Networks
  - Connectors
  - 운영 Tunnel
  - Public Hostnames 또는 Published application routes
- Access 사용 시 확인
  - 새 hostname이 기존 Access Application에 포함되는지
  - 별도 Access Application이 필요한지
  - public 서비스라면 Access 보호 대상에서 제외할지
  - WebSocket과 CORS preflight가 Access 정책에 막히지 않는지

## 앱 라우팅 확인 항목

현재 확인된 route 디렉터리:

```text
apps/web/src/app/typing-service
apps/web/src/app/card-service
apps/web/src/app/community
```

Subdomain 전환 구현 시 확인할 파일:

```text
apps/web/next.config.ts
apps/web/src/middleware.ts
apps/web/src/lib/seo.ts
apps/web/src/app/typing-service/**
apps/web/src/app/card-service/**
apps/web/src/app/community/**
apps/web/src/features/typing-service/**
apps/web/src/features/card-service/**
apps/web/src/features/community/**
apps/race-server/**
apps/backend/**
packages/api-client/**
packages/api-contract/**
```

현재 `apps/web/src/lib/seo.ts`에는 canonical host `https://yeon.world`와 sitemap path가 있다. Subdomain 전환 시 SEO 정책을 같이 변경해야 한다.

## 권장 라우팅 방식

1. Cloudflare에서 세 hostname을 모두 `http://yeon-prod-web:3000`으로 보낸다. 완료.
2. Next.js에서 Host header를 기준으로 내부 path로 rewrite한다.
   - `typing.yeon.world/*` -> `/typing-service/*`
   - `card.yeon.world/*` -> `/card-service/*`
   - `community.yeon.world/*` -> `/community/*`
3. 기존 path URL은 초기에는 호환 유지한다.
4. 안정화 후 기존 path를 301 redirect할지 결정한다.

## 인증/쿠키 확인 항목

- 앱 로그인 쿠키 Domain
- SameSite
- Secure
- subdomain 간 세션 공유 필요 여부
- logout redirect
- login callback redirect allowlist
- OAuth callback URL
- CSRF origin 검증
- Spring CORS allowed origins

신규 origins:

```text
https://typing.yeon.world
https://card.yeon.world
https://community.yeon.world
```

## 서비스별 검증 항목

### typing-service

- `https://typing.yeon.world` 접속
- `/rooms`, `/decks` 등 하위 경로 접속
- 게스트 진입
- 로그인 진입
- race-server WebSocket 연결
- `NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world` 영향 확인

### card-service

- `https://card.yeon.world` 접속
- 덱 목록
- 덱 생성
- 카드 편집
- 학습 화면
- 게스트 덱과 로그인 덱 분기

### community

- `https://community.yeon.world` 접속
- 피드 목록
- 글 작성
- 댓글
- 실시간 채팅 또는 presence 관련 API
- 익명 닉네임 표시

## 검증 명령

```bash
pnpm --filter @yeon/web lint
pnpm --filter @yeon/web typecheck
curl -I https://typing.yeon.world
curl -I https://card.yeon.world
curl -I https://community.yeon.world
curl -I https://yeon.world/typing-service
curl -I https://yeon.world/card-service
curl -I https://yeon.world/community
curl -I https://race.yeon.world
```

WebSocket 확인은 브라우저 또는 Playwright로 확인한다.

## 배포 전 체크

- Cloudflare public hostname 3개 추가 완료
- Access 정책 확인 완료
- 앱 라우팅 구현 완료
- CORS/CSRF/cookie 확인 완료
- SEO canonical/sitemap 정책 확인 완료
- 기존 path 호환 또는 redirect 정책 확인 완료
- lint/typecheck 통과
- PR main merge 후 배포 workflow 시작 확인

## 운영 smoke test

- `https://typing.yeon.world` HTTP 200 또는 의도한 redirect
- `https://card.yeon.world` HTTP 200 또는 의도한 redirect
- `https://community.yeon.world` HTTP 200 또는 의도한 redirect
- 기존 path URL 동작 확인
- 로그인 후 새 subdomain 진입 확인
- 브라우저 콘솔 CORS 오류 없음
- Cloudflare 52x 없음
- backend/race-server 오류 로그 없음

## 롤백

1. Cloudflare public hostname에서 신규 hostname 3개를 제거하거나 이전 origin으로 되돌린다.
2. DNS 레코드가 수동 생성되어 있으면 삭제하거나 이전 값으로 복구한다.
3. Access Application/Policy 변경을 이전 상태로 되돌린다.
4. 앱 코드 redirect/rewrite 변경 PR을 revert한다.
5. 기존 path URL이 정상 동작하는지 확인한다.
6. `https://yeon.world/typing-service`, `https://yeon.world/card-service`, `https://yeon.world/community`를 smoke test한다.

## 관련 문서

- `docs/deployment/cloudflare-warp-db-access.md`
- `docs/deployment/github-actions-ghcr.md`
- `docs/deployment/raspberry-pi-docker-compose.md`
- `docs/seo/google-search-console.md`
- `docs/deployment/domain-routing-checklist-300.md`
