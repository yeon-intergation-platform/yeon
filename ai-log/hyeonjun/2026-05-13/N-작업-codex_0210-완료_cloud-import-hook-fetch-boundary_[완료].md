# cloud-import hook fetch boundary 분리

- 대상: `use-cloud-import.ts`, `use-local-import.ts`
- 변경: 직접 fetch 호출을 `cloud-import-fetch.ts`로 이동했다.
- 범위: 연결 상태, 파일 목록, 분석 SSE request, import commit, draft load/save/delete.
- 검증 예정: web typecheck/lint/build, diff check, sync-skills, verify-ssot, 대상 hook fetch grep 0건.
