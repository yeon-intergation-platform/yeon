# 카드 추가 모달 스크롤 최소화 작업 로그

## 목표

- 백로그 `docs/product/backlog/card-add-modal-compact-preview-layout-20260520.md` 기준으로 카드 추가 직접 작성 모달을 스크롤이 덜 필요한 좌우 분할 제작 화면으로 개선한다.

## 초기 확인

- 작업 워크트리: `/home/osuma/coding_stuffs/yeon-2`
- 브랜치: `codex/card-add-compact-preview` (`origin/main` 기준)
- 관련 파일:
  - `apps/web/src/features/card-service/components/add-card-form.tsx`
  - `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
  - `apps/web/src/features/card-service/components/card-rich-markdown-editor-view.tsx`

## 진행

- 백로그 작성 완료.
- 직접 작성 화면 구현 예정.

## 구현 메모

- `AddCardForm`을 데스크톱 좌우 분할 구조로 변경했다.
- `CardRichMarkdownEditor`에 `previewPlacement="none"` 옵션을 추가해 카드 추가 화면에서 질문/답변별 중복 미리보기를 끌 수 있게 했다.
- 카드 추가 전용 compact 높이(`compactQuestion`, `compactAnswer`)를 추가했다.
- `CardAddLivePreview`를 추가해 오른쪽에 앞면/뒷면 카드 미리보기를 동시에 표시한다.
- 저장/취소 액션은 하단 sticky 영역으로 변경했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `curl -I http://localhost:3000/`는 현재 로컬 dev server가 떠 있지 않아 접속 불가. 저장소 규칙상 에이전트가 `pnpm dev:all`을 직접 기동하지 않으므로 시각 검증은 개발자가 켜둔 dev server에서 후속 확인한다.
