# 게임 플레이 BFF 경계 테스트

## 1차

작업내용: `/api/v1/game-service/play` BFF route의 인증, 입력 검증, Spring 호출 실패 처리 경계를 테스트로 고정한다.

논의 필요: 없음. 기능 변경 없이 기존 동작을 테스트로 고정하는 작업이다.

선택지:

- A. route unit test만 추가해 비로그인 204, 잘못된 JSON 400, slug 검증 400, 성공 호출, Spring 실패 swallow를 확인한다.
- B. Playwright로 실제 상세 화면 클릭까지 확인한다.

추천: A. 장애/운영 누락 감소 목적에는 route 경계 테스트가 빠르고 직접적이다. Playwright는 UI 변경이 있을 때 별도 수행한다.

사용자 방향: 추천 기준으로 진행한다.
