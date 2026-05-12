# 방 로비 디자인 통일 작업 로그

## 목표

- 카드방/타자방 로비가 같은 방 목록 화면처럼 보이게 헤더, 입장 캐릭터 카드, 필터/검색/CTA 배치를 맞춘다.

## 시작 상태

- 루트 worktree에는 unrelated 변경이 있어 `../yeon-room-design-unify` worktree의 `codex/room-design-unify-20260512` 브랜치에서 격리 작업한다.
- 카드방 로비는 우측 프로필 카드와 검색 옆 CTA를 갖고 있고, 타자방 로비는 상단 CTA만 있어 같은 방 경험으로 보이지 않는다.

## 진행

- 카드방 스크린샷 구조를 기준으로 타자방 로비에 입장 캐릭터 카드와 검색 옆 방 만들기 버튼을 추가한다.

## 완료

- 타자방 로비 상단에 카드방과 같은 입장 캐릭터 카드 구조를 추가했다.
- 타자방 `방 만들기` CTA를 카드방처럼 검색창 옆으로 옮기고, 모바일 플로팅 CTA는 유지했다.
- 카드방 프로필 카드 문구를 스크린샷 기준의 `입장 캐릭터` / `캐릭터 바꾸기`로 맞췄다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 참고

- Playwright MCP 화면 확인은 현재 환경에 X server가 없어 실행하지 못했다.
