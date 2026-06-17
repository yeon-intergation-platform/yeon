# 공개 콘텐츠 제목 거버넌스

작성일: 2026-06-17  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 20차 492~497  
범위: 공개 콘텐츠 제목 작성 원칙, 품질 audit, admin 품질 queue  
제외: 본문 수정 UI, 발행 UI, Search Console 자동화

## 1차: 제목 작성 원칙 문서화

논의 필요: 제목 원칙을 품질 체크리스트 안에만 둘지 별도 운영 문서로 분리할지.  
선택지: 체크리스트 내부 유지, 별도 문서 분리, 템플릿별 중복 작성.  
추천: 별도 문서로 분리하고 품질 체크리스트와 README에서 링크한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. support/news/blog 제목 작성 원칙을 별도 문서로 분리한다.
2. 좋은 제목과 피할 제목을 채널별로 제시한다.
3. 상담 워크스페이스는 제목 후보에도 넣지 않는다고 명시한다.
4. `docs/seo/README.md`와 품질 체크리스트에서 새 문서를 연결한다.

## 2차: 제목 품질 audit

논의 필요: 제목 품질을 사람이 수동으로만 볼지 자동 검사에 넣을지.  
선택지: 수동만, audit script 포함, admin 포함.  
추천: audit script와 admin SEO warning queue에 같은 규칙을 넣는다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 제목 품질 검사 helper를 만든다.
2. `support` 제목은 서비스명 또는 서비스 단서와 문제/행동 표현을 요구한다.
3. `news` 제목은 대상 서비스나 공개 채널, 공지/업데이트 성격을 요구한다.
4. `blog` 제목은 결정 이유, 문제, 구조, 운영 판단 같은 맥락 단어를 요구한다.
5. generic 제목은 audit 실패로 처리한다.
6. static registry와 Spring admin DTO 모두 같은 규칙으로 검사한다.

## 3차: admin 운영 표시

논의 필요: 제목 경고를 별도 화면으로 둘지 기존 SEO warning에 합칠지.  
선택지: 별도 화면, 기존 SEO warning queue, admin checklist만.  
추천: 초기에는 기존 SEO warning queue와 운영 checklist에 합친다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. dashboard stats에 제목 경고 수를 추가한다.
2. 운영 checklist에 `Title quality` 항목을 추가한다.
3. 제목 경고가 있으면 SEO warning queue에서 해당 글을 바로 보이게 한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-title-quality.test.ts src/features/public-content/public-content-admin-model.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
