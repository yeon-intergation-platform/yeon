# 12 작업 - community playwright ux

## 목표

- 로컬에서 커뮤니티를 직접 실행하고 Playwright로 실제 사용자 흐름을 탐색한다.
- 발견한 버그와 사용성 문제를 근거 중심으로 수정하고 검증한다.

## 제약

- base/PR target은 `main`이다.
- 상담 워크스페이스는 건드리지 않는다.
- web/mobile parity registry상 community-vs-chat-service-query-keys는 `platform-divergent`라, 이번 수정은 웹 커뮤니티 경로 안에서 좁게 처리한다.
- 새 dev 서버를 띄우기 전 기존 포트 점유 상태를 확인하고 재사용한다.

## 진행 메모

- 브랜치: `fix/community-playwright-ux-20260618-2`
- 시작 커밋: `origin/main` `27949242`
- 디자인 방향: 랜딩형 보라색 커뮤니티가 아니라 기존 흰 배경 생산성 UI를 유지하고, 모바일 375px에서 글/댓글 작성 행동과 오류 회복성이 먼저 보이도록 점검한다.

## 발견/수정

- Playwright 모바일 375px에서 `/community`를 실제로 열어 글 작성 후 `다시 보지 않음`을 선택했다.
- 새로고침 뒤 localStorage에는 닉네임과 dismiss 플래그만 남고 비밀번호는 React state에서 사라졌다.
- 이 상태에서 삭제를 누르면 작성자 확인 모달을 건너뛰고 `로그인이 없거나 닉네임/비밀번호를 함께 입력해 주세요.` 서버 오류가 노출됐다.
- `dismiss && 닉네임/비밀번호 모두 존재`일 때만 작성자 확인을 건너뛰도록 순수 헬퍼를 분리했다.
- 상세 화면에서 글 삭제 성공 후 삭제된 상세 페이지에 남지 않고 `/community` 목록으로 이동하도록 했다.

## 검증

- Playwright: dismiss 플래그가 있지만 비밀번호가 빈 상태에서 삭제 시 서버 오류 대신 `작성자 확인` 모달이 열림.
- Playwright: 모달에 올바른 비밀번호를 입력하면 목록 삭제 성공.
- Playwright: 상세 페이지 삭제 성공 후 `http://localhost:3005/community`로 이동하고 삭제 글이 목록에서 사라짐.
- `pnpm --filter @yeon/web test -- src/features/community/__tests__/community-guest-identity.test.ts` 통과: 202 files / 877 tests.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `pnpm verify:parity` 통과.
