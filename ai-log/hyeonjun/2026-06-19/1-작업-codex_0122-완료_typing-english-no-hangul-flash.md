# typing-service 영어 locale 한글 flash 제거

## 목표

- 영어 언어 설정에서 타자 서비스 로드 중/레이스 중 한국어가 한 글자도 보이지 않게 한다.

## 기준

- 브랜치: `fix/typing-en-no-hangul-flash-20260619`
- 기준 브랜치: `origin/main`
- 검증: Playwright MutationObserver 한글 검출, 실제 방 생성/시작/입력, web lint/typecheck, parity

## 발견

- 최종 화면 중심 검증은 통과했지만, 로드 직후 SSR/초기 hydration 시 한국어 기본 UI가 짧게 노출된다.
- 영어 레이스 시작 후 음성통화 패널 문구가 한국어로 남는다.
- 영어 자유 연습에서 기본 덱 설명과 기본 문장이 한국어로 남을 수 있다.
- head metadata 검사까지 확대하자 root site OpenGraph/Twitter 기본값의 한국어가 타자 서비스 하위 페이지에 상속되는 것을 확인했다.
- `/typing-service/territory` 직접 진입 fallback과 점령전 플레이 화면에 한국어 raw 문자열이 남아 있었다.

## 진행

- `typing-service`, `validate` 스킬을 확인했다. `validate` wrapper의 SSOT 파일은 현재 저장소에 없어 실제 `package.json` 스크립트 기준으로 검증한다.
- 루트 `yeon` main을 `origin/main`으로 최신화하고 Playwright로 현재 상태를 재검증했다.
- `typing-service` layout에서 settings hydration 전 locale 의존 children을 렌더링하지 않도록 막았다.
- 음성통화 패널/상태 메시지를 label/message override 구조로 바꾸고 영어 문구를 연결했다.
- 타자 서비스 하위 페이지 metadata helper를 추가해 OpenGraph/Twitter meta까지 영어 기본값으로 덮어쓰게 했다.
- 점령전 gate/result/board/game 화면의 사용자 노출 문자열을 locale label로 분리했다.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- Playwright: 영어 설정에서 body/title/meta/jsonld MutationObserver 한글 검출 0건
- Playwright: `/typing-service/practice` 실제 입력 후 한글 검출 0건
- Playwright: 표준방 생성 → 입장 → 레이스 시작 → 입력 흐름 한글 검출 0건
