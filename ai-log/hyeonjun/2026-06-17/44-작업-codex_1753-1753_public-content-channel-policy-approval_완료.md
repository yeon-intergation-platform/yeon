# 공개 콘텐츠 채널 정책 승인 보강

## 목표

- 사용자가 확정한 `news.yeon.world`, `blog.yeon.world`, `support.yeon.world` 분리 구조를 운영 기준으로 더 선명하게 남긴다.

## 변경

- `docs/seo/public-content-channel-policy.md`에 최종 운영 기준표를 추가했다.
- 새 글 발행 시 canonical 채널을 고르는 기준을 명시했다.
- `news.yeon.world/blog`처럼 채널 의미를 섞는 경로를 만들지 않는 금지 기준을 추가했다.

## 검증

- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
