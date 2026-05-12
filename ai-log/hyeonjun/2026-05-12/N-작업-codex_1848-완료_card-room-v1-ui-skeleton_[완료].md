# 카드방 v1 화면 정의서 + UI 골격

## 목표
- 카드방 v1 공식 화면 정의서를 추가한다.
- `/card-service`를 카드방 중심 홈으로 전환하고 기존 덱 목록은 `/card-service/decks`로 분리한다.
- 카드방 로비/생성/학습 화면 골격을 실시간 서버 없이 구현한다.
- 사용자 추가 요청에 따라 카드방도 타자방처럼 캐릭터 선택/표시를 지원한다.

## 변경
- `docs/product/card-room-v1-screen-definition.md` 추가.
- `docs/product/backlog/card-room-v1-ui-skeleton-20260512.md` 추가.
- `/card-service` 홈을 캐릭터 선택 + 카드방 입장 / 내 덱 보기 / 새 덱 만들기 CTA 구조로 변경.
- 기존 덱 목록 UX를 `CardServiceDecksScreen`으로 분리하고 `/card-service/decks`에 연결.
- `/card-service/rooms`, `/card-service/rooms/new`, `/card-service/rooms/[roomId]` 화면 골격 추가.
- 카드방 학습 화면에 `MEMORIZER`/`CHECKER`, `ANSWERING`/`PASSED`/`GIVEN_UP`/`FINISHED`, `OK`/`GIVE_UP` 로컬 상태 모델 추가.
- 타자 서비스 캐릭터 레지스트리/프로필 UI를 재사용해 카드방 홈/로비/생성/학습 화면에 캐릭터를 표시.

## 제외
- Spring/race-server/API 저장/실시간 채팅/참가자 캐릭터 동기화는 후속 차수.

## 검증
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
