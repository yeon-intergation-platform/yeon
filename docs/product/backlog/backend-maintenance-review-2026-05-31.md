# 백엔드 유지보수 점검 보고서 (2026-05-31)

## 산출물 출처

- 요청: `이 프로젝트에 백엔드에 유지보수할 것 찾아줘. $code-review`
- 작성일: 2026-05-31
- 대상: `apps/backend`(Spring) 유지보수 대상 도메인
  - 카드(`card_decks`, `card_rooms`)
  - 타자(`typing_decks`, `typing_character_frames`)
  - 커뮤니티(`community_chat`, `chat_service_my_profile`)

---

## 1) 유지보수 우선 후보

### A. 보안/안전 우선

1. `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java`

- **이슈:** 타이핑 레이스 시드 서명 키 하드코딩 fallback (`RACE_SEED_FALLBACK_SECRET`) 사용
- **라인:** `402~407`
- **영향:** 운영에서 비밀키 미설정 시 예측 가능한 시크릿 사용될 가능성
- **권고:** 환경변수 미설정 시 fail-fast, fallback 제거 또는 테스트 전용으로 제한

### B. 데이터 일관성/경합/성능

2. `apps/backend/src/main/java/world/yeon/backend/card_rooms/repository/CardRoomRepository.java`

- **이슈:** `insertMessage`/`insertResult`가 insert 후 단건 조회가 아니라 전체 목록 조회로 반환
- **라인:** `121~124`, `136~139`
- **영향:** roomId 기준으로 상위 200개 제한 + 정렬 때문에 마지막/초과 메시지/결과 조회 실패 가능성
- **권고:** `insert ... returning` 또는 단일 insert row 조회 방식으로 변경

3. `apps/backend/src/main/java/world/yeon/backend/card_rooms/repository/CardRoomRepository.java`

- **이슈:** 공용 룸 목록 조회에서 방 단위 반복 카운트 서브쿼리 존재
- **라인:** `30~37`, `45~56`
- **영향:** 방 수 증가시 조회 성능 저하
- **권고:** 집계 조인/CTE 기반 단일 쿼리로 리팩터

4. `apps/backend/src/main/java/world/yeon/backend/chat_service_reports/repository/ChatServiceReportRepository.java`

- **이슈:** `existsById`가 동적 SQL 문자열 결합 사용 (`"select 1 from " + tableName ...`)
- **라인:** `54~56`
- **영향:** 현재는 내부 호출이긴 하나 SQL 조작 여지 관리 취약
- **권고:** 테이블명을 화이트리스트 enum으로 고정화한 다형 메서드로 치환

### C. 코드량/복잡도

5. 대형 클래스 유지보수 비용

- `typing_decks/service/TypingDeckService.java` (434줄)
- `card_rooms/service/CardRoomService.java` (380줄)
- `typing_decks/repository/TypingDeckRepository.java` (350줄)
- `typing_character_frames/repository/TypingCharacterFrameRepository.java` (99줄)
- `community_chat/repository/CommunityChatRepository.java` (71줄)

**권고:** 책임을 validator / selector / 매핑 헬퍼로 분리

---

## 2) 테스트 갭(유지보수 리스크)

| 도메인                  | 메인 소스 파일 | 테스트 파일 수 | 비고                                                           |
| ----------------------- | -------------- | -------------: | -------------------------------------------------------------- |
| card_decks              | 33             |              7 | 상대적으로 양호                                                |
| typing_decks            | 19             |              2 | 핵심 서비스/컨트롤러는 있으나 레포지토리/엣지 케이스 보강 여지 |
| card_rooms              | 24             |              1 | 서비스/레포지토리 경로 테스트가 거의 없음                      |
| typing_character_frames | 10             |              1 | repository 중심 케이스가 부족                                  |
| community_chat          | 8              |              1 | 기본 동작 테스트 존재, 예외/엣지 보완 필요                     |
| chat_service_my_profile | 11             |              1 | 컨트롤러 단위는 있으나 서비스/레포지토리 테스트 없음           |

---

## 3) 우선순위 제안 (즉시 반영)

1. **High:** 타이핑 레이스 시크릿 fallback 제거/제한 (보안)
2. **High:** CardRoom insert 후 목록 조회 방식 교체 (정합성)
3. **Medium:** 동적 SQL 문자열 조합 제거
4. **Medium:** 대형 쿼리/카운트 로직 성능 정리
5. **LOW:** 테스트 보강(도메인별)

---

## 4) 남은 작업

- 본 문서 기반으로 백로그 항목/차수 분리 후 순차 반영
- 각 항목별로 `code-review` 재실행 후 BLOCK/WATCH 재확인
