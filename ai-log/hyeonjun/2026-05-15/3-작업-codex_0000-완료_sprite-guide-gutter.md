# 스프라이트 guide gutter 워크플로우 작업 로그

- 시작: 2026-05-15 KST
- 완료: 2026-05-15 KST
- 목표: AI 생성 이미지와 절단 로직이 일치하도록 64x64 프레임 + 4px magenta gutter guide sheet 규격을 `/sprite-editor`에 구현

## 구현 결과

- guide sheet 규격을 16프레임, 64x64, 4px magenta(`#ff00ff`) gutter로 고정했다.
- `guide template export` 버튼으로 1084x64 투명 프레임 + magenta gutter 템플릿을 받을 수 있게 했다.
- `magenta guide sheet import` 버튼으로 해당 규격의 시트를 업로드하면 gutter를 버리고 16개 64x64 프레임만 추출한다.
- 최종 `스프라이트시트 export`는 gutter 없는 1024x64 투명 시트로 유지한다.
- QA JSON manifest에 guide sheet 규격 정보를 포함했다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web build`
