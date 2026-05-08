# spring activity-logs pilot

## 작업내용
- `members/[memberId]/activity-logs` route의 direct Next service 의존을 Spring API로 치환한다.
- Spring에 activity-logs read/create lane을 추가한다.
- 메모 조회/생성 응답 shape와 에러 번역을 유지한다.

## 논의 필요
- 이번 차수에서 `activity-logs-service.ts` 전체 삭제까지 가지는 않는다.
- 다른 도메인 의존이 생기면 후속 lane에서 제거한다.

## 선택지
1. route thin BFF만 먼저 전환
2. route + activity-logs service 직접 로직 전체 제거

## 추천
- 1번. 현재 소비 surface는 route 하나라서 read/create API 먼저 Spring으로 고정하는 편이 가장 작고 안전하다.

## 사용자 방향
- 추천 기준으로 진행
