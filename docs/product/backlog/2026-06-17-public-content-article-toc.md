# 공개 콘텐츠 article 목차

## 1차

### 작업내용

- 공개 콘텐츠 article detail에서 heading block 기반 목차를 만든다.
- 데스크톱에서는 본문 왼쪽에 sticky 목차를 제공한다.
- 모바일에서는 본문 위에 접힘 목차를 제공한다.
- heading anchor id는 한국어 제목 slug가 아니라 안정적인 section 번호로 생성한다.

### 논의 필요

- 목차 클릭 이벤트를 공개 콘텐츠 analytics에 포함할지 여부.

### 선택지

- A. 내부 anchor는 일반 링크로 두고 analytics 이벤트를 늘리지 않는다.
- B. `PublicContentTrackedLink`의 link kind를 확장해 목차 클릭도 수집한다.
- C. 목차 UI만 만들고 anchor 이동은 나중에 붙인다.

### 추천

- A. 현재 목표는 탐색성 개선이고, 내부 목차 클릭을 바로 운영 지표로 쓰지 않으므로 이벤트 계약을 늘리지 않는다.

### 사용자 방향

- 비어 있으면 추천 기준으로 진행한다.
