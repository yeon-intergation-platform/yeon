# 작업 로그 - slime sprite editor sample

- 목표: GPT image-gen 슬라임 8프레임 시트를 `/sprite-editor` 기본 샘플로 적용한다.
- 변경:
  - 생성 원본에서 checkerboard 배경을 제거하고 64x64 8프레임 + 4px magenta gutter guide sheet로 정규화했다.
  - `apps/web/public/sprite-editor/slime-bounce-guide-sample.png` 추가.
  - `apps/web/public/sprite-editor/slime-bounce-sample-sheet.png` 추가.
  - `/sprite-editor` 기본 샘플 로딩과 guide template 기준을 8프레임 슬라임 샘플 기준으로 변경했다.
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `git diff --check`
  - `pnpm --filter @yeon/web build`
