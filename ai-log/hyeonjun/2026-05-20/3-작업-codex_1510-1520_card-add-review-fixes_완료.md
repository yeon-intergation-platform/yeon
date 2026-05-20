# 카드 추가 모달 코드리뷰 후속 수정 작업 로그

## 목표

- 코드리뷰에서 나온 모바일 미리보기 회귀, magic height, sticky footer coupling, preview 중복, rich content 판정 분리, compact density API 누수, bulk 폭 문제를 수정한다.

## 작업 브랜치

- worktree: `/home/osuma/coding_stuffs/yeon-3`
- branch: `codex/card-add-preview-review-fixes`
- base: `origin/main`

## 진행

- 후속 백로그 작성 완료.

## 구현 메모

- 모바일/좁은 화면에서는 `previewPlacement="mobile"`로 에디터별 작성/미리보기 전환을 복구했다.
- 데스크톱 통합 미리보기는 `lg` 이상에서만 표시하도록 제한했다.
- `calc(90vh-220px)` magic height를 제거하고 preview panel을 부모 grid/flex 높이에 맞추도록 변경했다.
- 저장/취소 sticky bar의 부모 padding 의존 음수 margin을 제거했다.
- `CardPreviewSurface`를 공통 preview surface로 추출해 기존 에디터 미리보기와 카드 추가 앞면/뒷면 미리보기가 같은 렌더 표면을 사용하게 했다.
- rich content 빈 상태 판정을 `isRenderableRichContent`로 공통화했다.
- 공용 에디터 API를 `density=question|answer` + `layoutMode=compact` 형태로 정리했다.
- 직접 작성/일괄 추가 모드의 모달 폭을 분리했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `curl -I http://localhost:3000/`는 현재 dev server 미기동으로 접속 불가. 저장소 규칙상 에이전트가 dev server를 직접 기동하지 않아 시각 검증은 개발자 dev server에서 후속 확인 필요.
