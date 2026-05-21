# 카드 에디터 표 Backspace 삭제 UX

## 목표

- 표 선택 상태에서 Backspace/Delete로 표 전체 삭제를 지원한다.
- 일반 셀 편집 중 오삭제는 막는다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- 표 전체 `NodeSelection` 또는 복수 셀 `CellSelection` 상태에서 Backspace/Delete 입력 시 `deleteTable`을 실행하도록 추가했다.
- 일반 셀 내부 텍스트 편집 중 Backspace는 기존 동작을 유지한다.
- 키보드 삭제 후 table overlay/context menu 상태를 정리하고 toolbar 상태를 갱신한다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`

## 배포

- PR 생성 후 `main`에 머지 예정.
- `yeon` 워크트리는 머지 후 `git pull` 예정.
