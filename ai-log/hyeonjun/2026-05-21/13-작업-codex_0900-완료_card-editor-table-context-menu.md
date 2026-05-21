# 카드 에디터 표 우클릭 삭제 UX

## 목표

- 직접 작성 에디터 표를 오른쪽 클릭으로 삭제 가능하게 한다.
- Windows/macOS식 컨텍스트 메뉴 UX를 재사용 가능한 공용 컴포넌트로 만든다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- `YeonContextMenu` 공용 컴포넌트를 추가했다.
- 카드 rich editor에서 표를 오른쪽 클릭하면 "표 삭제" 컨텍스트 메뉴를 띄우도록 연결했다.
- 메뉴 실행 시 우클릭 위치의 표 selection으로 이동한 뒤 TipTap `deleteTable` 명령으로 표 전체를 삭제한다.
- 메뉴는 바깥 클릭, Escape, 스크롤, 리사이즈에서 닫히며 viewport 밖으로 넘치지 않게 위치를 보정한다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`

## 배포

- PR 생성 후 `main`에 머지 예정.
- `yeon` 워크트리는 머지 후 `git pull` 예정.
