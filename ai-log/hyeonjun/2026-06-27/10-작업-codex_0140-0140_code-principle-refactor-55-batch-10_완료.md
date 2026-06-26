# 코드 품질 원칙 위반 리팩터링 55개 - 10차 배치

## 범위

- 태스크 43: 카드 editor image upload catch 메시지 정책 정리.
- 태스크 44: 카드 editor image upload clipboard/paste/drop 실패 유형 분리.
- 태스크 45: 카드 editor HEIC 변환 오류 원인 예외 보존 검증.
- 태스크 47: 카드 add form image side 상태 업데이트 action helper화.
- 태스크 48: 카드 bulk import preview 숨김 개수와 submit 가능 조건 테스트 보강.

## 변경

- `card-editor-image-utils.ts`에 이미지 업로드/붙여넣기/드롭 실패 메시지 생성 정책을 통합했다.
- `use-card-editor-image-upload.ts`와 `card-rich-markdown-editor.tsx`가 clipboard/paste/drop origin별 실패 메시지를 재사용하도록 정리했다.
- HEIC 변환 실패가 원인 예외를 `cause`로 보존하는지 테스트로 고정했다.
- add card form의 front/back 업로드 side 상태 전이를 action helper로 분리했다.
- bulk card import preview는 5장까지만 보이고 hidden count와 submit 가능 조건이 분리되는지 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-image-utils.test.ts src/features/card-service/components/card-editor-image-heic.test.ts src/features/card-service/utils/bulk-card-import-parser.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
