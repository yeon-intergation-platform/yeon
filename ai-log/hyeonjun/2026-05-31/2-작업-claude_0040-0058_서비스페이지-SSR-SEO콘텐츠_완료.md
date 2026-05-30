# 카드/타자/커뮤니티 페이지 SSR SEO 콘텐츠 보강 (색인 미생성 해결)

- 실행 주체: claude
- 시작: 2026-05-31 00:40 / 종료: 2026-05-31 00:58
- 상태: 완료

## 문제 (라이브 진단)

`yeon.world/typing-service`, `/card-service`, `/community`가 색인 안 됨. 라이브 검증 결과:

- HTTP 200, `<meta robots>`=index/follow, self-canonical, sitemap 등재, robots.txt `Allow:/` → **기술적 차단 없음**.
- 그러나 **Googlebot이 받는 SSR 가시 텍스트가 극히 얇음**: typing 552자 / card 564자 / community 267자.
  내용이 전부 "프로필을 불러오는 중", "채팅을 불러오는 중…", "글 목록을 불러오는 중…" 같은 **클라이언트 렌더링 로딩 셸**.
  실제 콘텐츠는 hydration 후 클라이언트 fetch로 채워져 크롤 HTML에 없음.
- 기존 FAQ는 JSON-LD에만 들어가고 가시 HTML로는 렌더 안 됨.
- → 구글 "크롤됨 - 현재 색인 생성되지 않음"(thin/저가치). 사이트맵은 GSC 성공(8개)이라 원인 아님.

## 변경

각 페이지에 **서버 렌더되는 크롤 가능한 콘텐츠 섹션**을 클라이언트 앱 아래에 추가.

- 신규 `apps/web/src/components/service-seo-section.tsx`: 서버 컴포넌트. 소개/주요 기능/FAQ를
  semantic HTML(h2/h3/dl)로 렌더. 디자인 시스템 승인 팔레트(#111/#666/#aaa/#e5e5e5/#fafafa)만 사용.
- `typing-content.ts`/`card-service-content.ts`: `*_SEO_HEADING`, `*_SEO_INTRO`, `*_FEATURES` 추가(실제 기능 기반).
  배럴 index.ts에 export 추가.
- `typing-service/page.tsx`, `card-service/page.tsx`: home 컴포넌트 아래 `<ServiceSeoSection>` 렌더.
- 신규 `community-content.ts`(소개/게시판 분류), `community-seo-section.tsx`(서버 컴포넌트).
- `community/page.tsx`: async 전환, `fetchChatServiceFeedFromSpring()`(인증 불필요)로 **최근 글 SSR**,
  `parseCommunityPost`로 파싱(루트 글만, 최대 8개, 본문 140자). 백엔드 실패 시 try/catch로 빈 배열 graceful degrade.

## 검증

- `pnpm --filter @yeon/web typecheck` / 변경 파일 lint → 통과(에러 0).
- `pnpm --filter @yeon/web build` → 성공(exit 0). `/card-service`,`/typing-service`,`/community` 모두 `ƒ`(동적 SSR) 표기.
- 배포 후 라이브 curl로 SSR 가시 텍스트 증가 재확인 + GSC 색인 재요청 안내 예정.

## 비고

- community fetch는 공개 엔드포인트(인증 불필요), `no-store`라 동적 렌더(기존 typing/card는 이미 동적).
- 서버 컴포넌트는 클라이언트 QueryProvider의 children으로 렌더 → 초기 SSR HTML에 포함됨(Next App Router 패턴).
- 후속(선택): community ISR 캐싱, 페이지별 고유 콘텐츠 추가 확대, 배포 후 GSC URL 검사로 색인 재요청.
