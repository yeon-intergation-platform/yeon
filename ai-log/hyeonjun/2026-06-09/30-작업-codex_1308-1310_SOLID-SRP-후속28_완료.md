# SOLID SRP 후속 28 — 타자 덱 저장소 row mapper 분리

## 목표

- 백로그 항목 182를 완료한다.
- `TypingDeckRepository`의 SQL 실행 책임과 native row 조립 책임을 분리한다.

## 변경

- `TypingDeckRowMapper` Spring 컴포넌트를 추가한다.
- `TypingDeckRow`, `TypingDeckListRow`, `TypingDeckPassageRow` 조립 로직을 mapper로 이동한다.
- `TypingDeckRepository`는 query 생성, parameter binding, DB 호출에 집중한다.
- 백로그에 28차 완료 섹션과 항목 182 완료 표시를 추가한다.

## 검증 예정

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- `git diff --check`
- 구조 증거 스크립트

## 검증 완료

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'` — 통과
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'` — 통과
- `git diff --check` — 통과
- 구조 증거 스크립트 — 통과 (`completed_count 165`, 다음 미완료 183)

## 결과

- 항목 182 완료.
- `TypingDeckRepository`는 SQL/파라미터/DB 접근에 집중하고, native row 변환은 `TypingDeckRowMapper`가 담당한다.
