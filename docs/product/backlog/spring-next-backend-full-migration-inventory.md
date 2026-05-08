# Spring Next Backend Full Migration Inventory

## 작업내용
- `apps/web`에 남아 있는 Next backend logic 전체 범위를 실측한다.
- 남은 route/service를 도메인별로 분류하고, 다음 smallest migration lane을 고정한다.

## 논의 필요
- repo 전체를 한 번에 옮길지, 도메인 단위로 순차 이관할지
- auth/token bridge 같은 BFF 역할을 언제까지 Next에 남길지
- chat-service / counseling-records처럼 큰 도메인을 언제 시작할지

## 선택지
- 선택지 A: repo-wide inventory 후 smallest lane부터 순차 이관한다.
- 선택지 B: 사용자 노출이 큰 도메인부터 우선 이관한다.
- 선택지 C: direct DB 사용처부터 기계적으로 제거한다.

## 추천
- **선택지 A**
- 이유: 현재 남은 surface가 크다. 충돌과 회귀를 줄이려면 도메인별로 작게 자르는 게 맞다.

## 사용자 방향
- 추천 기준으로 진행
