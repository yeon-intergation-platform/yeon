### 작업 내역 (2026-05-13)

- 차수: 타자방 대기시간 통일
  - 작업내용: `타자방(로비)` 시작 카운트다운을 10초로 변경하여 타자방/일반 레이스 시작 대기시간 통일
  - 논의 필요: 없음
  - 선택지: roomCountdownSeconds 값을 10으로 상향 또는 방 진입 모드별 예외 처리 추가
  - 추천: 전역 기본값인 roomCountdownSeconds를 10으로 상향
  - 사용자 방향: 추천 적용

- 대상 파일: packages/race-shared/src/typing-race.ts
