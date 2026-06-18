# typing-service 영어 locale 한글 노출 제거

## 목표

- 영어 언어 설정 시 타자 서비스 일반 사용자 경로에서 한국어 UI 문구가 보이지 않게 한다.

## 기준

- 브랜치: `i18n/english-no-korean-20260618`
- 기준 브랜치: `origin/main`
- 주요 검증: Playwright 영어 설정 화면 검사, `@yeon/web` lint/typecheck

## 진행

- `yeon-2` 워크트리를 최신 `origin/main` 기준으로 분기했다.
- `typing-service` 규칙과 웹 프론트 구조 규칙을 확인했다.
- 타자 서비스 공통 UI 문구를 locale 기반 `typing-service-i18n`으로 분리했다.
- 영어 기본 문장/덱/방/레이스/헤더/설정/상태 화면의 사용자 노출 문구를 영어 라벨로 연결했다.
- 영어 설정 복원 전 한국어 채팅 위젯이 잠깐 보이는 문제를 막기 위해 타자 서비스 레이아웃에서 설정 hydration 전 채팅 위젯을 숨겼다.
- 영어 모드의 덱 라이브러리가 한국어 기본 덱을 먼저 보여주는 문제를 영어 덱 필터 기본값으로 보정했다.
- race-server가 보내는 한국어 시스템 메시지는 클라이언트에서 영어 라벨로 정규화했다.

## Playwright 확인

- 실제 저장 포맷(`yeon:typing-settings`, Zustand persist state)으로 영어 설정을 주입했다.
- 확인 경로: 홈, 덱 라이브러리, 덱 연습, 방 로비, 일반 방 생성 모달, 일반 방 대기, 일반 방 시작 후 레이스, 점령전 방 생성 모달, 점령전 대기.
- 확인 범위: visible text, `document.title`, `aria-label`, `title`, `placeholder`.
- 결과: 위 경로에서 한글 정규식 검출 0건.
- 실제 입력 검증: 일반 방 생성 후 Start 버튼이 보일 때까지 대기, 144자 문장 부분 입력 및 전체 입력, 진행률 100%, 현재 1위 표시 확인.

## 발견한 UX 이슈

- 솔로 연습과 멀티플레이 레이스 모두 기본 카운트다운이 10초라 연습 진입이 느리다. 기능 오류는 아니지만 실제 사용감 기준으로는 별도 개선 후보다.

## 검증

- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm verify:parity` 통과.
- `git diff --check` 통과.
