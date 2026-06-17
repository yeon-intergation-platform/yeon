# 공개 콘텐츠 원고 import 워크플로우

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`  
제외: 상담 워크스페이스 콘텐츠, 운영 DB 직접 쓰기, admin 편집/삭제/발행 기능

## 목적

공개 콘텐츠는 바로 운영 DB에 넣지 않고 Markdown 원고로 먼저 남긴다. 원고는 dry-run으로 필수 metadata, slug, source path, 본문 품질을 확인한 뒤 이후 admin/API 발행 차수에서 운영 DB에 반영한다.

## 저장 위치

원고는 repo root 기준 아래 디렉터리에 둔다.

```text
docs/public-content/articles/
```

파일명은 다음 형식을 따른다.

```text
channel-service-category-slug.md
```

예시:

```text
support-nexa-guides-add-nexa-discord-bot.md
news-nexa-notice-support-docs-open.md
blog-nexa-product-why-discord-admin-first.md
```

## 필수 frontmatter

```yaml
---
title: "디스코드 서버에 NEXA AI 봇 추가하는 방법"
description: "디스코드 서버 관리자가 NEXA AI 봇을 추가하기 전에 확인할 권한, 설치 페이지, 테스트 순서입니다."
channel: support
service: nexa
category: guides
slug: nexa/guides/add-nexa-discord-bot
status: draft
source_repo: discord-assitant
source_path:
  - /Users/osuma/coding_stuffs/discord-assitant/README.md
---
```

허용 값:

- `channel`: `support`, `news`, `blog`
- `service`: `nexa`, `typing`, `card`, `community`, `account`
- `status`: `draft`, `review`, `published`, `archived`
- `slug`: `/`로 구분된 영문 소문자 kebab-case 경로

## dry-run 명령

기본 디렉터리 검증:

```bash
pnpm --filter @yeon/web public-content:import:dry-run
```

다른 디렉터리 검증:

```bash
pnpm --filter @yeon/web public-content:import:dry-run -- docs/public-content/articles
```

dry-run은 운영 DB에 쓰지 않는다. 현재 단계의 결과는 “생성 후보”와 경고/실패 개수만 출력한다.

기본 모드는 `draft`다. `draft` 모드는 `draft`, `review` 상태 원고만 통과시킨다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run -- --mode=draft
```

발행 후보만 따로 검수할 때는 `publish` 모드를 사용한다. `publish` 모드는 `published` 상태 원고만 통과시킨다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run -- --mode=publish
```

상태를 가리지 않고 전체 원고 규칙만 확인해야 할 때는 `all` 모드를 사용한다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run -- --mode=all
```

## 실패 기준

- frontmatter 시작/종료 구분자 `---`가 없다.
- 필수 frontmatter 필드가 없다.
- `channel`, `service`, `status` 값이 허용 목록 밖이다.
- `category` 값이 공개 콘텐츠 분류 목록 밖이다.
- 현재 `--mode`에서 허용되지 않는 `status` 원고다.
- 파일명이 `channel-service-category-slug.md` 규칙과 맞지 않는다.
- `slug` segment가 영문 소문자 kebab-case가 아니다.
- 같은 channel 안에서 slug가 중복된다.
- 본문이 비어 있다.
- 빈 heading이 있다.

## 경고 기준

- `source_path` 항목이 비어 있다.
- 본문이 외부 링크 중심이고 자체 설명이 부족하다.

경고는 non-zero exit로 막지 않는다. 다만 발행 전 품질 체크리스트에서 보강해야 한다.

## 발행 전 순서

1. 채널별 템플릿으로 원고를 작성한다.
2. `source_repo`와 `source_path`에 근거 파일을 넣는다.
3. dry-run을 실행한다.
4. 실패는 모두 수정한다.
5. 경고는 발행자가 의도 여부를 확인한다.
6. 이후 admin/API 발행 차수에서 운영 DB 반영 절차를 붙인다.
