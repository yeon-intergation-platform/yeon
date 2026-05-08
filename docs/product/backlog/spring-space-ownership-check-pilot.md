# spring space ownership check pilot

## 작업내용
- owned-space validation만 필요한 thin route를 위해 Spring ownership-check endpoint를 추가한다.
- 첫 적용 대상은 `public-check-locations` route다.

## 논의 필요
- 범용 endpoint를 둘지 도메인별 read endpoint를 재활용할지.

## 선택지
1. 범용 ownership-check endpoint 추가
2. 기존 read endpoint 호출로 우회

## 추천
- 1. 범용 ownership-check endpoint 추가
- 이유: validation 의도와 비용이 가장 작고 명확하다.

## 사용자 방향
- 추천 기준으로 진행
