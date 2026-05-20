# 카드 추가 모달 탭 전환 상태 보존 작업 로그

## 목표

- 직접 작성 탭에서 입력한 질문/답변이 일괄 추가 탭 전환 후에도 절대 사라지지 않게 한다.
- 탭별 dirty 상태를 분리해 닫기 confirm이 정확히 동작하게 한다.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 추가 요구 반영

- compact editor 별도 header row 제거.
- `카드 질문`/`카드 답변` label을 toolbar row 왼쪽으로 이동.
- `이미지 삽입 가능`/`업로드 중` pill을 toolbar row 오른쪽으로 이동.
- 우측 preview rail의 `실시간 미리보기 / 앞면·뒷면` header row 제거.
- `카드 답변 / 본문` 문구를 `카드 답변`으로 통일.

## 이미지/코드블록/미리보기 추가 계획

- 사용자 지시에 따라 추가 코드 구현을 중단하고 백로그 우선 작성으로 전환했다.
- `study-platform-client`는 읽기 전용으로 참고했다.
- 1차 판단: Yeon은 `ResizableCardEditorImageExtension.configure({ inline: true })`를 쓰고 있어 이미지가 카드 본문 블록처럼 흐르지 않는 원인 후보가 크다.
- 1차 판단: 미리보기 미반영은 `editor.getHTML()` → React state → `CardAddLivePreview` → `MarkdownContent` 중 끊기는 지점을 Playwright/DOM으로 확인해야 한다.
- 신규 백로그: `docs/product/backlog/card-add-editor-rendering-image-codeblock-20260520.md`

## 구현 진행

- 직접 작성/일괄 추가 폼을 항상 mount하고 hidden/aria-hidden으로 표시만 전환했다.
- manualDirty/bulkDirty를 분리하고 닫기 confirm source of truth를 `manualDirty || bulkDirty`로 정리했다.
- 직접 작성 dirty 기준을 raw HTML snapshot 비교에서 의미 있는 렌더 가능 콘텐츠 기준으로 바꿨다.
- compact editor header row와 preview rail header row를 제거했다.
- `카드 질문`/`카드 답변` label과 이미지 상태 pill을 toolbar row로 흡수했다.
- `카드 답변 / 본문` 문구를 `카드 답변`으로 통일했다.
- 이미지 확장의 inline 강제를 제거하고 이미지 삽입 시 block image + 후속 paragraph 구조로 바꿨다.
- 이미지 리사이즈 NodeView의 표시/원본 크기 label과 width 동기화를 정리했다.
- 코드블록 내부 paste에서는 이미지/테이블/유튜브 자동 변환 로직이 개입하지 않게 했다.
- 미리보기 이미지도 block 흐름으로 보이게 렌더링 CSS를 정리했다.

## 검증 기록

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-image-utils.test.ts` 통과.
- `git diff --check` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `localhost:3000` Playwright는 시도했지만 로컬 서버가 떠 있지 않아 `ERR_CONNECTION_REFUSED`로 실행 불가했다.

## 커밋 전 최종 상태

- 백로그의 toolbar/header 압축 요구와 이미지/코드블록/미리보기 수정 요구를 코드에 반영했다.
- 커밋 훅에서 전체 lint/typecheck가 통과했다.
- `localhost:3000` Playwright QA는 서버 미기동으로 보류 상태이며, PR 본문에 명시한다.
