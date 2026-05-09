# spring backend ci/cd dev prod

## 1차

- 작업내용: `apps/backend` Spring Boot를 Docker/compose/GitHub Actions 배포선에 포함해 `develop -> dev 서버`, `main -> 운영 서버` 자동 배포 구조를 현재 저장소 기준으로 복구·정렬한다.
- 논의 필요: backend 이미지를 web/race-server와 동일 workflow에서 같이 빌드/배포할지, 분리 workflow로 둘지 결정이 필요하다.
- 선택지:
  - A. 기존 `docker-image.yml`에 backend build/publish/deploy를 통합한다.
  - B. backend 전용 workflow를 새로 분리한다.
- 추천: A. 현재도 web/race-server가 하나의 compose deploy로 묶여 있어 backend를 같은 workflow에 포함하는 편이 branch별 dev/prod compose 배포와 가장 일관되고 운영 복잡도가 낮다.
- 사용자 방향: A
