# profile-import panel fetch wrapper 분리

- 대상: `apps/web/src/features/student-management/components/profile-import-panel.tsx`
- 변경: AI 프로필 분석/저장/reload 직접 fetch를 `hooks/profile-import-fetch.ts`로 분리했다.
- 보강: student-management fetch wrapper가 `message`뿐 아니라 `error` 필드도 읽어 기존 route 오류 문구를 유지하게 했다.
- 검증 예정: web typecheck/lint/build, diff check, sync-skills, verify-ssot, profile panel fetch grep 0건.
