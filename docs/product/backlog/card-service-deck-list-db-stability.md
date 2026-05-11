# card-service deck list db stability

## 1차

- 작업내용: 카드서비스 인증 사용자 덱 목록 조회가 실패하는 원인을 로컬 DB/Spring card-decks 경로 기준으로 확인한다.
- 논의 필요: 로컬 개발 DB만 깨진 것인지, 운영 Spring 전환 경로에서도 같은 schema 누락이 날 수 있는지 판단한다.
- 선택지:
  - A. 로컬 DB 수동 마이그레이션 안내만 남긴다.
  - B. Spring Flyway가 카드 덱 테이블을 보장하도록 앱 마이그레이션을 추가한다.
- 추천: B. 카드서비스 API는 현재 Spring을 호출하므로 Spring 기동 시 필요한 테이블을 직접 보장해야 로컬/운영 모두 같은 실패를 막을 수 있다.
- 사용자 방향: B

## 2차

- 작업내용: 카드 덱 목록/상세/아이템/SRS 조회에 필요한 DB 객체와 기존 legacy public schema 의존을 점검하고, 운영 DB에 이미 존재하는 경우에도 안전한 `if not exists` 마이그레이션으로 보강한다.
- 논의 필요: 기존 web Drizzle migration과 중복되는 public schema 객체를 Spring Flyway에서 관리해도 되는지 확인한다.
- 선택지:
  - A. Spring 전용 `yeon_backend` 스키마로 새 테이블을 만든다.
  - B. 현재 코드가 조회하는 `public.card_decks`, `public.card_deck_items`, `public.users`와 정합되게 보강한다.
- 추천: B. 현재 운영/legacy 데이터와 API 코드가 public schema를 바라보므로 테이블 위치를 바꾸면 데이터 단절 위험이 크다.
- 사용자 방향: B
