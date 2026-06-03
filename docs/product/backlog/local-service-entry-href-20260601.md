# 로컬 서비스 진입 링크 운영 도메인 이탈 방지 백로그

## 1차: localhost 포털에서 서비스 카드가 운영 subdomain으로 이동하지 않게 수정

- 작업내용
  - 루트 포털 서비스 카드의 클릭 URL을 현재 요청 host 기준으로 결정한다.
  - 운영 canonical host에서는 기존 subdomain 공개 URL을 유지한다.
  - localhost, 127.0.0.1, dev host에서는 내부 path URL(`/typing-service`, `/card-service`, `/community`)을 사용한다.
  - 관련 단위 테스트와 Playwright 검증을 추가/수행한다.
- 논의 필요
  - dev.yeon.world에서도 subdomain canonical으로 보낼지, dev host 내부 path로 유지할지 여부.
- 선택지
  - A. 운영 apex/root host에서만 subdomain으로 보내고 그 외 host는 내부 path를 쓴다.
  - B. 모든 host에서 subdomain으로 보낸다.
- 추천
  - A. 로컬 디버깅과 dev 환경에서 운영 서버로 이탈하는 일을 막는다.
- 사용자 방향
