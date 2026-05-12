# public check cookie BFF boundary cleanup

## 1차

### 작업내용
- public-check route가 `server/services/public-check-device-cookie`를 직접 import하지 않도록 BFF cookie helper로 분리한다.
- remembered identity cookie 서명/검증/설정은 브라우저 쿠키 bridge 책임으로 유지한다.
- public-check session/submit/verify route 테스트 mock 경로를 새 helper로 갱신한다.

### 논의 필요
- 이 쿠키는 DB/비즈니스 상태 원천이 아니라 기기 기억용 signed cookie bridge이므로 Spring 이관 대상이라기보다 Next BFF 경계로 명명한다.

### 선택지
1. helper를 `server/public-check-device-cookie-bff.ts`로 옮기고 기존 service 파일은 호환 re-export로 축소한다.
2. Spring에 remembered identity cookie 서명까지 맡긴다.

### 추천
- 1번. HTTP cookie 설정은 Next response bridge와 강하게 결합되어 있어 BFF helper로 명확히 남기는 것이 작고 안전하다.

### 사용자 방향
- 추천 기준으로 진행한다.
