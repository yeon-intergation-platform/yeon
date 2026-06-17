# 공개 콘텐츠 원고 디렉터리

이 디렉터리는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`에 넣을 Markdown 원고를 보관한다. 상담 워크스페이스 콘텐츠는 이 디렉터리에 작성하지 않는다.

## 파일명

파일명은 다음 형식을 따른다.

```text
channel-service-category-slug.md
```

예시:

```text
support-nexa-guides-add-nexa-discord-bot.md
```

## frontmatter

필수 필드:

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

## dry-run

운영 DB에 넣기 전에 먼저 검증한다. 기본 모드는 초안 검수용 `draft`이며 `draft`, `review` 상태 원고만 통과한다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run
```

발행 후보만 따로 검수할 때는 `published` 상태 원고를 `publish` 모드로 확인한다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run -- --mode=publish
```

검증은 파일명, 필수 frontmatter, channel/service/status 값, slug 형식, 중복 slug, 빈 heading, source path를 확인한다.

dry-run 출력은 생성 후보, 수정 후보, 건너뜀, 경고, 실패 수를 표시한다. 상세 운영 순서는 [`../import-workflow.md`](../import-workflow.md)를 본다.
