# 공개 콘텐츠 채널 정책

## 목적

Yeon 생태계의 공개 콘텐츠는 검색 유입, 사용자 지원, 브랜드 신뢰를 함께 만든다. 공개 URL과 관리자 URL을 분리하고, 서비스별로 문서를 나누어 Google이 크롤링하기 쉬운 구조를 유지한다.

이 문서는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`, `yeon.world/admin`의 역할과 콘텐츠 분류 기준의 source of truth다.

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
│  ├─ /troubleshooting
│  └─ /faq
├─ /typing
│  ├─ /guides
│  ├─ /troubleshooting
│  └─ /faq
├─ /card
│  ├─ /guides
│  ├─ /troubleshooting
│  └─ /faq
├─ /community
│  ├─ /guides
│  ├─ /troubleshooting
│  └─ /faq
└─ /account
   ├─ /login
   ├─ /privacy
   └─ /billing
```

작성 원칙:

- 글은 서비스별 문제 단위로 분리한다.
- 제목은 사용자가 검색할 문장과 가깝게 쓴다.
- 빈 카테고리와 빈 문서는 만들지 않는다.
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
- 업계 뉴스는 단순 복붙이 아니라 Yeon/NEXA 사용자에게 왜 중요한지 해설한다.
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

`yeon.world/admin`이 담당하는 것:

- 전체 콘텐츠 목록과 서비스별 필터
- 새 글 만들기 진입
- 서비스, 채널, 타입, slug, 제목, description, canonical 상태 관리
- `draft`, `published`, `archived` 상태 확인과 변경
- SEO 누락 경고
- sitemap 포함 여부 확인
- Search Console 제출과 상태 확인
- 깨진 링크, 로그인 리다이렉트, 비공개 문서 노출 여부 점검

초기 단계에서 `yeon.world/admin`이 직접 담당하지 않는 것:

- 본문 전체 편집기
- 글 상세 수정 UI
- 일반 운영자용 완전 삭제 UI
- 복잡한 CMS workflow

본문 수정은 공개 페이지의 관리자 모드에서 수행한다. 예를 들어 관리자가 `support.yeon.world/nexa/guides/add-nexa-discord-bot`에 접속하면 해당 페이지 상단에 편집 버튼을 표시하고, 그 자리에서 본문과 메타 정보를 수정한다.

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
