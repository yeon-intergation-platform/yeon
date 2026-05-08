# space-templates read controller cycle

- 작업 목표: 차수 C controller skeleton + contract tests
- 작업 범위: response wrapper DTO, controller, controller tests
- 기준: internal contract `/space-templates*` 구현, header required 확인
- 비목표: Next BFF fetch 전환, write API

## 재발방지 메모

- 내부 Spring contract와 outward Next contract를 구분한다.
- response wrapper(`templates`, `template`)를 controller 단계에서 명시적으로 유지한다.
- Spring Boot 4에서는 MVC test slice import 경로가
  `org.springframework.boot.test.autoconfigure.web.servlet.*`가 아니라
  `org.springframework.boot.webmvc.test.autoconfigure.*`일 수 있으니 먼저 실제 jar 기준으로 확인한다.
- import만 바꾸지 말고 해당 test slice 모듈(`spring-boot-webmvc-test`)이
  실제 test classpath에 포함됐는지도 같이 확인한다.
- controller contract test 단계에서 아직 auth 통합이 목표가 아니면
  `SecurityConfig`를 억지로 slice에 주입하지 않는다. `HttpSecurity` bean 누락으로 테스트 목적과 무관한 실패가 생긴다.
- controller가 `jdbc` 전용 service에 의존하면 controller 자체도 같은 `@Profile(\"jdbc\")`로 묶어
  base profile `contextLoads`를 깨지 않게 한다.
