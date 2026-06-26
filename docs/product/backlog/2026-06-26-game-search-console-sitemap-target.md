# 게임 허브 Search Console sitemap 제출 대상 정합성

## 1차

작업내용: `game.yeon.world` 운영 sitemap에는 게임 상세 URL이 포함되어 있으므로, Search Console sitemap 제출 대상 문서와 자동화 스크립트에도 게임 호스트를 추가한다.

논의 필요: 실제 Search Console API 제출은 Google credential이 필요하므로 이번 작업에서 실행 가능한지 여부.

선택지:

- A. 문서와 제출 스크립트 대상만 즉시 정합화하고, 실제 제출은 credential 준비 후 실행한다.
- B. credential까지 확인한 뒤 실제 제출까지 한 번에 처리한다.

추천: A. 현재 세션에서 확인 가능한 것은 운영 sitemap과 저장소 설정이며, credential 값은 노출하거나 가정하지 않는다.

사용자 방향: 추천 기준으로 진행한다.
