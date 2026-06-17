# 공개 콘텐츠 CI 품질 실패 수정

## 목표

- PR #769 이후 실패한 `Frontend Quality`와 그 여파로 실패한 Docker 배포 workflow를 복구한다.

## 원인

- `public-content-coverage-report.test.ts`가 article 수와 support 수를 과거 값으로 하드코딩했다.
- `public-content-blog-detail.test.ts`가 blog essay 글의 실제 기능 연결 단서를 검사했고, `why-ai-bot-safety-policy-first` 본문이 해당 단서를 포함하지 않았다.

## 진행

- coverage report 테스트의 article 수와 support 수 기대값을 registry에서 파생하도록 수정했다.
- `why-ai-bot-safety-policy-first` essay 본문에 support 정책 문서 연결 문장을 추가했다.
- 로컬 Node v26에서는 `localStorage` 내장 API가 `--localstorage-file` 없이는 비활성이라 전체 web test가 cloud-import 테스트에서 막힌다. 같은 전체 test를 `NODE_OPTIONS=--localstorage-file=/tmp/yeon-vitest-localstorage`로 실행해 통과를 확인했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-coverage-report.test.ts src/features/public-content/public-content-blog-detail.test.ts`
- `NODE_OPTIONS="--localstorage-file=/tmp/yeon-vitest-localstorage" pnpm --filter @yeon/web test`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web public-content:coverage-report`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
