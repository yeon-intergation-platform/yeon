# 공통 프로필/헤더 UI 정리

## 목표

- typing/card 공통 프로필 카드의 캐릭터 선택 텍스트 소실 문제를 수정한다.
- typing 홈 폭을 card 홈 기준으로 맞춘다.
- 공통 헤더 메뉴 간격과 설정 아이콘을 정리한다.
- yeon.world에서 news.yeon.world로 이동할 수 있게 한다.

## 진행 기록

- 첨부 이미지 4개 확인.
- `typing-service`, `card-service`, `code-quality-principles` 스킬 SSOT 확인.
- `design-workflow` wrapper가 가리키는 `.claude/commands/design-workflow.md`는 현재 worktree에 없어 적용 불가.
- `TypingProfileCard`가 typing/card 홈에서 공통 사용되는 것을 확인.
- card 방 프로필은 별도 저장소를 쓰되 typing 프로필의 캐릭터 값을 우선 읽는 부분 동기화 구조임을 확인.
- 캐릭터 선택 버튼은 `YeonButton` secondary 기본 색과 selected 색이 충돌할 수 있어 selected/default 색을 important class로 고정했다.
- typing 홈 board/profile/action 패널 폭을 card 홈 기준으로 맞췄다.
- 제품 헤더 브랜드 문구를 `YEON`으로 통일하고, card deck 상세/플레이와 typing deck 화면도 공통 헤더를 쓰도록 정리했다.
- `yeon.world` 홈 서비스 레지스트리에 `YEON 뉴스` 외부 링크를 추가했다.
- 프로필 메뉴의 `내정보보기`/`로그아웃` 행 높이·폭·정렬을 동일한 class로 고정했다.
- 설정 아이콘을 톱니바퀴에서 slider 스타일 아이콘으로 교체했다.
- Playwright 시각 검증 중 compact 커뮤니티 채팅이 기본 열린 상태로 CTA를 덮는 문제를 발견해, 사용자 선택이 없으면 기본 닫힘으로 변경했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/platform-services.test.ts` 통과.
- `pnpm --filter @yeon/ui typecheck && pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint && pnpm --filter @yeon/ui lint` 통과.
- `git diff --check` 통과.
- `pnpm verify:parity` 통과.
- `pnpm --filter @yeon/web build` 통과.
- Playwright 로컬 검증 통과: `http://localhost:3007/typing-service`, `/card-service`, `/`에서 캐릭터 선택 텍스트 유지, profile card 폭 980px 일치, 프로필 메뉴 행 174x44 일치, news 링크 `https://news.yeon.world`, 설정 아이콘 circle 2개 확인, compact chat 기본 닫힘 확인.
