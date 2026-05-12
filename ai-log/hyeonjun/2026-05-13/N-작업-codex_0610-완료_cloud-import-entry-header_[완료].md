# cloud import entry header component 추출

## 목표

- `cloud-import-inline.tsx`의 entry header presentation을 별도 component로 이동한다.
- 기존 저장 작업/파일 선택/샘플 다운로드 동작은 유지한다.

## 계획

1. entry header props와 외부 의존성을 식별한다.
2. `CloudImportEntryHeader` component를 추가한다.
3. inline component에서 JSX를 대체하고 import를 정리한다.
4. web typecheck/lint/build 및 SSOT 검증을 실행한다.

## 완료

- `cloud-import-inline.tsx`의 entry header UI를 `CloudImportEntryHeader` component로 추출했다.
- 저장 작업 버튼, 로컬 파일 선택 CTA, 샘플 데이터 다운로드 링크 동작과 문구를 유지했다.
- `cloud-import-inline.tsx`를 719줄에서 647줄로 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
