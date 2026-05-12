# Docker workflow stale run 배포/검증 정합성 백로그 (2026-05-13)

## 배경

Docker workflow에서 오래된 main run이 deploy 단계까지 도달하면 이미지 build/push는 이미 성공한 상태다. 그런데 deploy 단계는 최신 main이 아니라는 이유로 skip/cancel하고, verify 단계는 같은 stale run을 실패로 처리해 "skip인데 실패"라는 모순 상태가 생긴다.

## 1차

### 작업내용

- deploy 단계까지 도달한 run은 최신 main 여부로 skip하지 않고 해당 SHA 이미지 태그를 운영에 배포한다.
- stale run이 먼저 배포되더라도 최신 main run이 이어서 성공하면 최신 이미지로 덮어쓴다.

### 논의 필요

- stale 배포가 최신 run보다 먼저 운영에 올라갈 수 있다. 다만 현재 구조상 deploy 단계에 도달했다는 것은 해당 SHA 이미지들이 이미 push된 상태이며, 최신 run이 pending이면 곧 덮어쓰는 것이 자연스럽다.

### 선택지

- A. deploy 단계의 최신 main guard를 제거하고 이미 build된 SHA 이미지를 배포한다.
- B. stale run은 cancel/skip 유지하고 verify만 success로 바꾼다.

### 추천

- 사용자 방향에 맞게 A를 적용한다.

### 사용자 방향

- "배포단계 워크플로우까지 왔다는건 이미지 이미 다 떴다는거니까 그냥 배포" 기준으로 진행한다.

## 2차

### 작업내용

- verify 단계는 stale run을 실패시키지 않고 최신 main run에 검증 책임을 넘긴다.
- 최신 main run만 build/deploy 결과 invariant를 강제한다.

### 논의 필요

- stale run이 초록색으로 끝날 수 있지만 summary에 최신 main 검증 위임을 남긴다.

### 선택지

- A. stale run이면 notice/summary 후 exit 0.
- B. stale run이면 cancelled 상태를 만들기 위해 API cancel을 호출한다.

### 추천

- 불필요한 빨간불을 없애는 A를 적용한다.

### 사용자 방향

- 추천 기준으로 진행한다.
