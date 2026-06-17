# 공개 콘텐츠 RSS 피드 추가

작성일: 2026-06-17  
대상: `support.yeon.world/feed.xml`, `news.yeon.world/feed.xml`, `blog.yeon.world/feed.xml`  
범위: 공개 콘텐츠 읽기 전용 피드. 상담 워크스페이스는 제외한다.

## 차수

### 23차: channel별 RSS 피드

작업내용:

1. `support`, `news`, `blog` channel별 RSS XML 생성 함수를 만든다.
2. 각 channel 내부 route `/support/feed.xml`, `/news/feed.xml`, `/blog/feed.xml`을 추가한다.
3. 서브도메인에서 `/feed.xml` 접근 시 각 channel 내부 route로 rewrite되도록 예외를 조정한다.
4. RSS item에는 title, link, guid, description, pubDate를 넣는다.
5. 공개 발행 글만 피드에 포함한다.
6. XML escaping을 테스트한다.

논의 필요:

- Atom과 JSON Feed까지 동시에 제공할지.

선택지:

- RSS만, RSS+Atom, RSS+Atom+JSON Feed.

추천:

- 초기에는 RSS만 제공하고, 실제 구독 수요가 생기면 Atom/JSON Feed를 추가한다.

사용자 방향:

- 비어 있으면 추천 기준으로 진행한다.
