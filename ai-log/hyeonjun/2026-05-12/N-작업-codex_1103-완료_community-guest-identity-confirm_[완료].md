# 커뮤니티 비회원 작성자 확인 모달

- 시작: 11:03
- 범위: 커뮤니티 글 작성/수정/삭제, 댓글 작성/삭제 전 닉네임/비밀번호 확인 UX
- 목표: 최초 1회 모달 + 성공 후 다시 보지 않음 localStorage 저장
- 주의: 현재 워킹트리에 다른 카드덱 Spring BFF 작업 변경이 있어 커뮤니티 파일만 선별 처리

## 이어받기 메모

- 11:xx 컴퓨터 종료 뒤 재개.
- 기존 변경분은 글 수정/삭제, 댓글 삭제 모달까지만 연결되어 있었음.
- 사용자 요청 범위에 맞춰 글 작성, 댓글 작성도 같은 확인 모달을 거치도록 확장.
- 서버 확인: BFF가 닉네임/비밀번호로 Spring guest profile을 resolve하고, Spring feed service가 수정/삭제 시 authorId 일치 여부로 권한 검증함.
- 남은 작업: 타입/빌드 검증 후 작업 로그 완료 처리, 커뮤니티 파일만 선별 커밋/PR/merge.

## 완료 메모

- 글 작성, 글 수정, 글 삭제, 댓글 작성, 댓글 삭제를 모두 `CommunityGuestIdentityConfirmModal` 경유로 통일.
- 모달 확인 시 입력한 닉네임/비밀번호를 feed actor payload로 직접 전달하고 전역 작성자 정보에도 반영.
- `다시 보지 않음`은 잘못된 닉네임/비밀번호 실패 상태를 고정하지 않도록 실제 요청 성공 후에만 저장.
- 검증: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `git diff --check`, `pnpm --filter @yeon/web build` 통과.
