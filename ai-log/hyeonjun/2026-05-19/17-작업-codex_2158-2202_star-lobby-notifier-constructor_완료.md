# 17 작업 codex 2158-2202 star-lobby-notifier-constructor 완료

## 원인

- `StarLobbyDiscordWebhookNotifier`에 운영용 public 생성자와 테스트용 package-private 생성자가 함께 있었다.
- Spring 7 운영 런타임에서 생성자 후보가 명시되지 않아 기본 생성자 인스턴스화 경로로 빠졌고, 기본 생성자가 없어 backend preflight가 실패했다.

## 수정

- 운영용 `StarLobbyDiscordWebhookNotifier(ObjectMapper objectMapper)` 생성자에 `@Autowired`를 명시했다.
- 테스트용 `StarLobbyDiscordWebhookNotifier(HttpClient, ObjectMapper)` 생성자는 package-private로 유지했다.

## 검증

- `./gradlew test --tests '*StarLobby*'`
- `./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- `git diff --check`

## 재발 방지

- `docs/agent-rules/server-services.md`에 Spring bean 생성자가 둘 이상이면 운영 생성자에 `@Autowired`를 명시해야 한다는 규칙을 추가했다.
- `StarLobbySpringContextTests`를 추가해 `./gradlew test --tests '*StarLobby*'`에도 Spring ApplicationContext 부팅 검증이 포함되게 했다.
