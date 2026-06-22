# 게임 허브 CrazyGames → GameMonetize Feed 전환 (근본 해결)

## 발단
운영 영상 2건에서 게임 서빙 불안정 확인:
- snake.io 등 실시간 IO 게임: 임베드 셸만 뜨고 게임 캔버스 흰 화면.
- bullet force 등 FPS: 게임은 뜨지만 시점이 미친 듯이 흔들림.

## 근본 원인
1. **흰 화면** — CrazyGames `/embed/`는 파트너 등록 + 임베드 도메인 화이트리스트 전제. `game.yeon.world` 미등록 → 게임별 차단. `referrerPolicy="no-referrer"`가 출처 검증을 막아 악화.
2. **흔들림** — FPS/IO는 Pointer Lock + mouse delta로 카메라 회전. 작은 인라인 박스 + 페이지 스크롤 + sandbox iframe에서 pointer lock이 잠겼다 풀렸다 반복하며 jitter.

→ ①은 소스를 우리가 퍼블리셔로 등록한 GameMonetize feed로 전환해 해결. ②는 소스 무관 임베드 셸 결함이라 셸 재설계로 해결.

## 작업 내용
- `game-catalog.ts`: CrazyGames 5종 제거 → GameMonetize 실데이터 curated 10종(한국어 카피)으로 교체. 카테고리 재정의(arcade/puzzle/action/shooting/racing/sports/adventure/casual/io) + thumbUrl. 동기 함수 유지로 SEO/SSG 무영향.
- `game-feed.ts`(신규): zod 스키마, HTML 엔티티 디코드, 카테고리/slug 매핑, `fetch(revalidate 12h)` 캐싱. **확정 사실**: `category=All`/`company=All` 넣으면 `[]`; 임베드 URL은 `html5.gamemonetize.co`(.co); Cloudflare rate-limit(1015) → 서버 캐싱 필수.
- `game-source.ts`(신규): curated + feed merge(임베드 해시 dedupe), 카테고리 필터, 페이지네이션(24/page), 상세 on-demand 조회.
- `game-detail.tsx`: **임베드 셸 재설계** — 썸네일 클릭 게이트(클릭 전 iframe 미마운트) → 클릭 시 로드 + 전체화면(iframe 컨테이너 대상), `no-referrer` 제거, sandbox 정합화, 흰화면 fallback("새 탭에서 열기").
- 허브/상세 page: async 서버 컴포넌트화, searchParams(category/page) URL 상태(route-state-contract), 상세 `dynamicParams`로 feed 게임 on-demand.
- `.env.example`: `GAMEMONETIZE_FEED_URL` 추가(미설정 시 표준 public feed).

## 검증
- typecheck 0, lint 0, vitest 14/14(game-feed 매핑/디코드/slug/카테고리 신규 7케이스).
- `pnpm build` ✓ (`/game-service`=Dynamic, `/game-service/[gameSlug]`=SSG curated).
- 런타임(localhost dev) 실호출: 허브 24카드(curated+라이브 feed: plinko-ledger 등), 카테고리=puzzle 필터, page=2 페이지네이션, 404, 상세 curated(SSG)/feed(on-demand) 200.
- Playwright 증빙: `game-service-screenshots/` — hub-desktop/mobile, detail-poster(클릭 전 iframe 0), detail-playing(클릭 후 `html5.gamemonetize.co` 게임 프레임 로드 = 흰화면 아님).

## 남은 운영 과제
- GameMonetize 대시보드에서 `game.yeon.world` 도메인 승인 + ads.txt verify 후 수익 집계 1회 확인.
- 흔들림 심한 FPS류는 전체화면 강제로 완화되나, 모바일 인라인 동작은 추후 점검.

백로그: `docs/product/backlog/2026-06-20-gamemonetize-feed-integration.md`(실행 확정 섹션 + 9차 임베드 셸 재설계 추가).
