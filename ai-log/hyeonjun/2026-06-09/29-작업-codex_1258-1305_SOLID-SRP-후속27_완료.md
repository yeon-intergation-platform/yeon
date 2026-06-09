# SOLID SRP 후속 27 — 인증 세션 발급 책임 분리

## 목표

- 백로그 항목 181을 완료한다.
- `AuthSessionService`의 세션 발급/출석 경험치 side effect 책임을 분리해 SRP를 강화한다.

## 변경

- `AuthSessionIssuer` Spring 서비스를 추가한다.
- 세션 토큰 생성, 만료시각 계산, 세션 저장, 출석 경험치 적립을 issuer로 이동한다.
- `AuthSessionService`는 인증 유스케이스 흐름에서 `sessionIssuer.createSession`만 호출하도록 정리한다.
- `AuthSessionTokenGenerator` 포트를 추가해 `root_auth`가 `credential_auth` concrete factory에 의존하지 않게 한다.
- 백로그에 27차 완료 섹션과 항목 181 완료 표시를 추가한다.

## 검증 예정

- `cd apps/backend && ./gradlew test --tests '*Auth*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- `git diff --check`
- 구조 증거 스크립트

## 검증 완료

- `cd apps/backend && ./gradlew test --tests '*Auth*'` — 통과
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'` — 통과
- `git diff --check` — 통과
- 구조 증거 스크립트 — 통과 (`completed_count 164`, 다음 미완료 182)

## 결과

- 항목 181 완료.
- 인증 세션 발급 책임과 token generator 포트를 분리해 SRP/DIP 및 ArchUnit 순환 의존 baseline을 개선했다.
