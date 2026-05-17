# 카드 에디터 Mermaid 렌더링 작업 로그

- 시작: 2026-05-18 03:07
- 종료: 2026-05-18 03:28
- 브랜치: `feat/card-editor-mermaid-20260518`
- 목표: 카드 에디터 기존 디자인을 유지하면서 Mermaid 코드블록을 프리뷰에서 다이어그램으로 렌더링한다.

## 변경

- `@yeon/web`에 `mermaid` 의존성을 추가했다.
- Markdown `mermaid` fenced code block을 카드 프리뷰에서 다이어그램으로 렌더링한다.
- HTML 저장값의 `<pre><code class="language-mermaid">`도 동일하게 Mermaid 렌더링한다.
- 렌더 실패 시 코드 원문으로 후퇴하도록 실패 경계를 추가했다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web build`
