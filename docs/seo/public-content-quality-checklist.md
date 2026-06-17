# 공개 콘텐츠 품질 체크리스트

## 적용 범위

이 체크리스트는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`에 발행하는 공개 콘텐츠에 적용한다.

대상 서비스는 NEXA/discord-assistant, 타자 서비스, 카드 서비스, 커뮤니티, 공통 계정/정책이다. 상담관리/상담 워크스페이스는 유지보수 동결 대상이므로 이 체크리스트의 작성 대상에서 제외한다.

## 공통 발행 기준

- 글 하나는 하나의 검색 의도나 운영 사실만 다룬다.
- 제목, description, canonical, Open Graph, structured data가 비어 있지 않다.
- 제목은 `public-content:audit`의 제목 품질 규칙을 통과한다.
- slug는 영문 소문자 kebab-case로 쓴다.
- 본문 첫 화면에서 이 글이 어떤 문제를 해결하는지 바로 알 수 있다.
- 본문은 실제 서비스 동작, repo 문서, 코드 경로, 운영 정책 중 하나 이상을 근거로 한다.
- source path가 없는 글은 발행하지 않고 draft로 둔다.
- 빈 heading, 빈 checklist, 제목만 있는 섹션을 만들지 않는다.
- 외부 문서나 기사 원문을 길게 복사하지 않는다.
- 공개 글은 로그인으로 redirect되지 않는다.
- draft, review, archived, noindex 글은 sitemap에 들어가지 않는다.
- 관련 support/news/blog 글이 있으면 크롤링 가능한 일반 링크로 연결한다.
- 상담 워크스페이스 내용은 사용자가 명시적으로 정책을 바꾸기 전까지 넣지 않는다.

## 제목 작성 원칙

상세 기준은 [공개 콘텐츠 제목 작성 원칙](./public-content-title-guidelines.md)을 따른다. 좋은 제목은 사용자가 Google에 입력할 문장과 가깝고, 서비스명과 문제를 함께 드러낸다.

좋은 제목:

- 디스코드 서버에 NEXA AI 봇 추가하는 방법
- NEXA 봇이 응답하지 않을 때 확인할 5가지
- card.yeon.world에서 플래시카드 덱을 만드는 방법
- typing.yeon.world 타자방에 접속되지 않을 때 해결 방법

피할 제목:

- NEXA 가이드
- 오류 해결
- 권한 안내
- 업데이트 소식

## `support.yeon.world` 기준

- 제목은 `서비스 + 행동/문제 + 해결 방식`으로 쓴다.
- 본문은 단계형으로 쓴다.
- 사용자가 따라 할 순서, 실패했을 때 확인할 항목, 다음 링크를 모두 제공한다.
- FAQ는 accordion에 의존하지 않고 heading과 본문 HTML로 색인 가능하게 작성한다.
- 글 하단 CTA는 해당 제품 진입 또는 관련 support 글로 연결한다.
- news 공지나 blog 회고처럼 쓰지 않는다.

발행 전 확인:

- [ ] 사용자가 실제 화면에서 따라 할 수 있는 단계가 있다.
- [ ] 권한, 로그인, 게스트/계정 차이 같은 실패 경계가 설명되어 있다.
- [ ] 관련 문제 해결 글 또는 FAQ 링크가 있다.
- [ ] 제품 진입 CTA가 본문을 방해하지 않는 위치에 있다.

## `news.yeon.world` 기준

- 공지와 업데이트는 사실 중심으로 쓴다.
- `무엇이 바뀌었는지`, `사용자 영향`, `필요한 조치`를 분리한다.
- 업계 뉴스 해설은 Yeon/NEXA 사용자에게 주는 의미가 있을 때만 작성한다.
- support 문서와 같은 내용을 반복하지 않고 관련 support 링크로 연결한다.
- 과장된 마케팅 문장보다 적용일, 대상 서비스, 영향 범위를 우선한다.

발행 전 확인:

- [ ] 공지/업데이트/업계 해설 중 하나로 분류된다.
- [ ] 적용 서비스와 적용일 또는 발행일이 명확하다.
- [ ] 사용자에게 필요한 조치가 있으면 별도 문단으로 보인다.
- [ ] 관련 support 문서 링크가 있다.

## `blog.yeon.world` 기준

- 기술 글은 구현 근거와 tradeoff를 남긴다.
- 제품 글은 어떤 사용자 문제를 풀려는지 설명한다.
- devlog는 진행 상황, 막힌 점, 다음 결정을 기록한다.
- essay는 짧아도 실제 서비스나 운영 판단과 연결한다.
- blog 글은 news 공지나 support 문서를 대체하지 않는다.
- repo 근거가 있는 글은 경로를 본문 또는 source path에 남긴다.

발행 전 확인:

- [ ] 글이 `engineering`, `product`, `devlog`, `essay` 중 하나로 분류된다.
- [ ] 실제 기능, 코드, 운영 정책 중 하나와 연결된다.
- [ ] 관련 support 또는 news 링크가 있다.
- [ ] 회고 글은 결정 이유와 실패/제약을 숨기지 않는다.

## 품질 리뷰 주기

- 출시 첫 달은 주 1회 Search Console 노출/클릭과 support CTA 클릭을 확인한다.
- 이후에는 월 1회 색인 제외, 404, canonical mismatch, sitemap 실패를 확인한다.
- 노출은 높고 클릭이 낮은 글은 title과 description을 먼저 개선한다.
- 클릭은 있는데 전환이 낮은 support 글은 CTA 문구와 위치를 점검한다.
- `/admin/content`의 `Title quality`와 `SEO warning queue`가 0인지 확인한다.

운영 리포트:

```bash
pnpm --filter @yeon/web public-content:governance-report
```

이 리포트는 repo에서 확인 가능한 sitemap/title/source/SEO 상태를 자동 evidence로 출력하고, Search Console/GA4처럼 credential이 필요한 항목은 `수동 확인`으로 남긴다.
