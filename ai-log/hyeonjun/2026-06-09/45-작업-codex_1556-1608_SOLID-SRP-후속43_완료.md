# SOLID SRP 후속 43 — 모바일 MarkdownTextField 책임 분리

## 목표

- 백로그 198번(`markdown-text-field.tsx`)의 긴 함수 책임 분리 항목을 완료한다.
- selection/업로드/서식 삽입 상태와 툴바 렌더링 책임을 분리한다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- `yeon-2`에서 `origin/main` 기반 브랜치 `codex/solid-exception-followup-43` 생성.

## 변경

- 모바일 `MarkdownTextField`의 selection 제어, 이미지 업로드, 서식 삽입 커밋 로직을 `use-markdown-text-field-controller.ts`로 분리했다.
- 마크다운 서식 계산은 `markdown-text-field-formatting.ts`, 툴바 렌더링은 `markdown-text-field-toolbar.tsx`, 스타일은 `markdown-text-field-styles.ts`로 분리했다.
- 백로그 198번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 진행률 스크립트: 300개 중 181개 완료, 다음 미완료 199번.
- 라인 수: `markdown-text-field.tsx` 50라인, controller 124라인, formatting 84라인, toolbar 101라인, styles 22라인.
