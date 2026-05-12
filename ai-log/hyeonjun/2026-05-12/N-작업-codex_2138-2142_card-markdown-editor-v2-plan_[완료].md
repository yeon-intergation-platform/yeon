# 카드 마크다운 에디터 v2 계획

## 목표

study-platform-client 공용 마크다운 에디터를 참고해 Yeon 카드 에디터의 이미지 삽입/크기 조절/preview/아이콘 툴바 개선을 N차 개발 백로그로 정리한다.

## 근거 확인

- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/markdown-editor.tsx`
- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/use-image-upload.ts`
- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/extensions.ts`
- `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
- `apps/web/src/features/card-service/components/markdown-content.tsx`

## 산출물

- `docs/product/backlog/card-markdown-editor-v2-20260512.md`

## 완료 감사

- 명시 요구: `study-platform-client` 공용 마크다운 에디터 참고 → 참고 파일 4개 확인 후 백로그에 반영.
- 명시 요구: 이미지 드래그앤드롭 → 2차 작업/완료 조건에 반영.
- 명시 요구: 글자 사이 이미지 삽입 → 2차 작업/완료 조건에 반영.
- 명시 요구: 이미지 크기 조절 → 3차 작업/완료 조건에 반영.
- 명시 요구: 오른쪽 markdown preview → 4차 작업/완료 조건에 반영.
- 명시 요구: 한국어 텍스트 버튼보다 아이콘 중심 → 1차 작업/사용자 방향에 반영.
- 명시 요구: 개발 백로그 N차 계획 → 1~5차 계획 작성.

## 검증

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
