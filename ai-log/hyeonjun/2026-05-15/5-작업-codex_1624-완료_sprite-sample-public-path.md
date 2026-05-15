# 작업 로그 - sprite sample public path

- 시작/완료: 2026-05-15 16:24 KST
- 원인: 샘플 PNG가 root `public/`에 있어 Next web 앱에서 `/sprite-editor/...`로 제공되지 않았다.
- 수정: 샘플 PNG 2개를 `apps/web/public/sprite-editor/`로 이동.
- 검증 예정: web lint/typecheck, diff check, build.
