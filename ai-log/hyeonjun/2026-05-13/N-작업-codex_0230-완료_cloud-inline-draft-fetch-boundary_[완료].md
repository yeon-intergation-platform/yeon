# cloud-import inline draft fetch boundary 분리

- 대상: `cloud-import-inline.tsx`
- 변경: saved drafts 목록 조회와 draft 삭제 직접 fetch를 `cloud-import-fetch.ts` wrapper로 이동했다.
- 의도: 1400줄급 컴포넌트 분해 전 네트워크 boundary를 먼저 닫는다.
- 검증 예정: web typecheck/lint/build, diff check, sync-skills, verify-ssot, cloud-import-inline fetch grep 0건.
