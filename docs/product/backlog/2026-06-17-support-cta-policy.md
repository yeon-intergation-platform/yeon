# Support 하단 CTA 정책

## 8차: 공개 콘텐츠 support CTA 보강

논의 필요: support 문서의 하단 CTA를 관련 문서 이동으로 둘지, 서비스 진입으로 통일할지.  
선택지: 관련 문서 CTA, 서비스별 진입 CTA, 글마다 수동 지정.  
추천: 본문과 related articles는 관련 문서 탐색을 맡기고, 하단 CTA는 서비스별 다음 행동으로 통일한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. support 문서의 CTA 목표값을 서비스별 상수로 고정한다.
2. NEXA support 글의 하단 CTA는 Discord AI 설치 페이지로 통일한다.
3. typing support 글의 하단 CTA는 `typing.yeon.world`로 통일한다.
4. card support 글의 하단 CTA는 `card.yeon.world`로 통일한다.
5. community support 글의 하단 CTA는 `community.yeon.world`로 통일한다.
6. account/policy 글은 서비스 실행 CTA 대상에서 제외한다.
7. 공개 콘텐츠 audit에서 support CTA 정책을 검증한다.
8. 단위 테스트로 registry의 support CTA가 정책과 같은지 확인한다.

진행 결과: 완료. support article 하단 CTA는 서비스별 목표값으로 고정했고, audit와 단위 테스트가 NEXA/typing/card/community CTA 정책을 검증한다.
