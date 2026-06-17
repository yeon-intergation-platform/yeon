# 공개 콘텐츠 채널 정책

## 목적

Yeon 생태계의 공개 콘텐츠는 검색 유입, 사용자 지원, 브랜드 신뢰를 함께 만든다. 공개 URL과 관리자 URL을 분리하고, 서비스별로 문서를 나누어 Google이 크롤링하기 쉬운 구조를 유지한다.

이 문서는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`, `yeon.world/admin`의 역할과 콘텐츠 분류 기준의 source of truth다.

2026-06-17 최종 결정: `news.yeon.world/blog`를 만들지 않고 `blog.yeon.world`를 독립 채널로 둔다. `news.yeon.world`는 공식 소식과 업계 해설, `blog.yeon.world`는 개발기와 기술 글, `support.yeon.world`는 사용법과 문제 해결을 담당한다.

2026-06-17 추가 확정: `news.yeon.world`의 최상위 분류는 `notice`, `updates`, `news`로 제한하고, 홈 위계도 이 순서로 둔다. `blog.yeon.world`는 `engineering`, `product`, `devlog`, `essay`를 최상위 분류로 둔다. 블로그를 뉴스 하위 경로로 넣지 않는다.

실제 원고 발행 전 품질 기준은 [공개 콘텐츠 품질 체크리스트](./public-content-quality-checklist.md)를 따른다. 채널별 원고는 [support 템플릿](./templates/support-article-template.md), [news 템플릿](./templates/news-article-template.md), [blog 템플릿](./templates/blog-article-template.md)을 기준으로 작성한다.

## 최종 운영 기준

`support`, `news`, `blog`는 서로를 대체하지 않는다. 새 공개 콘텐츠를 만들 때는 먼저 아래 기준으로 채널을 결정하고, 애매한 글은 하나의 주 채널에만 canonical로 발행한 뒤 다른 채널에서는 내부 링크로 연결한다.

| 발행 의도                                     | canonical 채널       | 대표 경로                                                                           |
| --------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| 사용법, 튜토리얼, FAQ, 문제 해결, 정책 안내   | `support.yeon.world` | `/nexa/guides/*`, `/typing/troubleshooting/*`, `/card/faq/*`, `/community/policy/*` |
| 공식 공지, 제품 업데이트, 업계 뉴스 해설      | `news.yeon.world`    | `/notice/{service}/*`, `/updates/{service}/*`, `/news/{topic}/*`                    |
| 개발기, 기술 글, 제품 제작기, 회고, 제품 철학 | `blog.yeon.world`    | `/engineering/{topic}/*`, `/product/{service}/*`, `/devlog/*`, `/essay/*`           |

운영 금지 사항:

- `news.yeon.world/blog` 또는 `blog.yeon.world/news`처럼 채널 의미를 섞는 경로를 만들지 않는다.
- 같은 본문을 support, news, blog에 중복 발행하지 않는다.
- 빈 카테고리만 먼저 만들지 않는다. 실제로 발행할 글이 있을 때만 노출한다.
- 새 채널이나 새 최상위 분류가 필요하면 이 문서, sitemap 정책, Search Console 제출 대상 문서를 먼저 갱신한다.

## 적용 범위

공개 콘텐츠 정책은 아래 서비스에 적용한다.

- NEXA / discord-assistant
- 타자 서비스
- 카드 서비스
- 커뮤니티
- 공통 계정, 결제, 개인정보, 정책

상담관리/상담 워크스페이스는 유지보수 동결 대상이므로 이 공개 콘텐츠 정책의 운영 범위에서 제외한다. 사용자가 명시적으로 재개를 지시하기 전까지 신규 가이드, FAQ, 뉴스, 문제 해결 문서의 대상으로 삼지 않는다.

## 도메인 역할

### `support.yeon.world`

사용자가 문제를 해결하는 검색형 도움말 채널이다. SEO와 전환 관점의 1순위 채널로 본다.

기본 구조:

```txt
support.yeon.world
├─ /nexa
│  ├─ /getting-started
│  ├─ /guides
│  ├─ /tutorials
│  ├─ /troubleshooting
│  ├─ /faq
│  └─ /policy (필요한 경우)
├─ /typing
│  ├─ /getting-started
│  ├─ /guides
│  ├─ /tutorials
│  ├─ /troubleshooting
│  ├─ /faq
│  └─ /policy (필요한 경우)
├─ /card
│  ├─ /getting-started
│  ├─ /guides
│  ├─ /tutorials
│  ├─ /troubleshooting
│  ├─ /faq
│  └─ /policy (필요한 경우)
├─ /community
│  ├─ /getting-started
│  ├─ /guides
│  ├─ /tutorials
│  ├─ /troubleshooting
│  ├─ /faq
│  └─ /policy (필요한 경우)
└─ /account
   ├─ /login
   ├─ /privacy
   └─ /billing
```

작성 원칙:

- 글은 서비스별 문제 단위로 분리한다.
- 제목은 사용자가 검색할 문장과 가깝게 쓴다.
- 빈 카테고리와 빈 문서는 만들지 않는다.
- `policy` 하위 분류는 실제 정책 문서가 있는 서비스에만 노출한다.
- 공개 도움말 페이지는 로그인으로 리다이렉트하지 않는다.
- 각 글은 하나의 질문이나 문제를 끝까지 해결해야 한다.

좋은 제목 예시:

- 디스코드 서버에 NEXA AI 봇 추가하는 방법
- NEXA 봇이 응답하지 않을 때 확인할 5가지
- 특정 채널에서만 NEXA 봇이 답변하게 설정하는 법
- 카드 덱을 만들고 학습을 시작하는 방법
- 타자방 접속이 안 될 때 확인할 설정

### `news.yeon.world`

공식 소식, 서비스 업데이트, 공지, 업계 뉴스 해설을 다루는 채널이다. 검색 유입보다 공식성, 신뢰, 생태계 확장 목적이 크다.

기본 구조:

```txt
news.yeon.world
├─ /notice
│  ├─ /nexa
│  ├─ /typing
│  ├─ /card
│  └─ /community
├─ /updates
│  ├─ /nexa
│  ├─ /typing
│  ├─ /card
│  └─ /community
└─ /news
   ├─ /ai
   ├─ /discord
   ├─ /developer
   └─ /product
```

작성 원칙:

- 공지와 업데이트는 서비스별로 분류한다.
- 홈과 목록의 기본 위계는 `notice` → `updates` → `news` 순서로 둔다.
- 공지에는 적용 서비스와 적용일을 표시한다.
- 업데이트에는 변경 요약과 사용자 영향도를 표시한다.
- 업계 뉴스 해설에는 YEON 서비스와의 관련성을 표시한다.
- 업계 뉴스는 단순 복붙이 아니라 Yeon/NEXA 사용자에게 왜 중요한지 해설한다.
- 과도한 언론 사이트나 보도자료처럼 보이게 만들지 않는다. 실제 공지가 아닌 글에는 사실 중심 제목과 해설 중심 본문을 사용한다.
- 단순 대량 생성형 글이나 얇은 글은 발행하지 않는다.
- support 문서와 같은 내용을 반복 발행하지 않는다. 필요하면 news 글에서 support 글로 링크한다.

### `blog.yeon.world`

개발기, 기술 글, 제품 제작기, 회고, 제품 철학을 다루는 채널이다. `news.yeon.world/blog`처럼 news 안에 넣지 않고 별도 subdomain으로 분리한다.

기본 구조:

```txt
blog.yeon.world
├─ /engineering
│  ├─ /backend
│  ├─ /frontend
│  ├─ /infra
│  └─ /ai
├─ /product
│  ├─ /nexa
│  ├─ /typing
│  ├─ /card
│  └─ /community
├─ /devlog
└─ /essay
```

작성 원칙:

- "어떻게 만들었는지", "왜 이렇게 설계했는지", "실패에서 무엇을 배웠는지"를 다룬다.
- 제품 홍보만 반복하지 않고 실제 기술적, 제품적 맥락을 남긴다.
- support의 문제 해결 문서나 news의 공식 공지를 대체하지 않는다.
- 글 안에서 관련 support 문서, news 공지, 제품 랜딩으로 내부 링크를 연결한다.

## 관리자 정책

콘텐츠 관리는 `https://yeon.world/admin`에서 통합한다. 단, 초기 단계의 admin은 본문 편집 CMS가 아니라 콘텐츠 운영 대시보드다.

공개 페이지는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`에서 제공하고, 관리자 페이지는 로그인된 운영자만 접근할 수 있어야 한다.

1차 `yeon.world/admin`이 담당하는 것:

- 전체 콘텐츠 목록과 서비스별 필터
- 서비스, 채널, 타입, slug, 제목, description, canonical 상태 확인
- `draft`, `published`, `archived` 상태 확인
- SEO 누락 경고
- sitemap 포함 여부 확인
- Search Console 제출과 상태 확인
- 깨진 링크, 로그인 리다이렉트, 비공개 문서 노출 여부 점검

초기 단계에서 `yeon.world/admin`이 직접 담당하지 않는 것:

- 새 글 만들기
- 본문 전체 편집기
- 글 상세 수정 UI
- `draft`, `published`, `archived` 상태 변경 UI
- 예약 발행 UI
- 일반 운영자용 완전 삭제 UI
- 복잡한 CMS workflow

1차 admin은 읽기 전용이다. 새 글 만들기, 본문 수정, 삭제, 상태 변경, 예약 발행은 아직 만들지 않는다. 관리자는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 공개 페이지와 `/admin/content` 현황판에서 노출 상태를 확인하고, 실제 본문 변경은 정적 registry 또는 이후 공개 페이지 관리자 모드/별도 CMS 설계로 처리한다.

삭제는 기본 동작으로 두지 않는다. SEO와 링크 안정성을 위해 아래 상태 전이를 우선한다.

- 잘못 올린 글: `draft`로 되돌린다.
- 더 이상 쓰지 않는 글: `archived`로 바꾼다.
- URL을 바꿔야 하는 글: 새 URL을 만들고 기존 URL은 301 redirect한다.
- 완전 삭제: 초기에는 숨기거나 super admin 전용으로 제한한다.

관리 필드의 기본 단위:

```txt
service: nexa | typing | card | community | account | yeon
channel: support | news | blog
contentType: getting-started | guide | tutorial | troubleshooting | faq | notice | news | update | engineering | product | devlog | essay | policy
slug
title
description
canonicalUrl
status: draft | published | archived
publishedAt
updatedAt
```

## SEO 기준

- `support.yeon.world/sitemap.xml`, `news.yeon.world/sitemap.xml`, `blog.yeon.world/sitemap.xml`은 분리한다.
- sitemap에는 canonical 공개 URL만 넣는다.
- 공개 글은 서버 렌더링 또는 정적 렌더링으로 본문 HTML을 크롤러가 바로 읽을 수 있어야 한다.
- 모든 공개 글에는 고유한 title, meta description, canonical, Open Graph 정보를 둔다.
- 중복 주제는 하나의 canonical 문서로 모으고, 보조 글에서는 내부 링크로 연결한다.
- `draft`, `archived`, admin, preview URL은 sitemap과 검색 색인에서 제외한다.
- 검색 순위 조작 목적의 대량 저품질 콘텐츠를 만들지 않는다.
- 공개 URL은 로그인으로 리다이렉트하지 않는다. 로그인은 admin, preview, 편집 API 같은 비공개 영역에만 적용한다.

## 초기 우선순위

1. `support.yeon.world/nexa`의 설치, 권한, 응답 오류, 무료/유료 제한 FAQ
2. `support.yeon.world/card`의 덱 생성, 카드 편집, 학습 시작 FAQ
3. `support.yeon.world/typing`의 방 접속, 레이스 시작, 연결 문제 해결
4. `support.yeon.world/community`의 게시/댓글/익명 사용 가이드
5. `news.yeon.world/notice`의 서비스별 업데이트와 운영 공지
6. `blog.yeon.world/engineering`과 `blog.yeon.world/devlog`의 제작기, 기술 선택 이유, 회고

초기에는 많은 메뉴보다 실제 도움이 되는 문서 10개를 우선한다.
