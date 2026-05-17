# 카드 추가 모달 미리보기 단일 표면 작업

- 목표: 카드 추가 모달 질문/답변 미리보기의 내부 중첩 박스 제거
- 범위: card-service 웹 UI 스타일 변경만
- 변경: `CardEditorPreview`의 외부 패널을 단일 카드 표면으로 유지하고 내부 테두리/그림자 박스를 제거
- 검증:
  - `pnpm --filter @yeon/web lint` 통과
  - `pnpm --filter @yeon/web typecheck` 통과
  - `git diff --check` 통과
- 비고: `jq` 미설치로 package script 조회 보조 명령은 실패했으나 검증 명령 자체는 정상 수행
