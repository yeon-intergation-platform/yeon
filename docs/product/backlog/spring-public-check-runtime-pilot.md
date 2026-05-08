# spring public-check runtime pilot

## 작업내용
- 공개 체크인 flow의 `GET /public-check-sessions/{token}` / `POST verify` / `POST submit`를 Spring으로 이동한다.
- Next route는 cookie bridge + thin BFF 역할만 남긴다.
- 공개 체크인 submit이 직접 student-board snapshot/history를 쓰는 로직도 Spring으로 이동한다.

## 논의 필요
- remembered identity cookie는 Next에 남겨둘지.

## 선택지
1. cookie는 Next, runtime 판단/DB write는 Spring
2. cookie까지 Spring으로 이동

## 추천
- 1. cookie는 Next 유지
- 이유: 브라우저 response cookie 조작은 Next route가 맡고, backend source of truth와 state transition만 Spring으로 이동하는 편이 작고 안전하다.

## 사용자 방향
- 추천 기준으로 진행
