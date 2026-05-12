# 타이핑 BGM 라우트 이동 지속

- 시작: 17:05
- 범위: 웹 타이핑 서비스 BGM 버튼/오디오 source of truth
- 목표: BGM ON 상태에서 앱 내 페이지 이동 시 음악이 끊기지 않게 한다.
- 제약: 기존 미니멀 UI 유지, 타 작업 변경 파일은 건드리지 않음.
- 계획: module-local audio를 globalThis singleton controller로 분리하고 버튼은 controller 이벤트를 구독한다.

## 완료 메모

- `TypingBgmButton` 내부 module-local Audio를 `typing-bgm-audio.ts`의 `globalThis` singleton controller로 분리.
- 버튼은 `useSyncExternalStore`로 controller snapshot을 구독해 remount 뒤에도 같은 재생 상태를 표시.
- 같은 브라우저 탭의 Next.js 클라이언트 라우트 이동/컴포넌트 remount에서는 기존 audio 인스턴스가 유지됨.
- 검증: 파일 단위 eslint, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `git diff --check`, `pnpm --filter @yeon/web build` 통과.
- Playwright MCP headed browser는 X server 없음으로 실행 불가.
