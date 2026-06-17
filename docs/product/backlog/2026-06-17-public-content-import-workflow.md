# 공개 콘텐츠 원고 import 워크플로우

작성일: 2026-06-17  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 16차  
범위: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 원고 파일 규칙과 dry-run 검증  
제외: 상담 워크스페이스 콘텐츠, 운영 DB 쓰기, admin 편집/삭제/발행 기능

## 1차: 원고 저장 위치와 frontmatter 규칙

논의 필요: 원고를 운영 DB에 바로 넣을지, 파일로 먼저 검수할지.  
선택지: 수동 DB 입력, Markdown/JSON import, SQL seed.  
추천: Markdown 원고를 `docs/public-content/articles/`에 보관하고, 운영 DB 반영 전 dry-run 검증을 먼저 강제한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 원고 저장 위치를 `docs/public-content/articles/`로 고정한다.
2. 파일명 규칙을 `channel-service-category-slug.md`로 정의한다.
3. frontmatter 필수 필드를 `title`, `description`, `channel`, `service`, `category`, `slug`, `status`, `source_repo`, `source_path`로 둔다.
4. `status`는 `draft`, `review`, `published`, `archived` 중 하나만 허용한다.
5. `channel`은 `support`, `news`, `blog`만 허용한다.
6. `service`는 공개 콘텐츠 서비스 key만 허용한다.
7. `slug`는 영문 소문자 kebab-case 경로 세그먼트만 허용한다.
8. Markdown body에 빈 heading이 있으면 실패 처리한다.
9. 외부 링크만 있고 자체 설명이 없는 본문은 경고 처리한다.
10. source path 누락은 경고 처리한다.

## 2차: dry-run import 검증

논의 필요: dry-run에서 운영 DB와 diff까지 계산할지.  
선택지: 파일 단독 검증, 정적 콘텐츠와 비교, 운영 DB diff.  
추천: 이번 차수는 파일 단독 검증과 중복 slug 차단까지만 만들고, DB diff는 admin/API 쓰기 차수에서 추가한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `apps/web/scripts/dry-run-public-content-import.ts`를 추가한다.
2. 기본 입력 디렉터리는 repo root 기준 `docs/public-content/articles`로 둔다.
3. CLI 인자로 입력 디렉터리를 바꿀 수 있게 한다.
4. frontmatter parser는 현재 필드 범위에 필요한 최소 규칙만 지원한다.
5. import 결과를 public content channel/service/status 규칙으로 검증한다.
6. channel 안에서 slug 중복을 차단한다.
7. dry-run 결과에 생성 후보, 경고, 실패 수를 한국어로 출력한다.
8. 실패가 있으면 non-zero exit로 품질 게이트에 걸리게 한다.
9. `package.json`에 `public-content:import:dry-run` 스크립트를 추가한다.
10. 운영 DB 쓰기, 발행, 수정, 삭제 동작은 만들지 않는다.

## 3차: 운영 문서 연결

논의 필요: 원고 템플릿을 채널별로 더 분리할지.  
선택지: 공통 import 문서만, 채널별 템플릿 링크, 자동 생성 템플릿.  
추천: 공통 import 문서를 만들고 기존 support/news/blog 템플릿과 연결한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `docs/seo/public-content-import-workflow.md`를 추가한다.
2. 원고 작성 순서, dry-run 명령, 실패/경고 기준을 문서화한다.
3. 기존 `docs/seo/README.md`에서 import 워크플로우 문서를 링크한다.
4. `docs/public-content/articles/README.md`에 작성자용 빠른 규칙을 둔다.
5. 샘플 원고 1개를 추가해 dry-run 검증이 실제 파일을 읽도록 한다.
