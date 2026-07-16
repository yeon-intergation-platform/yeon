# 공개 콘텐츠 Markdown CMS 작업 로그

- 시작: 2026-07-16 22:03 KST
- 종료: 2026-07-17 00:19 KST
- 브랜치: `feat/public-content-admin-markdown-cms-20260716`
- 기준: `origin/main`
- PR: [#921](https://github.com/yeon-intergation-platform/yeon/pull/921)
- 목표: 관리자 작성·검수·발행·보관, Markdown 편집/미리보기, 단건·일괄 export, 공개 발행본 SSOT 전환

## 초기 확인

- `yeon-4`를 최신 `origin/main`에서 새 브랜치로 분리했다.
- `yeon` 기준 `.env*` 6개를 값 노출 없이 동기화하고 동일성을 확인했다.
- 기존 공통 공개 헤더와 Support/News/Blog 정보 위계는 유지한다.
- Spring이 DB·권한·상태 전이를 소유하고 Next API route는 인증 쿠키/헤더 BFF만 맡는다.
- 웹 관리자 UI 추가이며 Universal UI 공유 화면은 아니다. 공유 API 계약은 mobile typecheck로 drift를 확인한다.

## 진행 기록

- [x] 관련 저장 구조, 계약, 관리자 read API, 정적 공개 콘텐츠 흐름 조사
- [x] 제품 백로그와 Ralph PRD 작성
- [x] Spring CMS 저장·발행·export 구현
- [x] 관리자 편집 UI와 Next BFF 구현
- [x] 공개 발행본 조회 전환
- [x] 테스트·빌드·Playwright·리뷰·재검증
- [x] commit·push·PR(main) 생성
- [x] PR 검증 증거·마이그레이션·rollback·release intent 기록

## 구현 결과

- 작업 원고와 불변 발행 revision을 분리하고 `published_revision_id`만 공개 조회에 사용했다.
- 발행 글 수정은 draft를 만들되 기존 공개 revision을 유지하고, 재발행 시에만 공개본을 교체한다.
- raw HTML과 H1을 서버에서 차단하고 canonical URL, 읽기 시간, 발행·수정 시각은 서버에서 계산한다.
- 단건 Markdown과 채널·전체 ZIP export를 추가했다. 파일명 충돌을 막고 YAML frontmatter를 기존 dry-run importer가 다시 읽도록 검증했다.
- Spring 연결 실패 시에는 배포 시점의 내장 초기 snapshot을 읽기 전용으로 사용하며, 명시적 404는 fallback하지 않는다.
- 공개 목록·상세·검색·관련 글·목차·SEO·RSS·sitemap이 같은 runtime snapshot을 사용한다.
- 관리자 화면은 데스크톱 편집·미리보기 2열과 375px 모바일 탭 전환을 제공한다.

## 리뷰 반영

- V21의 `portable_text` 본문을 V22에서 손실 없이 Markdown 들여쓰기 코드 블록으로 변환한 뒤 revision을 backfill한다.
- ATX·Setext·인용·목록 H1을 포함하는 Markdown 제목 검증과 fence 예외를 추가했다.
- export 파일명 충돌, 빈 YAML 배열, importer 왕복 호환을 보강했다.
- 공개 read fallback을 중앙화하고 snapshot BFF와 5초 timeout을 추가했다.
- 관리자가 입력한 SEO 제목·설명·OG 이미지가 실제 메타데이터에 반영되게 했다.
- 발행 후 보관·복구된 글도 채널과 slug 정체성을 바꿀 수 없도록 상태 불변식을 보강했다.
- 2차 critic에서 확인한 중첩 목록 H1 우회는 backend CommonMark AST 검증으로 교체했다.
- 수제 frontmatter parser를 표준 YAML parser로 교체하고 quote, backslash, newline 값 동등성 테스트를 추가했다.
- snapshot의 `channel`, `serviceKey`, `category` 필터를 contract부터 Spring과 fallback까지 동일하게 연결했다.
- 보관 글의 `redirectTo`를 archived row 전용 공개 계약, Next BFF, 공개 페이지 영구 redirect까지 연결했다. 명시적 404와 Spring 장애는 서로 다른 경계로 유지한다.
- Setext H2도 renderer와 같은 시작 줄 ID로 목차에 포함한다.

## 검증 증거

- `./gradlew build --no-daemon`: 성공, Flyway V21→V22 실제 마이그레이션 테스트 포함
- `NODE_OPTIONS='--localstorage-file=/tmp/yeon-vitest-localstorage.json' pnpm --filter @yeon/web test`: 최신 `origin/main` 통합 후 258개 파일, 1,123개 테스트 성공
- 기본 Node 26 실행에서는 동결 영역 `cloud-import` 테스트 3개가 비활성 `localStorage` 때문에 실패하고 나머지 1,126개가 성공했다. Node 안내 옵션을 적용한 동일 전체 스위트는 전부 성공했다.
- `pnpm --filter @yeon/api-contract test`: 74개 테스트 성공
- api-contract, api-client, web, mobile typecheck와 web lint: 성공
- `pnpm --filter @yeon/web build`: 성공, 192개 공개·앱 route 생성
- `pnpm verify:parity`: 14개 개념 검증 성공
- `pnpm --filter @yeon/web public-content:audit`: 최신 `origin/main` 에디토리얼 정리가 반영된 공개 글 43개 검사 성공
- export Markdown을 `public-content:import:dry-run --mode=all`로 재입력: 2개 원고, 실패 0개
- `bash bin/sync-skills.sh --check`, `bash bin/verify-ssot.sh --project-only`, `git diff --check`: 성공
- Playwright E2E: 생성 → 검수 요청 → 발행 → draft 수정 중 기존 공개본 유지 → 재발행 → Markdown/ZIP export → 보관 성공
- 새 공개 글 브라우저 console error 0개, hydration heading ID 불일치 수정 후 재검증 성공
- 3차 critic: 직전 4개 major와 Setext H2를 실제 코드·테스트로 재검증했고 `ACCEPT`, critical/major 0개
- `origin/main` #920 통합: 최신 화면 구조·블로그 인플레이스 필터·삭제된 상세 패널을 유지하고 CMS runtime만 결합했다. Spring bootstrap은 최신 43개 원문으로 재생성했다.

## Ship

- PR #921을 `main`으로 생성했다.
- 이 로그를 PR에 추가한 뒤 `gh pr merge --squash --delete-branch`로 머지 명령을 실행한다.
- 머지 후 CI/CD·릴리즈는 저장소 정책대로 비동기 흐름에 맡기고 상태를 반복 폴링하지 않는다.

## 시각 증거

- `public-content-admin-markdown-cms-screenshots/admin-content-dashboard-desktop.png`
- `public-content-admin-markdown-cms-screenshots/admin-content-editor-desktop.png`
- `public-content-admin-markdown-cms-screenshots/admin-content-editor-mobile-375.png`
