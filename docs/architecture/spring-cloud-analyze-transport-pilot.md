# spring-cloud-analyze-transport pilot

## 목적
- cloud analyze route가 직접 들고 있던 provider token/download 의존을 제거한다.
- draft lifecycle, analyzeBuffer, SSE는 아직 Next에 남기고 transport만 Spring browser endpoint로 전환한다.

## 범위
- `/api/v1/integrations/googledrive/analyze`
- `/api/v1/integrations/onedrive/analyze`

## 결과
- route layer direct `googledrive-service` / `onedrive-service` 제거
- route는 Spring browser client를 통해 파일 바이트만 확보
- Spring error는 `ServiceError`로 변환해 기존 shared analyze flow와 연결
