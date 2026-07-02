# 오류 응답 메타데이터 계약 확장

- 시작: 10:34
- 종료: 10:48
- 작업자: Codex
- 브랜치: `fix/error-response-metadata-contract`

## 목표

Yeon REST 오류 응답을 `code/message`뿐 아니라 `requestId`, `details`, 상태 메타데이터, 객체형 `actionGuide`까지 담는 공통 계약으로 확장한다.

## 범위

- `packages/api-contract/src/error.ts`
- `apps/backend/src/main/java/world/yeon/backend/common/error/*`
- REST request id 필터
- 카드/타자 유지보수 대상의 로컬 오류 응답 타입
- 관련 계약/백엔드 테스트

## 진행

- [x] 현행 공통 핸들러, DTO, Zod 계약 확인
- [x] 카드/타자/community 로컬 오류 핸들러 범위 확인
- [x] 공통 오류 계약 확장 구현
- [x] 테스트 및 타입 검증
- [ ] PR 생성 및 main 병합

## 검증

- `pnpm --filter @yeon/api-contract test`
- `pnpm typecheck:api-contract`
- `pnpm --filter @yeon/api-contract lint`
- `pnpm --filter @yeon/api-client typecheck`
- `pnpm typecheck:web`
- `pnpm typecheck:mobile`
- `./gradlew test --tests world.yeon.backend.common.error.GlobalApiExceptionHandlerTests --tests world.yeon.backend.card_decks.assets.controller.CardDeckAssetControllerTests --tests world.yeon.backend.card_decks.route.controller.CardDeckRouteControllerTests --tests world.yeon.backend.typing_decks.controller.TypingDeckControllerTests --tests world.yeon.backend.typing_character_frames.controller.TypingCharacterFrameControllerTests`
- `GRADLE_USER_HOME=/tmp/yeon-gradle-home ./gradlew --no-daemon test`
- `git diff --check`

## 메모

- 기본 `./gradlew test`는 다른 워크스페이스(`/Users/osuma/coding_stuffs/dailyting-3`) Gradle 작업의 stop 명령과 같은 사용자 Gradle 데몬을 공유해 중단됐다. 격리 Gradle 홈으로 재실행해 전체 백엔드 테스트 성공을 확인했다.
