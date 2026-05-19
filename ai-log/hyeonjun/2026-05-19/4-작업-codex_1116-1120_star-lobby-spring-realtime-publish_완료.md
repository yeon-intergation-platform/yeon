# 4차 작업 기록 - 스타 로비 Spring 실시간 이벤트 publish 연결

## 목표

OCR/자동 조작 관측기 전에, 수동/더미 관측 입력이 Spring 저장 후 race-server 실시간 채널로 전달되는 파이프를 완성한다.

## 변경

- Spring `StarLobbyService`가 관측 저장 결과로 `room_observed`, `room_disappeared`, `alert_matched` 이벤트를 구성한다.
- `StarLobbyRealtimePublisher`를 추가해 트랜잭션 커밋 후 race-server `POST /internal/star-lobby/events`로 이벤트를 비동기 전송한다.
- race-server URL은 `STAR_LOBBY_REALTIME_EVENTS_URL`로 설정하고, 내부 토큰은 `STAR_LOBBY_INTERNAL_TOKEN` 또는 `SPRING_INTERNAL_TOKEN`을 사용한다.
- 사라진 방도 publish할 수 있도록 repository의 disappeared update가 변경된 row를 반환하게 했다.
- OCR/자동 클릭 관측기는 스크린샷 샘플 수집 전까지 범위에서 제외한다.

## 검증

- `./gradlew compileJava --rerun-tasks`
- `./gradlew test --tests '*StarLobby*' --rerun-tasks`
- `git diff --check`

## 남은 일

- 웹 `/star-lobby`에서 `star_lobby` room에 접속해 키워드 조건을 subscribe하고 토스트를 표시한다.
- 개발용 수동/더미 관측 입력 UI 또는 스크립트를 만든다.
- 실제 OCR 관측기는 스타 로비 스크린샷 샘플 수집 후 별도 검증한다.
