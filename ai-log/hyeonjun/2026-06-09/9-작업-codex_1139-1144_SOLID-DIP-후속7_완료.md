# SOLID/예외 원칙 후속 7차

## 목표

- 300개 백로그 중 항목 59를 실제 코드 개선으로 줄인다.
- `TypingDeckService`의 Spring 주입 경계를 명확히 하고 테스트 편의 생성 책임을 분리한다.

## 범위

- `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java`
- `apps/backend/src/test/java/world/yeon/backend/typing_decks/service/TypingDeckServiceTests.java`
- 백로그 항목 59

## 진행

- `yeon-2`를 최신 `origin/main`으로 재설정하고 `codex/solid-exception-followup-7` 브랜치 생성.
- 운영 Spring bean 생성자를 단일 public 생성자로 만들고 `@Autowired`를 제거했다.
- 테스트 편의용 기본 signer 구성은 `createForTest` 정적 팩토리로 옮겨 운영 DI 책임과 테스트 구성 책임을 분리했다.
- 백로그 항목 59를 완료 처리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- `git diff --check`
- 백로그 300개 유지 및 항목 59 완료 검증 스크립트

## 결과

- `TypingDeckService`가 Spring 운영 경로에서 단일 public 생성자 기반 DI를 사용하게 되어 생성자 선택 모호성과 `@Autowired` 직접 의존을 줄였다.
