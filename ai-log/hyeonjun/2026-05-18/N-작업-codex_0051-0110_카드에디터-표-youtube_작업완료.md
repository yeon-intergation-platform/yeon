# 카드 에디터 표/YouTube 표현력 확장 작업 로그

## 목표

- 카드 에디터 디자인은 유지한다.
- 표 붙여넣기/표 버튼과 YouTube embed 기능을 추가한다.

## 변경

- HTML table 단독 붙여넣기와 TSV/스프레드시트 복사를 Markdown table 라인으로 변환해 에디터에 삽입한다.
- 카드 에디터 툴바에 기존 디자인 톤을 유지한 표 삽입 버튼을 추가했다.
- rich HTML 붙여넣기 중 포함된 table도 Markdown table 라인으로 정규화한다.
- YouTube URL 단독 붙여넣기 시 TipTap YouTube embed 노드를 삽입한다.
- 카드 프리뷰 렌더러에서 standalone YouTube 링크를 `youtube-nocookie.com` iframe으로 변환하고 sanitizer에서 허용 iframe만 복원한다.
- HTML 저장값에 포함된 Markdown table 라인을 프리뷰 렌더링 단계에서 실제 table로 변환한다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
