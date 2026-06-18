# Design Screenshot Evidence

UI나 디자인이 사용자에게 보이는 방식으로 바뀌는 작업은 말로만 완료 보고하지 않는다. 실제 브라우저 화면을 남겨서 어디가 어떻게 바뀌었는지 추적 가능하게 만든다.

## 적용 대상

- `apps/web`, `apps/mobile`, `packages/*ui*`, 디자인 토큰, CSS, Tailwind class, 레이아웃, 카피 위치, 상태 표시, 모달, 폼, 카드, 목록, 빈 상태, 에러 상태, 로딩 상태처럼 화면 결과가 바뀌는 변경.
- 백엔드 전용, 테스트 전용, 문서 전용, CI 설정 전용 변경은 제외한다. 단, 그 변경이 화면 상태를 의도적으로 바꾸면 적용한다.

## 저장 위치

- 작업 로그와 같은 날짜 아래에 스크린샷 폴더를 만든다.
- 기본 경로: `ai-log/hyeonjun/YYYY-MM-DD/<task-slug>-screenshots/`
- 여러 에이전트가 동시에 작업하면 자신의 작업 로그가 있는 날짜/주제 폴더를 사용한다.

## 캡처 기준

- 기존 화면을 바꾸면 가능한 한 `before`와 `after`를 모두 남긴다.
- 신규 화면은 `after`만 허용하되, 진입 경로와 핵심 상태를 같이 남긴다.
- 영향을 받은 route/screen마다 desktop과 mobile viewport를 우선 캡처한다.
- 변경된 상태가 따로 있으면 함께 남긴다: empty, loading, error, disabled, hover/focus, modal open, form validation, submitted, authenticated, guest.
- Playwright 실제 브라우저 기준으로 캡처한다. 모바일 앱 작업은 사용 가능한 Expo/시뮬레이터/웹 미러링 증거 중 가장 직접적인 화면을 남긴다.

## 파일 이름

파일명만 보고 비교할 수 있게 `before|after`, 화면, 상태, viewport를 넣는다.

```text
before-platform-home-live-badge-desktop.png
after-platform-home-live-badge-desktop.png
after-card-detail-empty-mobile.png
after-community-chat-error-mobile.png
```

## 작업 로그와 PR에 남길 내용

- 스크린샷 폴더 경로.
- 캡처한 route/screen, 상태, viewport.
- 눈으로 확인한 변경점.
- 캡처하지 못한 화면이 있으면 정확한 이유와 대체 증거.

## 완료 조건

UI/디자인 변경은 아래 중 하나가 없으면 완료로 보고하지 않는다.

- before/after 스크린샷과 Playwright 확인 결과.
- 신규 화면의 after 스크린샷과 진입 경로 확인 결과.
- 캡처 불가 사유와 그에 준하는 대체 시각 증거.
