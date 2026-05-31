---
name: domain-routing
description: Yeon 서비스 URL, Cloudflare Tunnel/Public Hostname, Access, DNS, subdomain, redirect, CORS, 쿠키, WebSocket, canonical/sitemap, 운영 도메인 라우팅 작업 또는 질문에 사용한다.
user_invocable: true
---

# domain-routing

SSOT: `docs/deployment/domain-routing.md`

체크리스트: `docs/deployment/domain-routing-checklist-300.md`

## 사용 조건

- `yeon.world/typing-service`, `yeon.world/card-service`, `yeon.world/community` URL 작업
- `typing.yeon.world`, `card.yeon.world`, `community.yeon.world` 작업
- Cloudflare DNS, Tunnel, Public Hostname, Published application route 작업
- Cloudflare Access Application/Policy 작업
- subdomain redirect/rewrite 작업
- 서비스별 CORS, cookie domain, OAuth redirect, WebSocket origin 작업
- canonical, sitemap, SEO URL 작업

## 실행

1. `docs/deployment/domain-routing.md`를 읽는다.
2. 실행 작업이면 `docs/deployment/domain-routing-checklist-300.md`를 읽는다.
3. 현재 코드와 Cloudflare 설정을 확인하기 전에는 문서의 미확정 항목을 확정 사실로 말하지 않는다.
4. 문서와 실제 설정이 다르면 실제 설정을 확인한 뒤 `docs/deployment/domain-routing.md`를 갱신한다.
