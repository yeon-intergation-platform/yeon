# cloud-import saved drafts 상태 hook 분리

- 대상: `cloud-import-inline.tsx`
- 변경: 저장된 가져오기 작업 모달의 query/refetch/delete/timer 상태를 `use-saved-import-drafts-modal.ts`로 분리했다.
- 결과: inline 컴포넌트는 모달 렌더링과 entry controls wiring만 담당하고, 저장 draft 상태 전이는 hook이 소유한다.
- 검증 예정: web typecheck/lint/build, diff check, sync-skills, verify-ssot.
