# 카드 편집기 선택 영역 코드버튼 범위 수정

- 시작: 2026-06-06 04:08 KST
- 브랜치: codex/card-editor-selection-code-scope
- 목표: 드래그 선택 후 코드 버튼 클릭 시 선택한 부분만 코드로 변환하고, 위아래 문단까지 코드가 되는 범위 오염을 막는다.
- 검증 예정: 관련 로직 단위 점검, 웹 lint/typecheck, 가능하면 Playwright 로컬 편집기 선택 동작 확인.

## 완료

- 완료: 2026-06-06 04:18 KST
- 변경: 텍스트 선택이 있는 상태에서 코드블록 버튼을 누르면 `toggleCodeBlock()` 대신 선택 범위를 단일 `codeBlock` 노드로 교체한다.
- 의도: Tiptap 기본 블록 토글이 선택이 걸친 전체 텍스트블록을 코드블록으로 바꾸는 범위 오염을 막고, 드래그한 부분만 코드로 만들기 위함.
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `git diff --check`
  - `pnpm --filter @yeon/web build`
  - Tiptap 명령 재현: `위문단 / 가나다 / 아래문단`에서 `나`만 선택 시 `위문단 / 가 / codeBlock(나) / 다 / 아래문단`으로 분리됨 확인.
- 제한: 로컬 카드 상세 화면은 Playwright 비로그인 게스트 덱 진입 시 `불러오는 중...`에서 멈춰 실제 화면 클릭 검증은 완료하지 못했다.
