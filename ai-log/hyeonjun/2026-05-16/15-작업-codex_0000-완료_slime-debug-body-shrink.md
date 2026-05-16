# 슬라임 디버그 바디 박스 크기 미세 보정

## 목표
- 슬라임 검증 페이지의 초록 디버그 바디 박스를 조금 더 축소해 판정 박스 여유를 줄인다.

## 작업내용
- `SLIME_COLLISION_STAGE`의 `playerWidth / playerHeight`를 소폭 축소.
- `SLIME_COMBAT_STAGE`의 `playerWidth / playerHeight`를 동일 톤으로 소폭 축소하여 액션/전투 검증 화면 디버그 바디 일관성 보정.
