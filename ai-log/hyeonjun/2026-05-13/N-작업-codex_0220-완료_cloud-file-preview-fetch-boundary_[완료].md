# cloud file preview fetch boundary 분리

- 대상: `features/cloud-import/components/file-preview.tsx`
- 변경: preview blob/arrayBuffer/text fetch를 `cloud-import-fetch.ts` helper로 이동했다.
- 유지: HEIC 변환, XLSX/CSV/TXT 파싱, row virtualization UI 동작은 변경하지 않았다.
- 검증 예정: web typecheck/lint/build, diff check, sync-skills, verify-ssot, file-preview fetch grep 0건.
