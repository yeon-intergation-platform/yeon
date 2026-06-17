# 공개 콘텐츠 네트워크 500단계 실행 계획

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`, `yeon.world/admin`  
범위: Yeon 유지보수 대상 서비스와 discord-assistant/NEXA. 상담 워크스페이스는 제외한다.

## 요구사항 요약

- `support.yeon.world`는 서비스별 사용법, 튜토리얼, 문제 해결, FAQ를 담당한다.
- `news.yeon.world`는 공식 공지, 업데이트, 업계 뉴스 해설을 담당한다.
- `blog.yeon.world`는 개발기, 기술 글, 제품 제작기, 회고, 제품 철학을 담당한다.
- 디자인은 `https://yeon.world/`의 차분한 흰 배경, 절제된 타이포그래피, 정적인 카드/리스트 톤을 따른다.
- 글은 Yeon repo와 discord-assistant repo의 실제 기능, 문서, 정책을 근거로 작성한다.
- support 글은 사용자가 그대로 따라 할 수 있는 단계형 문서로 작성한다.
- `yeon.world/admin`은 전체 운영 현황, 발행 상태, SEO 상태, 서비스별 콘텐츠 큐를 읽기 전용으로 관제한다.
- 본문 수정/삭제/발행은 초기 admin 범위에서 제외하고, 공개 페이지 관리자 모드나 별도 CMS는 이후 차수에서 별도로 결정한다.

## 현재 근거

- 공개 콘텐츠 채널 정책: `docs/seo/public-content-channel-policy.md`
- Yeon 서비스 목록: `apps/web/src/lib/platform-services.ts`
- Yeon 기존 SEO 유틸: `apps/web/src/lib/seo.ts`
- Yeon 기존 subdomain routing: `apps/web/src/lib/subdomain-routing.ts`
- Yeon 랜딩 디자인 기준: `apps/web/src/features/landing-home/landing-home.tsx`
- Admin 현재 진입점: `apps/web/src/app/admin/page.tsx`
- Backend admin auth 기준: `apps/backend/src/main/java/world/yeon/backend/root_auth`
- discord-assistant/NEXA 근거: `/Users/osuma/coding_stuffs/discord-assitant/README.md`, `docs/FAQ.md`, `docs/BOT_PERMISSIONS.md`, `docs/NEXA_SAFETY_POLICY.md`

## 수용 기준

- 세 서브도메인이 각자 독립된 canonical, robots, sitemap을 가진다.
- 공개 URL은 로그인으로 튕기지 않는다.
- 모든 공개 글은 title, description, canonical, OG, structured data, lastmod를 가진다.
- 상담 워크스페이스 관련 콘텐츠는 만들지 않는다.
- NEXA, typing, card, community, account/policy는 서비스별 support 분류를 가진다.
- mooddesk는 현 정책 범위 밖이므로 별도 유지보수 대상으로 확정될 때까지 audit 항목으로 둔다.
- admin은 초기 버전에서 삭제 중심 도구가 아니라 발행 상태와 품질 상태를 보여주는 운영 도구다.
- 본문은 사람이 직접 읽었을 때 바로 따라 할 수 있어야 한다.

## 1차: 범위 확정과 근거 고정

논의 필요: mooddesk를 공개 콘텐츠 대상에 포함할지 여부.  
선택지: 제외 유지, 별도 보류 섹션, 즉시 포함.  
추천: 현재 정책에 맞춰 보류 섹션으로 두고, 유지보수 대상 확정 후 편입한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 공개 콘텐츠 네트워크의 최상위 목적을 검색 유입, 신뢰 형성, 제품 사용 전환으로 정의한다.
2. `support`, `news`, `blog`의 역할을 정책 문서와 동일하게 다시 확인한다.
3. 상담 워크스페이스가 본 범위에서 제외된다는 제한을 모든 산출물 상단에 명시한다.
4. Yeon 현재 서비스 목록에서 `typing`, `card`, `community`, `discord-ai`, `mooddesk`를 추출한다.
5. 유지보수 정책상 핵심 서비스가 `typing`, `card`, `community`임을 별도 표시한다.
6. discord-assistant repo의 NEXA 문서와 Yeon repo의 `discord-ai` 플랫폼 카드를 연결한다.
7. `account/policy`를 독립 제품은 아니지만 support 공통 분류로 둔다.
8. `mooddesk`는 정책 범위 미확정 항목으로 기록한다.
9. 각 서비스별 공개 콘텐츠가 필요한 사용자 문제를 한 문장으로 쓴다.
10. 각 서비스별 첫 10개 support 글 후보를 만든다.
11. 각 서비스별 첫 5개 notice/update 후보를 만든다.
12. 각 서비스별 첫 5개 blog 후보를 만든다.
13. 기존 `docs/seo/public-content-channel-policy.md`를 상위 정책으로 링크한다.
14. 기존 SEO 유틸의 현재 canonical 대상이 `typing`, `card`, `community`뿐임을 기록한다.
15. 기존 sitemap이 루트/서비스 일부/약관 중심임을 기록한다.
16. 신규 서브도메인 `support`, `news`, `blog`가 sitemap 대상에 추가되어야 함을 기록한다.
17. `discord-ai.yeon.world`가 별도 repo에서 제공된다는 점을 기록한다.
18. `support` 문서가 제품 내부 문서가 아니라 검색 가능한 공개 문서임을 정의한다.
19. `news` 문서가 마케팅 과장이 아니라 공식 변화 기록이어야 함을 정의한다.
20. `blog` 문서가 개발자의 생각과 기술적 맥락을 담는 공간임을 정의한다.
21. 초기 성공 지표를 색인 가능한 공개 URL 수로 잡는다.
22. 2차 성공 지표를 Search Console 노출수와 클릭수로 잡는다.
23. 3차 성공 지표를 support 문서에서 제품 진입 CTA 클릭으로 잡는다.
24. 첫 배포 목표를 빈 페이지 없는 최소 운영 버전으로 정한다.
25. 전체 프로젝트를 설계, 구현, 콘텐츠, SEO, 운영의 5개 흐름으로 나눈다.

## 2차: 정보 구조 설계

논의 필요: 서비스별 하위 경로를 한글 slug로 쓸지 영문 slug로 쓸지.  
선택지: 영문 slug, 한글 slug, 혼합.  
추천: canonical URL은 영문 slug, 제목과 본문은 한국어 중심으로 간다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

26. `support.yeon.world`의 1depth를 서비스 중심으로 설계한다.
27. `support.yeon.world/nexa`를 NEXA/discord-assistant 지원 허브로 둔다.
28. `support.yeon.world/typing`을 타자 서비스 지원 허브로 둔다.
29. `support.yeon.world/card`를 카드 서비스 지원 허브로 둔다.
30. `support.yeon.world/community`를 커뮤니티 지원 허브로 둔다.
31. `support.yeon.world/account`를 계정, 로그인, 개인정보, 정책 허브로 둔다.
32. 각 서비스 허브 아래 `getting-started` 분류를 둔다.
33. 각 서비스 허브 아래 `guides` 분류를 둔다.
34. 각 서비스 허브 아래 `tutorials` 분류를 둔다.
35. 각 서비스 허브 아래 `troubleshooting` 분류를 둔다.
36. 각 서비스 허브 아래 `faq` 분류를 둔다.
37. 각 서비스 허브 아래 `policy` 분류는 필요한 서비스에만 둔다.
38. `news.yeon.world/notice`를 공식 공지 루트로 둔다.
39. `news.yeon.world/notice/nexa`를 NEXA 공지 분류로 둔다.
40. `news.yeon.world/notice/typing`을 타자 공지 분류로 둔다.
41. `news.yeon.world/notice/card`를 카드 공지 분류로 둔다.
42. `news.yeon.world/notice/community`를 커뮤니티 공지 분류로 둔다.
43. `news.yeon.world/updates`를 제품 변경사항 루트로 둔다.
44. `news.yeon.world/updates/nexa`, `/typing`, `/card`, `/community`를 서비스별 업데이트 분류로 둔다.
45. `news.yeon.world/news`를 업계 뉴스 해설 루트로 둔다.
46. `news.yeon.world/news/ai`, `/discord`, `/developer`, `/product`를 해설 분류로 둔다.
47. `blog.yeon.world/engineering`을 기술 글 루트로 둔다.
48. `blog.yeon.world/engineering/backend`, `/frontend`, `/infra`, `/ai`를 기술 하위 분류로 둔다.
49. `blog.yeon.world/product/nexa`, `/typing`, `/card`, `/community`를 제품 제작기 분류로 둔다.
50. `blog.yeon.world/devlog`와 `/essay`를 개발 일지, 짧은 생각, 회고 루트로 둔다.

## 3차: 도메인, 라우팅, 인프라 준비

논의 필요: 세 서브도메인을 Yeon web 단일 앱에서 host rewrite로 처리할지, 별도 앱으로 분리할지.  
선택지: 단일 Next.js 앱, 별도 Next.js 앱, 정적 사이트 생성.  
추천: 초기에는 단일 Yeon web 앱에서 host rewrite로 처리하고, 트래픽이 커지면 분리한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

51. Cloudflare에 `support.yeon.world` DNS 레코드가 있는지 확인한다.
52. Cloudflare에 `news.yeon.world` DNS 레코드가 있는지 확인한다.
53. Cloudflare에 `blog.yeon.world` DNS 레코드가 있는지 확인한다.
54. 세 레코드가 없으면 기존 `typing`, `card`, `community`와 같은 origin 정책으로 추가한다.
55. TLS 인증서가 세 서브도메인을 커버하는지 확인한다.
56. Cloudflare proxy 상태가 운영 정책과 맞는지 확인한다.
57. nginx 또는 ingress가 세 host를 Yeon web으로 전달하는지 확인한다.
58. 로컬 개발에서 host 기반 라우팅을 테스트할 수 있는 방법을 문서화한다.
59. `apps/web/src/lib/subdomain-routing.ts`에 콘텐츠 host rewrite 후보를 설계한다.
60. `support` host는 `/support` 내부 route로 rewrite하는 방식을 검토한다.
61. `news` host는 `/newsroom` 또는 `/news` 내부 route로 rewrite하는 방식을 검토한다.
62. `blog` host는 `/blog` 내부 route로 rewrite하는 방식을 검토한다.
63. 기존 서비스 subdomain rewrite와 충돌하지 않는 prefix를 정한다.
64. `/robots.txt`와 `/sitemap.xml`은 host별 응답을 유지한다.
65. `/api`, `/auth`, `/admin` 경로는 공개 host에서 노출하지 않을 정책을 정한다.
66. 공개 host에서 관리 기능 접근 시 루트 host admin으로 이동시키는 정책을 정한다.
67. canonical host가 path host와 항상 일치하도록 규칙을 만든다.
68. `www.support.yeon.world` 같은 변형 host 처리 정책을 정한다.
69. HTTP에서 HTTPS로 리다이렉트되는지 확인한다.
70. `news`, `blog`, `support`의 404 페이지가 로그인 페이지로 가지 않게 한다.
71. host별 sitemap 경로가 검색엔진에 노출되는지 확인한다.
72. host별 robots가 sitemap URL을 정확히 가리키게 한다.
73. 배포 환경 변수에 public base URL 목록을 추가할 필요가 있는지 검토한다.
74. Cloudflare 캐시 정책이 draft/admin 응답을 캐시하지 않도록 설계한다.
75. 인프라 변경 후 Search Console 등록 순서를 운영 문서에 연결한다.

## 4차: Backend 콘텐츠 도메인 설계

논의 필요: 첫 버전을 DB 기반 CMS로 만들지, MDX 파일 기반으로 시작할지.  
선택지: Spring DB CMS, 파일 기반 MDX, 하이브리드.  
추천: 운영/SEO/발행 상태 관리가 필요하므로 Spring DB CMS를 기본으로 하고, seed/import만 MDX를 허용한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

76. 콘텐츠 원천을 Spring backend DB로 둘지 최종 결정한다.
77. `content_article` 테이블 초안을 작성한다.
78. article id는 내부 UUID 또는 bigint 중 기존 백엔드 관례에 맞춘다.
79. `channel` 필드에 `support`, `news`, `blog` 값을 둔다.
80. `service_key` 필드에 `nexa`, `typing`, `card`, `community`, `account` 값을 둔다.
81. `category` 필드에 `guides`, `faq`, `notice`, `engineering` 같은 분류를 둔다.
82. `slug`는 channel 안에서 유일하게 관리한다.
83. `title`은 검색형 한국어 제목을 저장한다.
84. `description`은 SERP용 80자 안팎 설명으로 저장한다.
85. `body`는 Markdown 또는 portable rich text 중 하나로 저장한다.
86. `body_format`을 두어 Markdown 확장 가능성을 남긴다.
87. `status`는 `draft`, `review`, `published`, `archived`로 둔다.
88. `visibility`는 `public`, `unlisted`, `internal`로 둔다.
89. `published_at`을 색인 기준 날짜로 둔다.
90. `updated_at`을 sitemap lastmod 기준으로 둔다.
91. `canonical_url`은 파생값으로 만들지 저장값으로 둘지 결정한다.
92. `meta_title`을 선택 필드로 두고 없으면 `title`에서 파생한다.
93. `meta_description`을 선택 필드로 두고 없으면 `description`에서 파생한다.
94. `og_image_url`을 선택 필드로 둔다.
95. `author_key`를 개인 이름보다 운영 주체 기준으로 둔다.
96. `source_repo`와 `source_path`를 근거 추적용으로 둔다.
97. `redirect_to`를 archive 이후 301 대상 관리용으로 둔다.
98. `noindex`를 draft/unlisted 보조 플래그로 둔다.
99. `content_article_revision` 테이블 필요성을 검토한다.
100.  Flyway migration 파일을 backend 관례에 맞춰 설계한다.

## 5차: API 계약과 클라이언트 경계

논의 필요: 공개 조회 API를 backend public API로 둘지 Next server에서만 호출할지.  
선택지: 공개 REST API, Next BFF 전용, GraphQL.  
추천: Spring 공개 REST API와 typed client를 만들고, Next는 렌더링/BFF 역할만 한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

101. `packages/api-contract`에 콘텐츠 channel literal을 추가한다.
102. `packages/api-contract`에 서비스 key literal을 추가한다.
103. `packages/api-contract`에 콘텐츠 status literal을 추가한다.
104. 공개 article summary schema를 정의한다.
105. 공개 article detail schema를 정의한다.
106. admin article draft schema를 정의한다.
107. article create request schema를 정의한다.
108. article update request schema를 정의한다.
109. publish request schema를 정의한다.
110. archive request schema를 정의한다.
111. list query schema에 channel, service, category, status 필터를 둔다.
112. slug detail query schema를 둔다.
113. sitemap query response schema를 둔다.
114. `packages/api-client`에 public content client를 추가한다.
115. `packages/api-client`에 admin content client를 추가한다.
116. web에서 raw fetch를 흩뿌리지 않도록 client wrapper를 사용한다.
117. mobile 영향이 없는 web-only API인지 parity registry 관점에서 확인한다.
118. 공용 계약 추가가 mobile 빌드를 깨지 않는지 확인한다.
119. backend controller route prefix를 `/api/v1/content`로 설계한다.
120. admin controller route prefix를 `/api/v1/admin/content`로 설계한다.
121. public API는 `published`와 `public`만 반환하도록 제한한다.
122. admin API는 admin auth check를 통과한 사용자만 접근하게 한다.
123. slug 중복은 backend에서 fail fast 처리한다.
124. 없는 article은 공개 API에서 404로 응답한다.
125. archived article의 redirect 정책은 후속 CMS/redirect 설계에서 별도로 다룬다.

## 6차: Admin 운영 대시보드 설계

논의 필요: admin에서 본문 편집을 언제까지 제외할지.  
선택지: 초기 제외, 최소 Markdown 편집 포함, 전체 CMS 포함.  
추천: 초기에는 읽기 전용 운영 대시보드만 만들고, 생성/발행/본문 편집은 공개 페이지 관리자 모드 또는 별도 CMS 차수에서 다시 결정한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

126. `/admin/content`를 콘텐츠 운영 대시보드 진입점으로 만든다.
127. `/admin/content/support`를 support 운영 화면으로 만든다.
128. `/admin/content/news`를 news 운영 화면으로 만든다.
129. `/admin/content/blog`를 blog 운영 화면으로 만든다.
130. 콘텐츠 전체 상태 카운트를 보여준다.
131. draft 글 수를 보여준다.
132. review 글 수를 보여준다.
133. published 글 수를 보여준다.
134. archived 글 수를 보여준다.
135. noindex 글 수를 보여준다.
136. sitemap 포함 글 수를 보여준다.
137. 메타 설명 누락 글 수를 보여준다.
138. canonical 누락 글 수를 보여준다.
139. 서비스별 콘텐츠 수를 보여준다.
140. 분류별 콘텐츠 수를 보여준다.
141. 최근 발행 글 목록을 보여준다.
142. 최근 수정 글 목록을 보여준다.
143. SEO 경고 목록을 보여준다.
144. 공개 페이지 바로가기 링크를 제공한다.
145. 공개 페이지 미리보기 링크를 제공한다.
146. 새 글 초안 생성 버튼은 초기 버전에서 제공하지 않는다.
147. 글 삭제 버튼은 초기 버전에서 제공하지 않는다.
148. archive 전환 버튼은 초기 버전에서 제공하지 않는다.
149. create, update, publish, archive, hard delete는 API와 UI 모두 초기 버전에서 숨긴다.
150. admin 화면은 조용한 업무형 UI로 설계한다.

## 7차: 공개 콘텐츠 런타임 구조

논의 필요: Next App Router route 구조에서 channel별 코드를 분리할지 공용 템플릿으로 합칠지.  
선택지: channel별 route, 공용 route와 channel config, 완전 분리 앱.  
추천: 공용 콘텐츠 엔진과 channel config를 쓰고, channel별 홈/목록만 분리한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

151. `apps/web/src/features/public-content` feature slice를 만든다.
152. channel config 파일을 만든다.
153. service config 파일을 만든다.
154. category config 파일을 만든다.
155. support 홈 컴포넌트를 만든다.
156. news 홈 컴포넌트를 만든다.
157. blog 홈 컴포넌트를 만든다.
158. 공용 article card 컴포넌트를 만든다.
159. 공용 article list 컴포넌트를 만든다.
160. 공용 article detail 컴포넌트를 만든다.
161. 공용 breadcrumb 컴포넌트를 만든다.
162. 공용 service nav 컴포넌트를 만든다.
163. 공용 category nav 컴포넌트를 만든다.
164. 공용 related articles 컴포넌트를 만든다.
165. 공용 table of contents 컴포넌트를 만든다.
166. Markdown renderer를 안전하게 선택한다.
167. 외부 링크는 `rel` 정책을 적용한다.
168. 이미지 렌더링은 width/height 안정성을 확보한다.
169. code block 스타일을 차분하게 만든다.
170. step list 스타일을 support 문서에 맞게 만든다.
171. empty state는 공개 페이지에 노출하지 않도록 발행 최소 수를 보장한다.
172. article detail은 서버 렌더링 또는 static generation을 우선한다.
173. preview/admin mode는 public index에서 제외한다.
174. public route의 auth redirect 의존을 제거한다.
175. 404 페이지는 관련 글 또는 channel 홈으로 이동할 수 있게 한다.

## 8차: Support 디자인 시스템

논의 필요: support를 문서 사이트처럼 만들지, 제품 도움말 센터처럼 만들지.  
선택지: 문서 사이트형, 도움말 센터형, 혼합형.  
추천: 검색 유입과 초보자 행동을 위해 도움말 센터형으로 간다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

176. support 홈 첫 화면에 검색 또는 주요 문제 진입을 배치한다.
177. support 홈의 H1은 설명형이 아니라 도움말 센터 정체성을 드러내게 한다.
178. 배경은 흰색을 기본으로 한다.
179. 텍스트 기본색은 기존 Yeon 톤인 `#111` 계열을 따른다.
180. 보조 텍스트는 `#666` 계열을 따른다.
181. 경계선은 `#e5e5e5` 계열을 따른다.
182. 카드 배경은 `#fafafa` 계열을 따른다.
183. rounded radius는 기존 카드보다 과하게 키우지 않는다.
184. 장식용 gradient orb는 사용하지 않는다.
185. 랜딩형 hero 이미지는 사용하지 않는다.
186. 서비스별 진입 카드는 2열 또는 3열로 정리한다.
187. 모바일에서는 서비스 카드를 1열로 안정적으로 쌓는다.
188. support 글 detail은 읽기 폭을 680px에서 760px 사이로 제한한다.
189. 좌측 목차는 데스크톱에서만 제공한다.
190. 모바일 목차는 접힘 패널로 제공한다.
191. 본문 단계 번호는 명확한 시각 계층을 준다.
192. 주의 박스는 빨간색 남용 없이 경계선과 배경으로 구분한다.
193. 성공/완료 박스는 조용한 녹색 계열로 제한한다.
194. CTA는 글 하단에만 넣어 본문을 방해하지 않게 한다.
195. NEXA 글에는 Discord 초대 또는 설치 CTA를 둔다.
196. typing 글에는 타자 서비스 바로가기 CTA를 둔다.
197. card 글에는 카드 서비스 바로가기 CTA를 둔다.
198. community 글에는 커뮤니티 바로가기 CTA를 둔다.
199. FAQ는 accordion보다 색인 가능한 HTML heading 구조를 우선한다.
200. support 디자인은 기능 설명 텍스트보다 실제 해결 단계가 먼저 보이게 한다.

## 9차: News 디자인 시스템

논의 필요: news를 언론형으로 보이게 할지, 브랜드 공식 소식형으로 보이게 할지.  
선택지: 언론형, 공식 소식형, 혼합형.  
추천: 공식 소식형을 기본으로 하고 업계 해설만 별도 분류로 둔다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

201. news 홈은 최신 공지와 제품 업데이트를 우선 보여준다.
202. `notice`와 `updates`를 `news`보다 위에 배치한다.
203. 업계 뉴스 해설은 과도한 언론 사이트 느낌을 피한다.
204. 제목은 사실 중심으로 쓴다.
205. 공지 글에는 적용 서비스와 적용일을 상단에 표시한다.
206. 업데이트 글에는 변경 요약과 사용자 영향도를 표시한다.
207. 업계 뉴스 글에는 Yeon 서비스와의 관련성을 표시한다.
208. news 카드에는 발행일을 명확히 표시한다.
209. news 카드에는 서비스 badge를 표시한다.
210. news 홈의 featured 영역은 하나만 둔다.
211. **[완료]** 공지 목록은 서비스 필터를 제공한다.
212. **[완료]** 업데이트 목록은 서비스 필터를 제공한다.
213. **[완료]** 업계 뉴스 목록은 주제 필터를 제공한다.
214. **[완료]** 공지 detail에는 `무엇이 바뀌었나요` 섹션을 둔다.
215. **[완료]** 공지 detail에는 `사용자에게 영향이 있나요` 섹션을 둔다.
216. **[완료]** 공지 detail에는 `필요한 조치` 섹션을 둔다.
217. **[완료]** 업데이트 detail에는 `변경 전`과 `변경 후`를 둔다.
218. **[완료]** 업데이트 detail에는 관련 support 문서 링크를 둔다.
219. **[완료]** news detail에는 관련 blog 글 링크를 둔다.
220. **[완료]** 외부 업계 뉴스 인용은 짧게 요약하고 출처 링크를 둔다.
221. **[완료]** 원문 복사는 하지 않는다.
222. **[완료]** news 글은 과장된 마케팅 문장을 피한다.
223. **[완료]** news 홈은 `yeon.world`와 같은 정적이고 차분한 톤을 유지한다.
224. **[완료]** 긴 공지는 본문 목차를 제공한다.
225. **[완료]** 보도자료처럼 보이는 문장은 실제 공지일 때만 사용한다.

## 10차: Blog 디자인 시스템

논의 필요: 블로그를 개인 개발 블로그처럼 둘지 브랜드 기술 블로그처럼 둘지.  
선택지: 개인형, 브랜드형, 혼합형.  
추천: 개인 제작기 느낌을 살리되, 구조와 품질은 브랜드 기술 블로그처럼 관리한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

226. **[완료]** blog 홈은 `engineering`, `product`, `devlog`, `essay`를 분명히 나눈다.
227. **[완료]** engineering 글은 기술 선택과 구현 근거를 중심으로 쓴다.
228. **[완료]** product 글은 왜 만들었는지와 사용자 문제를 중심으로 쓴다.
229. **[완료]** devlog 글은 진행 상황과 배운 점을 중심으로 쓴다.
230. **[완료]** essay 글은 짧고 개인적인 관점을 허용한다.
231. **[완료]** blog 홈에는 최신 글 목록을 먼저 보여준다.
232. **[완료]** blog 홈에는 분류별 대표 글을 보여준다.
233. **[완료]** blog 카드에는 분류, 날짜, 읽는 시간을 표시한다.
234. **[완료]** blog detail에는 작성자 또는 운영 주체를 표시한다.
235. **[완료]** blog detail에는 관련 support 문서 링크를 둔다.
236. **[완료]** blog detail에는 관련 news 공지 링크를 둔다.
237. **[완료]** code block은 engineering 글에서만 주요 요소로 쓴다.
238. **[완료]** 제품 제작기에는 스크린샷을 선택적으로 허용한다.
239. **[완료]** 이미지 없는 글도 어색하지 않게 타이포그래피 중심으로 설계한다.
240. **[완료]** 글 제목은 추상적 감성 문장보다 검색 가능한 구체 문장을 우선한다.
241. **[완료]** 개발 회고 글은 실패와 결정 근거를 숨기지 않는다.
242. **[완료]** 제품 철학 글은 실제 기능과 연결한다.
243. **[완료]** engineering 글은 repo 근거를 링크한다.
244. **[완료]** blog 홈은 과도한 hero 영역을 만들지 않는다.
245. **[완료]** blog detail의 본문 폭은 support보다 약간 넓혀도 된다.
246. **[완료]** 목차는 긴 engineering 글에만 기본 노출한다.
247. **[완료]** essay 글은 목차를 기본 숨김으로 둔다.
248. **[완료]** RSS 또는 feed 제공 여부를 검토한다.
249. **[완료]** author page는 초기 버전에서는 만들지 않는다.
250. **[완료]** blog 디자인은 조용하지만 빈약해 보이지 않도록 spacing을 정교하게 잡는다.

## 11차: 공개 페이지 운영 확인 모드

논의 필요: 공개 페이지에서 관리자 전용 확인 모드를 어디까지 제공할지.
선택지: 확인 모드만 제공, 편집 모드 포함, 별도 CMS로 분리.
추천: 초기에는 확인 모드만 제공하고, 편집 모드와 CMS는 별도 차수에서 결정한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

251. **[완료]** admin session이 있는 사용자만 운영 확인 도구를 볼 수 있게 한다.
252. **[완료]** 공개 article detail에서 운영 확인 toolbar를 조건부 렌더링한다.
253. **[완료]** toolbar에는 draft 보기 링크를 둔다.
254. **[완료]** toolbar에는 수정 링크를 두지 않는다.
255. **[완료]** toolbar에는 archive 링크를 두지 않는다.
256. **[완료]** toolbar에는 SEO 검사 링크를 둔다.
257. **[완료]** toolbar에는 sitemap 포함 여부를 표시한다.
258. **[완료]** 공개 사용자 HTML에는 toolbar markup이 렌더링되지 않게 한다.
259. **[완료]** 수정 화면은 초기 버전에서 만들지 않는다.
260. **[완료]** 본문 수정 UI는 초기 버전에서 만들지 않는다.
261. **[완료]** 제목 수정 UI는 초기 버전에서 만들지 않는다.
262. **[완료]** 설명 수정 UI는 초기 버전에서 만들지 않는다.
263. **[완료]** category 수정 UI는 초기 버전에서 만들지 않는다.
264. **[완료]** service 수정 UI는 초기 버전에서 만들지 않는다.
265. **[완료]** slug 변경 정책은 후속 CMS/redirect 차수에서 다룬다.
266. **[완료]** publish 후 slug redirect 정책은 후속 CMS/redirect 차수에서 다룬다.
267. **[완료]** 저장 action은 초기 버전에서 만들지 않는다.
268. **[완료]** 발행 action은 초기 버전에서 만들지 않는다.
269. **[완료]** archive action은 초기 버전에서 만들지 않는다.
270. **[완료]** hard delete는 API와 UI 모두에서 숨긴다.
271. **[완료]** autosave는 초기 버전에서 만들지 않는다.
272. **[완료]** preview는 서버 렌더링 결과를 보여준다.
273. **[완료]** validation error는 한국어로 보여준다.
274. **[완료]** 저장 실패 시 기존 본문을 잃지 않게 한다.
275. **[완료]** 관리자 모드는 SEO index에서 제외한다.

## 12차: SEO, sitemap, structured data

논의 필요: structured data를 어디까지 넣을지.  
선택지: Article만, FAQPage/HowTo 포함, 단계별 확장.  
추천: Article과 BreadcrumbList를 먼저 넣고, 검증 가능한 support 문서에만 FAQPage/HowTo를 추가한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

276. **[완료]** `SERVICE_CANONICAL_URLS` 또는 새 canonical config에 support/news/blog를 추가한다.
277. **[완료]** host별 canonical base URL을 정의한다.
278. **[완료]** host별 sitemap generator를 확장한다.
279. **[완료]** support sitemap에는 published public support 글만 넣는다.
280. **[완료]** news sitemap에는 published public news 글만 넣는다.
281. **[완료]** blog sitemap에는 published public blog 글만 넣는다.
282. **[완료]** draft, review, archived, noindex 글은 sitemap에서 제외한다.
283. **[완료]** robots.txt는 각 host별 sitemap URL을 가리킨다.
284. **[완료]** robots.txt는 admin, api, auth, preview path를 disallow한다.
285. **[완료]** article detail metadata generator를 만든다.
286. **[완료]** title은 `글 제목 | YEON Support` 같은 channel별 suffix를 사용한다.
287. **[완료]** description은 article meta description에서 가져온다.
288. **[완료]** canonical은 host와 slug 기준으로 생성한다.
289. **[완료]** OG title과 description을 설정한다.
290. **[완료]** OG image가 없으면 channel 기본 이미지를 사용한다.
291. **[완료]** Twitter card metadata를 설정한다.
292. **[완료]** Article structured data를 생성한다.
293. **[완료]** BreadcrumbList structured data를 생성한다.
294. **[완료]** support FAQ 글에는 검증 가능한 경우 FAQPage structured data를 생성한다.
295. **[완료]** 단계형 support 글에는 검증 가능한 경우 HowTo structured data를 생성한다.
296. **[완료]** structured data가 본문과 다른 내용을 말하지 않게 한다.
297. **[완료]** sitemap lastmod는 `updated_at` 또는 `published_at` 기준으로 계산한다.
298. **[완료]** 관련 글 링크는 크롤링 가능한 anchor로 렌더링한다.
299. **[완료]** 빈 category 페이지는 noindex 또는 비공개 처리한다.
300. **[완료]** Search Console 제출 대상 URL-prefix 목록에 support/news/blog를 추가한다.

## 13차: NEXA support 초기 콘텐츠

논의 필요: NEXA 문서에서 provider 대상 글과 일반 Discord 서버 관리자 대상 글의 비율.  
선택지: 사용자 우선, provider 우선, 균형.  
추천: 검색 전환 가능성이 큰 Discord 서버 관리자용 글을 먼저 만들고 provider 글을 이어서 만든다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

301. **[완료]** `디스코드 서버에 NEXA AI 봇 추가하는 방법` 글을 작성한다.
302. **[완료]** `NEXA 봇에게 필요한 디스코드 권한` 글을 작성한다.
303. **[완료]** `NEXA 봇이 응답하지 않을 때 해결 방법` 글을 작성한다.
304. **[완료]** `NEXA 봇이 특정 채널에서만 답변하게 설정하는 법` 글을 작성한다.
305. **[완료]** `NEXA 무료 플랜과 유료 플랜 차이` 글 후보를 작성한다.
306. **[완료]** `NEXA 서버별 AI 말투를 설정하는 방법` 글 후보를 작성한다.
307. **[완료]** `AI가 답변하면 안 되는 채널을 제외하는 법` 글 후보를 작성한다.
308. **[완료]** `NEXA 봇을 서버에서 제거하는 방법` 글을 작성한다.
309. **[완료]** `NEXA 개인정보와 대화 데이터 처리 방식` 글을 작성한다.
310. **[완료]** `NEXA 업데이트와 공지를 확인하는 곳` 글을 작성한다.
311. **[완료]** provider 대상 `내 컴퓨터의 Ollama를 NEXA에 연결하는 방법` 글 후보를 작성한다.
312. **[완료]** provider 대상 `provider-agent 안전하게 설치하는 방법` 글 후보를 작성한다.
313. **[완료]** provider 대상 `NEXA Provider Pool이 작동하는 방식` 글 후보를 작성한다.
314. **[완료]** admin 대상 `NEXA 관리자 정책과 안전장치` 글 후보를 작성한다.
315. **[완료]** `BOT_PERMISSIONS.md`의 권한 bitfield를 일반 사용자가 이해할 말로 풀어쓴다.
316. **[완료]** `Message Content Intent` 설명을 developer portal 단계로 풀어쓴다.
317. **[완료]** `Manage Webhooks` fallback 내용을 문제 해결 글에 반영한다.
318. **[완료]** `FAQ.md`의 general FAQ를 support FAQ로 변환한다.
319. **[완료]** `NEXA_SAFETY_POLICY.md`의 핵심 안전 원칙을 policy 글로 변환한다.
320. **[완료]** 각 NEXA support 글에 Discord 설정 화면 기준 체크리스트를 넣는다.
321. **[완료]** 각 NEXA support 글에 실패했을 때 확인할 항목을 넣는다.
322. **[완료]** 각 NEXA support 글에 관련 FAQ 링크를 넣는다.
323. **[완료]** 각 NEXA support 글에 관련 news/update 링크를 넣을 자리를 둔다.
324. **[완료]** NEXA 글의 CTA는 `discord-ai.yeon.world` 설치 흐름으로 연결한다.
325. **[완료]** NEXA 글 전체를 초보자가 그대로 따라 할 수 있는 단계형으로 검수한다.

## 14차: Yeon 서비스 support 초기 콘텐츠

논의 필요: 첫 공개 support 범위를 세 서비스 동일 수량으로 맞출지, 검색 가능성이 큰 서비스부터 늘릴지.  
선택지: 균등 발행, 검색량 우선, 완성도 우선.  
추천: 각 서비스 최소 5개를 맞춘 뒤 NEXA와 typing을 먼저 확장한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

326. **[완료]** `타자연습을 시작하는 방법` 글을 작성한다.
327. **[완료]** `타자방에 입장하는 방법` 글을 작성한다.
328. **[완료]** `타자 레이스가 시작되지 않을 때 해결 방법` 글을 작성한다.
329. **[완료]** `타자 결과가 저장되지 않을 때 확인할 것` 글을 작성한다.
330. **[완료]** `typing.yeon.world가 열리지 않을 때 해결 방법` 글을 작성한다.
331. **[완료]** `플래시카드 덱을 만드는 방법` 글을 작성한다.
332. **[완료]** `카드를 추가하고 수정하는 방법` 글을 작성한다.
333. **[완료]** `카드 학습을 시작하는 방법` 글을 작성한다.
334. **[완료]** `카드 데이터가 보이지 않을 때 확인할 것` 글을 작성한다.
335. **[완료]** `card.yeon.world가 열리지 않을 때 해결 방법` 글을 작성한다.
336. **[완료]** `커뮤니티에 글을 쓰는 방법` 글을 작성한다.
337. **[완료]** `커뮤니티에서 댓글을 남기는 방법` 글을 작성한다.
338. **[완료]** `커뮤니티 글이 보이지 않을 때 확인할 것` 글을 작성한다.
339. **[완료]** `community.yeon.world가 열리지 않을 때 해결 방법` 글을 작성한다.
340. **[완료]** `커뮤니티 이용 정책` 글을 작성한다.
341. **[완료]** `YEON 계정으로 로그인하는 방법` 글을 작성한다.
342. **[완료]** `로그인이 풀릴 때 확인할 것` 글을 작성한다.
343. **[완료]** `개인정보는 어떻게 처리되나요` 글을 작성한다.
344. **[완료]** `서비스별 공개 URL과 접속 주소` 글을 작성한다.
345. **[완료]** `오류를 신고하는 방법` 글을 작성한다.
346. **[완료]** 각 typing 글에 레이스 서버 연결 여부 확인 단계를 넣는다.
347. **[완료]** 각 card 글에 게스트와 로그인 사용자 차이를 설명한다.
348. **[완료]** 각 community 글에 공개성과 사용자 행동 기준을 설명한다.
349. **[완료]** account 글은 특정 서비스보다 Yeon 전체 정책 기준으로 작성한다.
350. **[완료]** mooddesk는 유지보수 대상 확정 전까지 공개 support 글을 만들지 않는다.

## 15차: News와 Blog 초기 콘텐츠

논의 필요: 업계 뉴스 해설을 어느 정도까지 운영할지.  
선택지: 제품 공지만, 제품 공지와 업데이트, 업계 해설 포함.  
추천: 제품 공지와 업데이트를 먼저 만들고, 업계 해설은 월간 요약으로 작게 시작한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

351. `NEXA 공개 지원 문서가 시작됩니다` 공지 초안을 작성한다.
352. `YEON support.yeon.world 오픈 안내` 공지 초안을 작성한다.
353. `news.yeon.world 운영 원칙 안내` 공지 초안을 작성한다.
354. `blog.yeon.world 운영 원칙 안내` 공지 초안을 작성한다.
355. `typing.yeon.world 지원 문서 추가 안내` 업데이트 초안을 작성한다.
356. `card.yeon.world 지원 문서 추가 안내` 업데이트 초안을 작성한다.
357. `community.yeon.world 지원 문서 추가 안내` 업데이트 초안을 작성한다.
358. `discord-ai.yeon.world sitemap 등록 안내` 내부 공지 초안을 작성한다.
359. `NEXA 권한 안내 문서 업데이트` 업데이트 초안을 작성한다.
360. `YEON 공개 콘텐츠 채널 분리 결정` blog product 글을 작성한다.
361. `왜 support와 blog와 news를 나누었는가` blog product 글을 작성한다.
362. `NEXA를 Discord 서버 운영자 관점에서 설계하는 이유` blog product 글을 작성한다.
363. `타자 서비스에서 실시간 서버가 필요한 이유` blog engineering 글 후보를 작성한다.
364. `플래시카드 서비스에서 게스트 사용성을 고려한 이유` blog product 글 후보를 작성한다.
365. `커뮤니티 기능을 작게 시작하는 이유` blog product 글 후보를 작성한다.
366. `Yeon 공개 URL과 canonical 정리 기록` blog engineering 글 후보를 작성한다.
367. `Search Console과 sitemap을 운영에 넣는 이유` blog engineering 글 후보를 작성한다.
368. `NEXA Provider Pool의 기본 구조` blog engineering 글 후보를 작성한다.
369. `AI 봇 안전 정책을 문서로 먼저 공개하는 이유` blog essay 글 후보를 작성한다.
370. `개인 개발 제품에서 support 문서가 중요한 이유` blog essay 글 후보를 작성한다.
371. news 공지는 짧고 실행 정보 중심으로 작성한다.
372. blog 글은 실제 repo 근거 링크를 포함한다.
373. 업계 뉴스 해설은 외부 기사 요약보다 Yeon 사용자에게 주는 의미를 중심으로 작성한다.
374. 초기 news/blog 글은 최소 10개만 발행하고 나머지는 draft로 둔다.
375. 모든 초기 글은 서로 내부 링크를 연결한다.

## 16차: 작성, import, 발행 워크플로우

논의 필요: 초기 글을 수동 DB 입력으로 넣을지 seed/import 스크립트로 넣을지.  
선택지: 수동 입력, JSON/Markdown import, SQL seed.  
추천: Markdown 또는 JSON import 스크립트를 만들고, 운영 DB에는 admin API로 반영한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

376. 초기 콘텐츠 원고 저장 위치를 정한다.
377. 원고 파일명 규칙을 `channel-service-category-slug.md`로 정한다.
378. 원고 frontmatter 필드를 정의한다.
379. frontmatter에 title을 둔다.
380. frontmatter에 description을 둔다.
381. frontmatter에 channel을 둔다.
382. frontmatter에 service를 둔다.
383. frontmatter에 category를 둔다.
384. frontmatter에 slug를 둔다.
385. frontmatter에 status를 둔다.
386. frontmatter에 source_repo를 둔다.
387. frontmatter에 source_path를 둔다.
388. Markdown import parser를 만든다.
389. import 결과를 contract schema로 검증한다.
390. 중복 slug를 import 단계에서 차단한다.
391. draft import와 publish import를 분리한다.
392. 운영 DB 반영 전 dry-run을 제공한다.
393. dry-run 결과에 생성, 수정, 건너뜀 수를 표시한다.
394. import 실패 메시지는 한국어로 작성한다.
395. source path가 없는 글은 경고 처리한다.
396. 본문에 빈 heading이 있으면 실패 처리한다.
397. 본문에 외부 링크만 있고 자체 설명이 없으면 경고 처리한다.
398. 발행 전 checklist를 admin에 표시한다.
399. 발행 후 sitemap 갱신 여부를 확인한다.
400. import workflow를 docs에 남긴다.

## 17차: QA, 보안, 접근성, 성능

논의 필요: Playwright 검증을 어느 페이지 수까지 자동화할지.  
선택지: 핵심 홈만, 홈과 대표 글, 전체 발행 글.  
추천: 홈과 대표 글을 자동화하고, 전체 발행 글은 sitemap 기반 smoke로 확장한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

401. support 홈 Playwright smoke를 작성한다.
402. news 홈 Playwright smoke를 작성한다.
403. blog 홈 Playwright smoke를 작성한다.
404. support 대표 글 detail smoke를 작성한다.
405. news 대표 글 detail smoke를 작성한다.
406. blog 대표 글 detail smoke를 작성한다.
407. 공개 URL이 로그인으로 redirect되지 않는지 테스트한다.
408. draft URL이 공개 사용자에게 노출되지 않는지 테스트한다.
409. admin toolbar가 공개 사용자 HTML에 없는지 테스트한다.
410. robots.txt가 200으로 응답하는지 테스트한다.
411. sitemap.xml이 200으로 응답하는지 테스트한다.
412. sitemap URL들이 200으로 응답하는지 테스트한다.
413. canonical이 host와 일치하는지 테스트한다.
414. metadata title이 비어 있지 않은지 테스트한다.
415. metadata description이 비어 있지 않은지 테스트한다.
416. structured data JSON이 parse되는지 테스트한다.
417. 모바일 viewport에서 텍스트가 넘치지 않는지 확인한다.
418. 데스크톱 viewport에서 본문 폭이 과도하지 않은지 확인한다.
419. 키보드 포커스 이동이 가능한지 확인한다.
420. heading hierarchy가 H1 하나와 순차 heading을 유지하는지 확인한다.
421. 색 대비를 기본 기준 이상으로 맞춘다.
422. LCP를 악화시키는 큰 이미지를 초기 버전에서 피한다.
423. markdown HTML injection을 차단한다.
424. admin API는 CSRF/session 정책을 기존 admin auth와 맞춘다.
425. public API rate limit 또는 cache 정책을 검토한다.

## 18차: 분석, Search Console, 운영 지표

논의 필요: GA4 직접 gtag 유지와 GTM 전환 중 어느 쪽을 선택할지.  
선택지: 기존 gtag 유지, GTM 전환, 둘 다 병행.  
추천: 기존 gtag를 유지하고, GTM은 필요할 때 별도 전환한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

426. Search Console에 `support.yeon.world` URL-prefix property를 등록한다.
427. Search Console에 `news.yeon.world` URL-prefix property를 등록한다.
428. Search Console에 `blog.yeon.world` URL-prefix property를 등록한다.
429. domain property `sc-domain:yeon.world`가 유지되는지 확인한다.
430. 각 host sitemap을 Search Console에 제출한다.
431. 제출 결과를 운영 문서에 기록한다.
432. Google Site Verification token 위치를 문서화한다.
433. verification token을 secret으로 노출하지 않게 관리한다.
434. GA4 측정 ID가 공개 콘텐츠 host에 적용되는지 확인한다.
435. host별 page_view가 분리 확인되는지 확인한다.
436. support 글 하단 CTA click event를 정의한다.
437. news 글 관련 support 링크 click event를 정의한다.
438. blog 글 관련 support 링크 click event를 정의한다.
439. Search Console 노출수 weekly snapshot 절차를 만든다.
440. 색인 제외 페이지 리포트를 월 1회 확인한다.
441. 404 증가 여부를 월 1회 확인한다.
442. canonical mismatch를 월 1회 확인한다.
443. sitemap 제출 실패를 알림 대상으로 둔다.
444. 발행 글별 query 유입을 추적한다.
445. support 글별 전환 CTA 클릭을 추적한다.
446. news 글별 제품 링크 클릭을 추적한다.
447. blog 글별 관련 문서 클릭을 추적한다.
448. admin dashboard에 Search Console 수동 확인 링크를 둔다.
449. 자동 Google API 연동은 credential 준비 후 별도 작업으로 둔다.
450. GitHub API 폴링은 8분 이상 간격 원칙을 운영 문서에 유지한다.

## 19차: 배포, 릴리즈, 운영 반영

논의 필요: 콘텐츠 플랫폼 첫 배포를 한 번에 할지 기능별로 나눌지.  
선택지: 한 번에 배포, backend/API 먼저, public UI 먼저.  
추천: backend/API와 public UI를 함께 배포하되 콘텐츠는 draft부터 점진 발행한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

451. 구현 전 최신 `origin/main`을 기준으로 작업 브랜치를 만든다.
452. DB migration 변경 전 backend migration 규칙을 다시 확인한다.
453. API contract 변경 후 web/mobile 타입 영향도를 확인한다.
454. web route 변경 후 `pnpm --filter @yeon/web lint`를 실행한다.
455. web route 변경 후 `pnpm --filter @yeon/web typecheck`를 실행한다.
456. backend 변경 후 backend test 또는 build를 실행한다.
457. contract 변경 후 관련 package typecheck를 실행한다.
458. docs 변경 후 `git diff --check`를 실행한다.
459. rules/skills 영향이 있으면 `bash bin/sync-skills.sh --check`를 실행한다.
460. project SSOT 영향이 있으면 `bash bin/verify-ssot.sh --project-only`를 실행한다.
461. Universal UI 공유 개념이 바뀌면 `pnpm verify:parity`를 실행한다.
462. Playwright로 세 host 홈을 확인한다.
463. Playwright로 대표 글 3개를 확인한다.
464. local dev server 중복 기동을 피한다.
465. 검증 실패 시 성공 전까지 완료 보고하지 않는다.
466. 커밋 전 `git status --short`로 owned file만 확인한다.
467. `git add .`를 쓰지 않고 변경 파일만 stage한다.
468. 커밋 메시지는 한국어로 작성한다.
469. PR target은 `main`으로 둔다.
470. `develop`은 사용하지 않는다.
471. PR body에 검증 명령과 결과를 적는다.
472. PR 생성 후 merge 가능 상태를 확인한다.
473. GitHub API 상태 폴링은 8분 간격 원칙을 지킨다.
474. merge 후 main 반영 여부를 한 번 확인한다.
475. 배포 완료 대기는 프로젝트 운영 규칙상 오래 polling하지 않는다.

## 20차: 출시 후 개선과 거버넌스

논의 필요: 콘텐츠 품질 리뷰 주기를 정할지.  
선택지: 주간, 격주, 월간.  
추천: 초기 1개월은 주간, 이후 월간으로 전환한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

476. 출시 첫 주에는 Search Console 색인 상태를 확인한다.
477. 출시 첫 주에는 sitemap 제출 오류를 확인한다.
478. 출시 첫 주에는 public 404를 확인한다.
479. 출시 첫 주에는 지원 문서 CTA 클릭을 확인한다.
480. 노출이 생긴 query를 support 제목 개선 후보로 기록한다.
481. 클릭률이 낮은 글은 title과 description을 개선한다.
482. 노출은 높고 클릭이 낮은 글은 SERP 문구를 점검한다.
483. 클릭은 있는데 전환이 낮은 글은 본문 CTA를 점검한다.
484. support 글은 실제 문의와 오류 로그를 반영해 갱신한다.
485. news 글은 과거 공지가 최신 정책과 충돌하지 않게 갱신한다.
486. blog 글은 기술 내용이 바뀌면 상단에 갱신 노트를 남긴다.
487. archived 글은 redirect 대상이 있는지 확인한다.
488. 오래된 support 글은 `최근 확인일`을 표시할지 검토한다.
489. 신규 기능이 생기면 support 글 후보를 먼저 만든다.
490. 신규 배포가 있으면 news update 후보를 먼저 만든다.
491. 의미 있는 기술 결정이 있으면 blog 후보를 먼저 만든다.
492. 콘텐츠 품질 기준을 checklist로 분리한다.
493. 제목 작성 원칙을 별도 운영 문서로 분리한다.
494. support 문서 템플릿을 만든다.
495. news 공지 템플릿을 만든다.
496. blog 글 템플릿을 만든다.
497. admin dashboard에 품질 checklist 상태를 붙인다.
498. 분기마다 정보 구조가 실제 서비스 구조와 맞는지 재검토한다.
499. 상담 워크스페이스 동결 정책이 바뀌면 별도 계획으로만 편입한다.
500. 500단계 계획은 완료 문서가 아니라 실행 순서의 원장으로 유지한다.

## 검증 계획

- 문서 변경: `git diff --check`
- rules/skills 동기화 영향 확인: `bash bin/sync-skills.sh --check`
- project SSOT 확인: `bash bin/verify-ssot.sh --project-only`
- 실제 구현 단계에서는 web lint/typecheck, backend build/test, Playwright host smoke를 별도로 수행한다.

## 남은 위험

- `mooddesk`는 현재 플랫폼 서비스 목록에는 있지만 공개 콘텐츠 정책 범위에 없다.
- Google Search Console 자동화는 credential과 verification token이 준비된 뒤 별도 실행해야 한다.
- 뉴스/블로그를 너무 많이 만들면 품질이 낮아질 수 있으므로 첫 발행은 적게 시작해야 한다.
- support 글은 실제 기능 상태와 다르면 신뢰를 잃으므로 repo 근거 확인 후 발행해야 한다.
