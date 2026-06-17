# 공개 콘텐츠 출시 후 거버넌스

## 적용 범위

이 문서는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 출시 후 운영 기준이다. `yeon.world`, `nexa.yeon.world`, `typing.yeon.world`, `card.yeon.world`, `community.yeon.world`, `discord-ai.yeon.world`와의 내부 링크와 sitemap 제출 상태도 함께 본다.

상담 워크스페이스는 유지보수 동결 대상이다. 정책이 바뀌면 이 문서에 바로 편입하지 않고 별도 백로그와 승인된 계획으로만 편입한다.

## 리뷰 주기

- 출시 첫 달: 주 1회 확인한다.
- 안정화 이후: 월 1회 확인한다.
- 정보 구조 점검: 분기 1회 확인한다.
- 신규 기능, 신규 배포, 의미 있는 기술 결정이 생기면 정기 주기와 별개로 후보 글을 먼저 만든다.

## 출시 첫 주 확인

- Search Console에서 `sc-domain:yeon.world` 색인 상태를 확인한다.
- Search Console에서 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` URL-prefix property 등록 상태를 확인한다.
- host별 sitemap 제출 오류를 확인한다.
- 페이지 색인 리포트에서 public 404 증가 여부를 확인한다.
- GA4에서 support 문서 CTA 클릭을 확인한다.
- GA4에서 news의 제품/support 링크 클릭과 blog의 related/source/support 링크 클릭을 확인한다.

## Search Console 개선 루프

- 노출이 생긴 query는 support 제목 개선 후보로 기록한다.
- 노출은 높고 클릭이 낮은 글은 title과 description을 먼저 개선한다.
- 노출은 높고 클릭률이 낮은 글은 SERP에 보이는 문구가 검색 의도와 맞는지 점검한다.
- 클릭은 있는데 제품 진입이나 다음 문서 이동이 낮은 support 글은 본문 CTA 문구와 위치를 점검한다.
- 같은 글의 제목, H1, description, slug가 서로 다른 검색 의도를 말하지 않게 맞춘다.

## 채널별 최신성 기준

### support

- 실제 문의, 오류 로그, Discord 설치 흐름 변경, 권한 변경을 반영한다.
- 오래된 support 글은 `최근 확인일`을 표시할지 검토한다.
- `최근 확인일`은 단순 문서 수정일이 아니라 실제 서비스 동작 확인일이어야 한다.

### news

- 과거 공지와 업데이트가 최신 정책, 가격, 권한, 도메인 구조와 충돌하지 않는지 확인한다.
- 충돌하는 공지는 본문 상단에 갱신 안내를 남기거나 더 최신 공지로 연결한다.
- 업계 뉴스 해설은 최신 외부 링크가 깨졌는지 확인한다.

### blog

- 기술 내용이 바뀌면 글 상단에 갱신 노트를 남긴다.
- repo 구조, API, 운영 정책이 바뀐 글은 source path도 함께 갱신한다.
- blog 글은 support 문서를 대체하지 않는다. 따라 하기나 오류 해결은 support로 연결한다.

## Archived 글과 redirect

- archived 글은 sitemap에 들어가지 않아야 한다.
- archived 글에는 가능한 redirect 대상이 있어야 한다.
- redirect 대상이 없으면 검색 유입 가치, 정책 충돌 가능성, 사용자 혼란 가능성을 보고 보관 유지 또는 새 글 작성 후보로 남긴다.

## 신규 후보 생성 규칙

- 신규 기능이 생기면 support 글 후보를 먼저 만든다.
- 신규 배포가 있으면 news update 후보를 먼저 만든다.
- 의미 있는 기술 결정이 있으면 blog 후보를 먼저 만든다.
- 후보 글은 발행 전 [공개 콘텐츠 품질 체크리스트](./public-content-quality-checklist.md), [공개 콘텐츠 제목 작성 원칙](./public-content-title-guidelines.md), 채널별 템플릿을 통과해야 한다.

## 운영 문서 SSOT

- 품질 기준: [공개 콘텐츠 품질 체크리스트](./public-content-quality-checklist.md)
- 제목 기준: [공개 콘텐츠 제목 작성 원칙](./public-content-title-guidelines.md)
- support 템플릿: [Support 문서 템플릿](./templates/support-article-template.md)
- news 템플릿: [News 문서 템플릿](./templates/news-article-template.md)
- blog 템플릿: [Blog 문서 템플릿](./templates/blog-article-template.md)
- Search Console 절차: [Google Search Console 운영 가이드](./google-search-console.md)

## Admin dashboard 확인

`/admin/content`에서는 다음 상태를 확인한다.

- `SEO warning queue`: noindex, meta description, canonical, sitemap, title 품질 경고 수
- `Title quality`: 검색 의도와 서비스 단서가 부족한 제목 수
- `Weekly Search Console`: 출시 첫 달 주간 확인 상태
- `Monthly indexing review`: 안정화 이후 월간 확인 상태
- `Post-launch quality review`: 출시 후 품질 리뷰 주기와 관련 운영 문서 연결 상태

## 리포트 명령

```bash
pnpm --filter @yeon/web public-content:governance-report
pnpm --filter @yeon/web public-content:audit
pnpm --filter @yeon/web public-content:coverage-report
```

리포트는 repo에서 계산 가능한 sitemap/title/source/SEO 상태를 evidence로 출력한다. Search Console과 GA4처럼 credential이 필요한 항목은 수동 확인으로 남긴다.

## 원장 정책

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`는 완료 문서가 아니라 실행 순서의 원장이다. 이후 공개 콘텐츠 확장은 이 원장에 새 작업을 덧붙이기보다 주제별 백로그를 새로 만든다.
