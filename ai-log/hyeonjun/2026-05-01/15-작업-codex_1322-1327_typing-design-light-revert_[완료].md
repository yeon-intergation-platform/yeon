# 타자방·타자 덱 디자인 라이트 톤 회귀

- 시작: 2026-05-01 13:22 KST
- 종료: 2026-05-01 13:27 KST
- Ralph 재개: 2026-05-01 13:45 KST
- 상태: 완료

## 요청

타자방과 연습덱/관리자 진입 화면이 기존 노션 느낌의 깔끔한 라이트 디자인이 아니라 검정 배경과 파랑 계열 강조로 바뀌었다. 기존 디자인 톤으로 회귀해야 한다.

## 작업

- 타자방 로비/대기방에서 `app-theme` 다크 변수 제거
- 흰 배경, 연한 회색 면, 검정 primary CTA 중심의 기존 Notion-like 톤으로 회귀
- 타자 덱 관리자 상단/권한 안내도 라이트 톤으로 정리
- 입력/선택 focus/hover는 파랑 대신 검정/연회색 위계로 정리
- `/typing-service/rooms`, `/typing-service/rooms/new`를 덱 페이지와 같은 흰 배경/얇은 보더/중립 CTA 톤으로 추가 회귀
- 멀티에이전트는 사용하지 않고 Ralph 단독으로 검증/배포 수행

## 검증

- `pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web build` PASS
- `git diff --check` PASS
- 운영 배포/스모크 확인 예정

- 로컬 Playwright 스모크: `/typing-service/rooms`, `/typing-service/rooms/new`, `/typing-service/decks`, `/admin/typing-decks` 모두 body white, `.app-theme` 0, darkish 0, bluePurple 0
