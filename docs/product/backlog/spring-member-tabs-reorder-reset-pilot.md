# Spring Member Tabs Reorder/Reset Pilot

## 차수 1
### 작업내용
- `member-tabs` aggregate의 남은 mutation 중
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
  - `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
  를 다음 Spring 파일럿으로 연다.
- 먼저 Next 현재 구현의 bulk mutation 규칙과 부작용을 inventory로 고정한다.

### 논의 필요
- reorder와 reset을 같은 차수에 둘지, separate lane으로 더 쪼갤지
- reset 시 field cascade / system tab restore 검증 범위를 어디까지 강제할지

### 선택지
- A. reorder 먼저, reset 나중
- B. reorder/reset 함께 inventory 후 reorder부터 구현
- C. reset 먼저

### 추천
- **B. inventory는 함께, 구현은 reorder 먼저**

### 사용자 방향
- 추천 기준으로 진행
