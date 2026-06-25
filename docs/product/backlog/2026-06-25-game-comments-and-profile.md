# 게임 댓글 + 프로필 등록

## 배경

게임 상세 하단에 댓글 기능을 단다. 요구사항:

- 로그인 사용자: 닉네임/비번 없이 바로 댓글(세션의 display_name·avatar_url 사용).
- 비로그인 게스트: 닉네임 + 비밀번호를 정해 댓글(클래식 한국형 BBS 방식).
- 비밀댓글(체크박스): 작성자 + 운영자만 열람, 게스트는 비밀번호로 확인.
- 프로필 사진 표시. 동시에 프로필 등록(닉네임·사진 업로드) 기능 구현.

## 확정 사항(사용자)

- 프로필 사진 = **R2 파일 업로드**(card_decks 에셋 저장소 패턴 재사용).
- 비밀댓글 공개 = **작성자 + 운영자**(게스트는 비번 확인).
- 프로필 등록 = **root 계정 갱신**(display_name·avatar_url) + /profile 페이지.

## 아키텍처(기존 패턴)

- 영속성/도메인 = Spring(`apps/backend`). 웹은 BFF만(AGENTS 규칙).
- 웹 BFF는 항상 **내부 토큰**(X-Yeon-Internal-Token, ROLE_INTERNAL)으로 Spring 호출 →
  `.authenticated()` 충족. 사용자 정체성은 별도 헤더로 전달(X-Yeon-Chat-Profile-Id 선례).
- DB 접근 = EntityManager 네이티브 쿼리(record row). Flyway 마이그레이션(현재 V16 → V17).
- 현재 사용자 = 웹 `getCurrentAuthUser()`(id/email/displayName/avatarUrl). 관리자 = `isAdminUser`.
- R2 = `CardDeckAssetStorage`(put/read + 로컬 폴백).

## 1차 — 게임 댓글 (이 차수에서 완료)

작업내용:

- DB: `V17__create_game_service_comments.sql` — game_service_comments(id, game_slug,
  author_user_id null, display_name, avatar_url null, guest_password_hash null, content,
  is_secret, created_at, deleted_at). index(game_slug, created_at desc).
- 백엔드 슬라이스 `game_service_comments`: controller/service/repository/dto.
  - GET `/game-service/comments?gameSlug=` (헤더 X-Yeon-User-Id, X-Yeon-User-Role).
  - POST `/game-service/comments` (헤더 X-Yeon-User-Id/Name/Avatar, body content/isSecret/guestNickname/guestPassword).
  - POST `/game-service/comments/{id}/reveal` (body password) — 게스트 비밀댓글 확인.
  - DELETE `/game-service/comments/{id}` (헤더 사용자/관리자 + ?password=).
  - 게스트 비번 = BCrypt. 비밀댓글 마스킹: 작성자(userId)·관리자 외엔 content=null + canRevealWithPassword.
- 계약 `packages/api-contract/src/game-comment.ts` + index export.
- 웹 BFF: `server/game-comments-spring-client.ts` + api route(list/create/reveal/delete).
- 웹 UI: `features/game-service/game-comments.tsx`(목록+폼, 비밀 체크박스, 게스트 닉/비번) →
  `game-detail.tsx` 하단에 삽입. 아바타 표시(로그인=세션 avatar, 게스트=기본 아바타).

논의 필요: 게스트 식별 지속성(쿠키) — 1차는 미적용(게스트는 비번으로만 삭제/열람).
추천: 위 설계대로. 사용자 방향: 동일.

## 2차 — 프로필 등록 (이어서)

작업내용:

- 백엔드: root 사용자 display_name·avatar_url 갱신 엔드포인트 + 아바타 업로드(R2) →
  avatar_url 반환. 아바타 서빙(비공개 버킷이면 백엔드 GET 스트림).
- 계약: 프로필 갱신/업로드 스키마.
- 웹: `/profile` 페이지(닉네임 입력 + 사진 업로드 미리보기 + 저장) + BFF route.
- 댓글의 로그인 사용자 아바타가 갱신된 avatar_url로 표시됨.
