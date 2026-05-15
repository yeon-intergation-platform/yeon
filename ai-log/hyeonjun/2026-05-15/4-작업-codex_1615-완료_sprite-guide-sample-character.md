# 작업 로그 - sprite guide 샘플 캐릭터

- 시작: 2026-05-15 16:15 KST
- 완료: 2026-05-15 16:20 KST
- 목표: magenta gutter 템플릿 기준 16프레임 캐릭터 시트를 만들고 `/sprite-editor` 기본 샘플로 적용한다.
- 변경:
  - `public/sprite-editor/walk-guide-character-sample.png`: 1084x64, 64x64 16프레임 + 4px #ff00ff gutter 샘플 캐릭터 시트 추가.
  - `public/sprite-editor/walk-character-sample-sheet.png`: gutter 제거 후 1024x64 최종 시트 참고본 추가.
  - `apps/web/src/features/sprite-editor/sprite-frame-editor.tsx`: 기본 샘플 로딩을 guide gutter 절단 흐름으로 변경.
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `git diff --check`
  - `pnpm --filter @yeon/web build`
