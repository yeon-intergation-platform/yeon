# 타자방 새 라운드 결과 상태 초기화

## 1차

- 작업내용: 타자방에서 한 판 종료 후 대기실 복귀/다시 시작 시 이전 결과 화면이 남는 문제를 해결한다. `roomSnapshot.results`를 방 상태의 결과 SSOT로 삼고, COUNTDOWN 진입 시 멀티플레이 입력/완료 플래그를 초기화한다.
- 논의 필요: 장기적으로 서버가 별도 `RACE_RESET` 이벤트를 내려 클라이언트 로컬 상태를 명시적으로 초기화할지 여부.
- 선택지:
  - A. 기존 서버 snapshot 계약 안에서 클라이언트 fallback과 로컬 완료 상태만 정리한다.
  - B. race-server와 race-shared 프로토콜에 reset 이벤트를 추가한다.
- 추천: A. 서버는 새 시작 시 이미 빈 results snapshot과 participant reset 상태를 내려주므로, 현재 회귀는 클라이언트의 stale fallback 제거만으로 작게 해결할 수 있다.
- 사용자 방향: A
