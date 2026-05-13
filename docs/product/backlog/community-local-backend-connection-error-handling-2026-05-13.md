# 커뮤니티/Spring 연동 에러 처리 보강

## 차수 1

- 작업내용
  - `localhost:3000`에서 Spring 백엔드가 내려가 있거나 포트가 어긋난 경우에도 커뮤니티 연동 오류가 언체크 예외로 전파되지 않도록 Spring fetch 유틸에서 네트워크 실패를 커스텀 오류로 래핑.
  - `CommunityPresenceTracker` heartbeat 호출 실패를 UI에서 차단하여 `unhandledRejection` 스팸 로그를 방지.
  - `/api/v1/community-chat/messages`, `/api/v1/chat-service/feed`의 백엔드 연결 실패는 이제 503 계열로 반환되어 사용자에게 명시 메시지로 노출.

- 논의 필요
  - 백엔드 미가동 구간에서 채팅/피드 데이터를 빈 배열로 대체할지 여부.

- 선택지
  - A) 실패를 503으로 노출(현재)
  - B) 실패 시 빈 데이터 fallback

- 추천
  - A (원인 파악이 빠르고 명시적 안내)

- 사용자 방향
  - 추천 적용
