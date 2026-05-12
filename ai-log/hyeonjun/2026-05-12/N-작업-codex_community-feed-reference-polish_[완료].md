# 커뮤니티 피드 레퍼런스형 타임라인 다듬기

- 시작: 진행 중
- 범위: `apps/web/src/features/community/community-page.tsx`
- 목표: 첨부 레퍼런스처럼 카드 느낌을 줄이고 타임라인형 커뮤니티로 개선
- 제약: 기존 피드 작성/댓글/수정/삭제 동작 유지, 신규 backend/API 추가 없음

## 완료

- 변경: 커뮤니티 피드를 카드형보다 X/Twitter식 얇은 구분선 타임라인에 가깝게 조정
- 변경: 피드 글 본문 위계를 제목 카드에서 본문 중심 텍스트 흐름으로 변경
- 변경: 채팅 위젯 feed variant 높이와 스크롤 영역을 넓히고 피드 글 작성과 분리된 설명 추가
- 변경: 현재 브랜치가 main보다 뒤처져 있어 커뮤니티 작성자 확인 모달/훅/상세 페이지 최신 흐름도 함께 반영
- 검증:
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web build`
- 참고: 사용자 지시에 따라 새 브랜치 작업을 중단하고 `fix/public-check-cookie-bff-boundary` 현재 브랜치 위에 적용함
