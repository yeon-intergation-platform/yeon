# SOLID SRP 후속 29 — 타자 덱 서비스 응답 매핑 분리

## 목표

- 백로그 항목 183을 완료한다.
- `TypingDeckService`의 유스케이스 책임과 응답 DTO 조립 책임을 분리한다.

## 변경

- `TypingDeckResponseMapper` Spring 컴포넌트를 추가한다.
- `TypingDeckDto`/`TypingDeckPassageDto` 조립과 ISO 시간 변환을 mapper로 이동한다.
- `TypingDeckService`는 권한 검증, 입력 정규화, 저장소 호출, seed 생성 흐름에 집중한다.
- 백로그에 29차 완료 섹션과 항목 183 완료 표시를 추가한다.

## 검증 예정

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- `git diff --check`
- 구조 증거 스크립트

## 검증 완료

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'` — 통과
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'` — 통과
- `git diff --check` — 통과
- 구조 증거 스크립트 — 통과 (`completed_count 166`, 다음 미완료 184)

## 결과

- 항목 183 완료.
- `TypingDeckService`는 유스케이스/권한/저장소 호출 흐름에 집중하고, 응답 DTO 조립은 `TypingDeckResponseMapper`가 담당한다.
