# 카드방 재감사 + karate 흐름 테스트

작성일: 2026-06-03

## 배경

전수 감사 후속(Wave A/B)에서 card-rooms가 크게 바뀌었다(status 모델 분리, 역할 검증, IDOR, N+1 완화). 그러나 기존 karate `card-rooms.feature`는 생성/상세/목록/입장만 검증하고, **새 라이프사이클(start→in_progress, reveal, results, next→finished)과 정책 가드를 전혀 커버하지 않는다**. 회귀가 숨을 수 있는 핵심 영역이다.

## 1차: 재감사 + karate 라이프사이클 흐름 추가

### 작업내용

- card-rooms 서비스/리포지토리/도메인/계약/마이그레이션 집중 재감사(읽기 전용).
- 검증된 안전 결함만 수정, 나머지는 보고.
- `card-rooms.feature`에 전체 라이프사이클 + 상태 모델 가드 시나리오 추가(start 역할/준비 검증, finding 20 회귀방지(미확정 카드 next 차단), reveal이 status 유지+플래그만, 결과 역할 제약, next 진행/플래그 리셋, finished 종료).

### 재감사 결과 요약

- **반영(검증된 안전 수정)**: m3 — `next()`가 `listCards`를 2회 호출하던 중복 제거(같은 락 구간, 동작 불변).
- **보고만(설계 판단/위험)**:
  - C2/C3(카드당 결과 유일성): `submitResult`가 방 행 `FOR UPDATE` 락으로 직렬화되어 `existsResultForCard` 중복차단이 사실상 race-safe. `(room_id,card_id)` UNIQUE는 방어용 defense-in-depth일 뿐 능동 버그 아님. 기존 prod 중복 시 마이그레이션 실패 위험이 있어 보류(권고: 무중단 UNIQUE INDEX 검토).
  - C1(게스트 leave 식별 경계): `X-Yeon-Guest-Id` 누락 시 본인 게스트도 leave 불가 가능. race-server 프록시 호출부 점검 필요.
  - M1/M3(FINISHED 방 재시작/변경 불가): 일관적이나 제품 의도 확인 필요.
  - m1(currentCardResult raw String 노출), m2(status/result CHECK 제약 부재): 방어용 권고.

### 논의 필요

- C1/C3/M-series는 제품·운영 판단 또는 무중단 마이그레이션 설계가 필요해 별도 차수로 분리.

### 선택지

1. karate 흐름 추가 + m3만 수정, 나머지 보고 — 추천
2. C3 UNIQUE 제약까지 이번에 포함
3. 흐름 테스트만, 코드 수정 0

### 추천

선택지 1. 회귀 가드(karate 흐름)와 무위험 수정(m3)만 반영하고, 스키마/설계 판단이 필요한 항목은 근거와 함께 보고한다.

### 사용자 방향

"진행해"(카드방 재감사+karate 흐름) → 선택지 1.
