# 실시간 채팅 패널 기본 열림을 데스크톱 한정 + 사용자 선택 영속화

- 실행 주체: claude
- 시작: 2026-05-31 01:00 / 종료: 2026-05-31 01:07
- 상태: 완료(배포 후 라이브 Playwright 검증 예정)

## 요구사항

- 데스크톱에서만 기본 열림, 모바일/태블릿 첫 진입은 닫힘.
- 사용자가 직접 연/닫은 상태는 라우트 이동·재마운트 후에도 유지.
- `/typing-service` → `/typing-service/decks` → 복귀 시 자동 재오픈 금지.

## 원인

`CommunityChatWidget`(variant="compact", typing/card 레이아웃의 플로팅 위젯)의 열림 상태가
로컬 useState(`isBodyCollapsed`/`isShellCollapsed`)였고 **초기값이 항상 열림**이라,
화면 크기 무관하게 열려 시작하고 인스턴스 재마운트 시 다시 열림으로 초기화됐다.

## 변경

- 신규 `apps/web/src/features/community/hooks/use-community-chat-panel.ts`:
  zustand + persist(localStorage, key `yeon:community-chat-panel`) 스토어.
  - `userPreference: boolean | null` (null=미조작 → breakpoint 기본값).
  - `useIsDesktop()`: `matchMedia("(min-width: 1024px)")`(Tailwind lg), SSR 안전(초기 null).
  - `useCommunityChatPanel()`: `isOpen = resolved ? (userPreference ?? isDesktop) : false`.
    하이드레이션+breakpoint 해소 전에는 닫힘으로 두어 모바일 깜빡임 방지.
- `community-chat-widget.tsx`(compact만):
  - 접힘 상태 초기값 닫힘(true)으로 변경.
  - `isChatPanelOpen`에 애니메이션 상태를 동기화하는 useEffect 추가(기존 framer-motion exit/onExitComplete 유지).
  - 토글 버튼 onClick을 `setChatPanelOpen(!isChatPanelOpen)`로 변경(스토어가 소스).
  - variant="feed"(community 페이지 임베드)는 영향 없음(`isCompact` 가드).

## 동작

- 모바일 첫 진입: 닫힘 / 데스크톱 첫 진입: 열림.
- 사용자가 닫음/열음 → localStorage에 보존 → 라우트 이동·재마운트 후에도 유지(자동 재오픈 없음).
- store가 전역 싱글톤 + persist라 컴포넌트 생명주기와 무관.

## 검증

- `pnpm --filter @yeon/web typecheck` / 변경 파일 lint → 통과(에러 0).
- 클라이언트 로직만 변경(라우팅/서버경계/env 변경 없음). 웹 빌드는 CD 게이트.
- 배포 후 라이브 Playwright로 모바일닫힘/데스크톱열림/닫고복귀유지/영속 4종 검증 예정.
