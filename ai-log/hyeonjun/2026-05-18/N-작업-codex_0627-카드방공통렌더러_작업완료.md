# 카드방 공통 렌더러 적용 작업

- 목표: 카드방에서 카드 HTML/마크다운 내용이 raw 문자열로 보이는 문제 수정
- 추가 목표: 덱 상세 “내 덱” 링크를 `/card-service/decks`로 수정
- 변경:
  - `MarkdownContent`에 렌더링 표면별 텍스트 class override를 추가
  - 카드방 학습 패널이 raw 문자열 대신 `MarkdownContent`를 사용하도록 변경
  - 덱 상세 헤더의 내 덱 링크를 `/card-service/decks`로 수정
- 검증:
  - `pnpm --filter @yeon/web lint` 통과
  - `pnpm --filter @yeon/web typecheck` 통과
  - `git diff --check` 통과
