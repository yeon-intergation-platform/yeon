# 커뮤니티 X 스타일 타임라인 디자인

- 시작: 16:58
- 범위: `apps/web/src/features/community/community-page.tsx`
- 목표: 카드형 반복 UI를 X/Twitter식 아바타/핸들/액션바 타임라인으로 변경
- 제약: public-check 미완료 변경은 건드리지 않음

## 완료

- 종료: 17:12
- 변경: 커뮤니티 피드를 X/Twitter식 타임라인 레이아웃으로 재구성
- 보존: 기존 글 작성, 댓글, 수정, 삭제 동작과 게스트 작성자 정보 폼 유지
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
- 참고: Playwright MCP 시각 확인은 headed browser가 XServer 없이 실행되어 실패함
