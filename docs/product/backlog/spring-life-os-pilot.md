# spring life-os pilot

## 작업내용
- life-os days/read/write/report route와 service를 Spring으로 이동한다.
- Next `api/v1/life-os/**` route는 thin BFF로 전환한다.

## 논의 필요
- 없음. 단일 도메인 read/write/report lane이다.

## 선택지
1. days + reports 동시 이동
2. days만 먼저 이동

## 추천
- 1. days + reports 동시 이동
- 이유: 같은 저장소와 같은 report metric 규칙을 공유해서 함께 옮기는 편이 더 작다.

## 사용자 방향
- 추천 기준으로 진행
