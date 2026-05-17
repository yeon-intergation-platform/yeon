# 카드방 운영 compose 런타임 연결 복구 백로그 (2026-05-18)

## 1차: 운영/개발 compose race-server backend 연결 환경 전달

- 작업내용
  - `compose.prod.yml`과 `compose.dev.yml`의 `race-server` 서비스에 backend 내부 URL과 internal token을 전달한다.
  - 카드방 race-server가 컨테이너 내부 기본값 `127.0.0.1:8081`로 자기 자신을 조회하지 않고 compose network의 `backend:8081`을 보게 한다.
- 논의 필요
  - 없음. 카드방 상태의 source of truth는 Spring backend이고, race-server는 해당 backend를 호출해야 한다.
- 선택지
  1. 운영 서버 `.env`에 `SPRING_BACKEND_BASE_URL`을 추가해 수동 관리한다.
  2. compose 파일에서 web과 동일하게 `http://backend:8081`을 race-server에 직접 주입한다.
  3. race-server 코드 기본값을 운영용으로 바꾼다.
- 추천
  - 2번. compose 내부 서비스명은 배포 토폴로지의 SSOT이고, `.env`에 중복 값을 추가하지 않아도 된다.
- 사용자 방향
  - 추천 기준으로 진행.
