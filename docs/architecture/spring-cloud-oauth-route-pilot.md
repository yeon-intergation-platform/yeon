# spring-cloud-oauth-route pilot

## 목적
- cloud auth start/callback route의 direct oauth URL 생성 / code exchange / token save 의존을 제거한다.
- cookie state/user 관리와 redirect 응답은 Next에 남기고, 실제 oauth logic은 Spring internal endpoint로 이동한다.

## 범위
- `/api/v1/integrations/googledrive/auth`
- `/api/v1/integrations/googledrive/auth/callback`
- `/api/v1/integrations/onedrive/auth`
- `/api/v1/integrations/onedrive/auth/callback`

## 결과
- route layer direct `googledrive-service` / `onedrive-service` 제거
- oauth url 생성, code exchange, token save를 Spring 이동
- Next callback은 state 검증 + redirect only 역할로 축소
