# 공개 콘텐츠 관리자 Markdown CMS 1차

작성일: 2026-07-16
대상: Support, News, Blog 공개 콘텐츠와 `/admin/content`
범위: Spring 저장·리비전·발행 API, 공유 계약, Next BFF, 관리자 편집 UI, Markdown export, 공개 발행본 조회
제외: 상담 워크스페이스, 외부 CMS, 다국어, 예약 발행, 실시간 공동 편집

## 1차: Spring CMS 저장 모델과 상태 전이

### 작업내용

1. Spring DB를 공개 콘텐츠의 단일 진실 원천으로 정한다.
2. 현재 글 row는 작업 중인 원고를 보관하고, 별도 revision table에는 발행 스냅샷을 불변으로 기록한다.
3. 공개 조회는 현재 작업 원고가 아니라 `published_revision_id`가 가리키는 발행본만 읽는다.
4. `draft → review → published → archived` 상태 전이를 서버에서 검증한다.
5. 수정 저장은 `version` 기반 낙관적 잠금으로 오래 열린 편집기의 덮어쓰기를 409로 차단한다.
6. canonical URL, 수정 시각, 발행 시각, 작성자 추적값은 서버가 계산한다.
7. 기존 정적 콘텐츠를 초기 DB 데이터로 옮겨 전환 직후 공개 글이 사라지지 않게 한다.

### 논의 필요

- 발행 중인 글을 수정할 때 공개 페이지에도 즉시 반영할지 여부.

### 선택지

- A. 저장 즉시 공개 반영
- B. 작업 원고와 발행 리비전을 분리하고 재발행할 때만 공개 반영
- C. 외부 Git 원고를 계속 원본으로 유지

### 추천

- B. 공개본 안정성을 위해 작업 원고와 발행 리비전을 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다. 관리자는 저장과 발행을 명시적으로 구분한다.

## 2차: 공유 계약과 관리자 CRUD·Markdown export API

### 작업내용

1. `packages/api-contract`에 생성, 수정, 상태 전이, revision, export 계약을 추가한다.
2. 기존 read DTO는 하위 호환을 유지하고 관리용 `version`, `publishedRevisionId`를 선택 필드로 확장한다.
3. Spring에 글 생성, 수정, 검수 요청, 발행, 보관, 복구 API를 추가한다.
4. 발행 이력이 없는 draft만 영구 삭제할 수 있고, 발행 이력이 있으면 archive만 허용한다.
5. 단건 `.md`와 채널/전체 `.zip` export를 제공한다.
6. export는 버전이 있는 YAML frontmatter와 Markdown 본문으로 구성하고 dry-run import가 다시 읽을 수 있게 한다.
7. raw HTML, `script`, `iframe`을 서버 입력 검증에서 차단한다.

### 논의 필요

- export 범위를 단건으로만 둘지 일괄 내보내기까지 제공할지 여부.

### 선택지

- A. 단건 Markdown만 제공
- B. 단건 Markdown과 채널/전체 ZIP 모두 제공
- C. Git 저장소에 직접 commit

### 추천

- B. 관리자 백업과 외부 편집을 위해 단건과 일괄 export를 모두 제공한다.

### 사용자 방향

- 추천 기준으로 진행한다. Git 직접 쓰기는 이번 범위에서 제외한다.

## 3차: 관리자 Markdown 편집 화면

### 작업내용

1. 기존 `/admin/content` 읽기 화면에 `새 글 작성`, `편집`, `Markdown 내보내기` 행동을 추가한다.
2. `/admin/content/new`와 `/admin/content/[articleId]/edit` 화면을 만든다.
3. 제목, 설명, 채널, 서비스, 카테고리, slug, SEO, 출처, 공개 설정을 의미별로 묶는다.
4. 본문은 공용 Markdown editor를 동적 import하고 동일 renderer로 미리보기한다.
5. 데스크톱은 편집·미리보기 2열, 모바일은 탭 전환으로 제공한다.
6. 저장 충돌, 유효성 오류, 발행 실패를 한국어 메시지로 명확히 표시한다.
7. 화면당 Primary CTA는 현재 상태에서 가능한 다음 행동 하나만 강조한다.

### 논의 필요

- 자동 저장을 도입할지 여부.

### 선택지

- A. 입력마다 자동 저장
- B. 명시적 저장과 저장되지 않은 변경 경고
- C. 30초 주기 자동 저장

### 추천

- B. 첫 버전에서는 명시적 저장으로 상태 전이와 충돌을 예측 가능하게 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 4차: 공개 채널 DB 발행본 전환과 검증

### 작업내용

1. Support, News, Blog 상세와 목록을 Spring 공개 API 발행본 기준으로 전환한다.
2. 검색, 관련 글, 목차, SEO, sitemap, RSS가 같은 발행본 데이터에서 파생되게 한다.
3. 기존 공통 헤더와 채널별 첫 화면 정보 위계를 유지한다.
4. Spring 연결 실패 시에만 배포 시점의 내장 초기 스냅샷으로 읽기를 유지하고, Spring의 명시적 404는 그대로 보존한다.
5. web/mobile 공유 계약 typecheck, Spring test/context boot, web lint/typecheck/test/build를 실행한다.
6. 375px와 데스크톱 관리자 편집 화면을 Playwright로 검증하고 증거 스크린샷을 남긴다.
7. 변경 파일 품질 리뷰와 정리 후 재검증한다.

### 논의 필요

- 공개 API 장애 시 오래된 정적 콘텐츠를 fallback으로 보여줄지 여부.

### 선택지

- A. 배포 시점의 내장 초기 스냅샷을 읽기 전용 fallback으로 유지
- B. 발행 DB만 원본으로 두고 명시적 오류 화면 제공
- C. 별도 CDN snapshot 계층 도입

### 추천

- A. DB를 쓰기·발행의 단일 진실 원천으로 유지하되, 장애 중 기존 공개 글이 사라지지 않도록 내장 초기 스냅샷은 읽기 전용으로만 사용한다.

### 사용자 방향

- 추천 기준으로 진행한다. fallback에서는 관리자 쓰기와 신규 글 추론을 하지 않는다.

## 완료 결과

- Spring에 작업 원고와 불변 발행 revision을 분리한 CMS 저장 모델을 추가했다.
- 관리자는 `/admin/content`에서 Markdown 작성, 미리보기, 검수 요청, 발행, 재발행, 보관, 복구, revision 조회를 수행할 수 있다.
- 단건 `.md`와 채널·전체 `.zip` export를 제공하고, 동일 frontmatter를 dry-run importer가 다시 읽을 수 있게 했다.
- Support, News, Blog의 목록·상세·검색·관련 글·목차·SEO·RSS·sitemap을 같은 공개 발행본 snapshot에서 파생한다.
- 최신 `origin/main` 에디토리얼 정리가 반영된 정적 43개 글을 Spring 초기 bootstrap 데이터이자 장애 시 읽기 전용 fallback snapshot으로 동기화했다.
- Markdown H1 검증은 renderer와 같은 CommonMark 의미 체계를 유지하기 위해 backend에 `org.commonmark:commonmark`를 추가했다.
- export frontmatter를 값 손실 없이 다시 읽기 위해 web에 표준 `yaml` parser를 추가했다. 두 의존성 모두 정규식·수제 parser의 의미 체계 drift를 막는 범위로만 사용한다.
- 보관 글의 `redirectTo`는 별도 공개 조회 계약과 영구 redirect 경로로 연결하고 sitemap에서는 제외한다.
