# 카드/타자 마크다운 에디터 성능 및 Tab 처리 개선

## 작업

- TipTap transaction마다 React 리렌더, HTML 직렬화, 미리보기 렌더, 문서 전체 table scan이 겹치는 병목을 줄였다.
- 목록 안 일반 Tab이 Mac 텍스트 대치 흐름을 중첩 목록으로 오인하는 문제를 막았다.

## 변경

- `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
  - toolbar active/canUndo/canRedo/table 상태를 렌더 중 직접 계산하지 않고 `requestAnimationFrame`으로 모아 갱신한다.
  - `onTransaction` 전체 리렌더 트리거를 제거하고 create/update/selection/toolbar action 시점에만 상태 갱신을 예약한다.
  - 미리보기 값은 `useDeferredValue`로 입력 경로와 분리한다.
  - 코드블록 밖 일반 Tab은 TipTap 목록 중첩 단축키로 처리하지 않게 차단한다.
- `apps/web/src/features/card-service/components/card-rich-markdown-editor-view.tsx`
  - 미리보기 컴포넌트를 `memo`로 감싸 toolbar 상태 갱신과 미리보기 렌더를 분리한다.
- `docs/product/backlog/infra.md`
  - 이번 성능/Tab 개선 작업 차수를 기록했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과

## 남은 확인

- Linux 로컬 환경에서는 macOS 텍스트 대치 UI를 직접 재현할 수 없어, 운영 반영 후 Mac에서 실제 Tab 입력 보조 흐름을 확인해야 한다.
