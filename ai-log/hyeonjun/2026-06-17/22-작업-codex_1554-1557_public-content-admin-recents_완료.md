# 22차 작업 로그 - 공개 콘텐츠 관리자 최근 큐 보강

시작: 2026-06-17 15:54 KST  
종료: 2026-06-17 15:57 KST  
담당: Codex  
브랜치: `feat/public-content-admin-recents-20260617`

## 목표

- `/admin/content`에서 최근 발행 글, 최근 수정 글, SEO 경고 큐를 실제 Spring admin read API 데이터 기반으로 보여준다.
- `/admin/content/[channel]`에서는 채널별 SEO 경고 큐를 보여준다.
- 관리자 범위는 읽기 전용으로 유지한다.

## 결과

- `/admin/content` 대시보드에 최근 발행, 최근 수정, SEO 경고 큐를 추가했다.
- `/admin/content/[channel]`에 채널별 SEO 경고 큐를 추가했다.
- 큐 데이터는 Spring admin read API 응답을 화면 모델에서 정렬/필터링해 만든다.
- 생성, 수정, 삭제, 발행, archive 버튼은 추가하지 않았다.

## 검증

- 통과: `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts --reporter verbose`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
