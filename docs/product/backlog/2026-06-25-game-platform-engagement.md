# 게임 플랫폼 인게이지먼트 로드맵 (좋아요·찜·게임추가·댓글강화)

사용자가 4가지 모두 선택. 가치순으로 단계 배포한다.

## 1차 — 좋아요 + 실제 인기순 랭킹 (이 차수)

작업내용:

- DB `V18__create_game_service_likes.sql`: game_service_likes(id, game_slug, user_id,
  created_at, unique(game_slug, user_id)). 어뷰징 방지로 **로그인 사용자만** 좋아요.
- 백엔드 슬라이스 game_service_likes(controller/service/repository/dto):
  - GET `/game-service/likes?gameSlug=` (헤더 X-Yeon-User-Id 선택) → {count, liked}
  - POST `/game-service/likes` (로그인 필요) → 토글 → {count, liked}
  - GET `/game-service/likes/ranking?limit=` → 좋아요 수 내림차순.
- 계약 @yeon/api-contract/game-like + index/exports/subpath.
- 웹 BFF: game-likes-spring-client + /api/v1/game-service/likes(GET/POST).
- 웹 UI: GameLikeButton(하트+카운트, 토글, 비로그인 안내) → 게임 상세 헤더.
- **인기 게임 섹션을 좋아요 랭킹으로 정렬**(landing). 0/동률은 큐레이션 순서 유지.

추천: 위 설계. 사용자 방향: 동일.

## 2차 — 찜(즐겨찾기) + 최근 플레이

- 찜: game_service_favorites(user_id, game_slug). 로그인 사용자 개인 컬렉션.
- 최근 플레이: 기존 /play 적립 시 play history 기록 → "내 게임" 모음.
- 웹: 마이페이지/홈에 "찜한 게임", "최근 플레이" 섹션.

## 3차 — 게임 추가(허락 불필요)

- GameMonetize 피드 큐레이션 확대(임베드 합법).
- CC0/오픈소스 HTML5 게임 셀프호스트(라이선스 명확한 것만). Flash 추가는 제외(허락 필요).

## 4차 — 댓글 강화

- 댓글 좋아요/답글(parent_id), "내가 쓴 댓글", 정렬(최신/인기).
