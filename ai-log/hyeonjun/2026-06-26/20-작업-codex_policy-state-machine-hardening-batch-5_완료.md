# 20차 작업 - 정책/상태머신 보강 5차

## 대상

- 카드 import parser 실패 정책과 UI submit/preview 상태 연결
- 카드 에디터 이미지 업로드 시작/진행 상태 정책 구체화

## 변경

- `deriveBulkCardImportFormPolicy`를 추가해 parse 결과에서 submit 가능 여부, preview 카드, 숨김 preview 개수를 한 곳에서 파생.
- 일괄 카드 추가 폼이 parser 정책 함수를 사용하도록 정리.
- 이미지 업로드 side 상태, 진행 여부, 시작 가능 여부를 `card-editor-image-utils.ts` 순수 함수로 분리.
- 카드 추가 폼, 카드 row 편집, 이미지 업로드 hook이 같은 업로드 상태 정책을 사용하도록 통일.
- parser 정책과 업로드 상태 정책 테스트를 추가.
- 50개 태스크 장부에서 39, 40번 완료 증거를 갱신.

## 검증

- `pnpm --filter @yeon/web test -- src/features/card-service/utils/bulk-card-import-parser.test.ts src/features/card-service/components/card-editor-image-utils.test.ts`
  - web Vitest 228개 파일 / 1019개 테스트 통과
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
