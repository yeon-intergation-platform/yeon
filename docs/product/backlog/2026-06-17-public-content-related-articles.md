# 공개 콘텐츠 related articles 공용화

## 1차

### 작업내용

- article detail의 관련 글 선택 로직을 순수 helper로 분리한다.
- 관련 글 section을 공용 컴포넌트로 분리한다.
- 기존 article card 렌더링도 별도 view 컴포넌트로 분리해 홈, collection, related section이 같은 카드를 사용하게 한다.

### 논의 필요

- 관련 글을 같은 서비스 기준으로만 보여줄지, 같은 category 기준까지 함께 고려할지 정해야 한다.

### 선택지

- A. 같은 channel 안에서 같은 service 글을 최신순으로 최대 2개 보여준다.
- B. 같은 service와 같은 category를 먼저 보여주고 부족하면 같은 service로 채운다.
- C. channel 전체 최신 글을 보여준다.

### 추천

- A. 현재 registry와 사용자 맥락에서는 같은 서비스 글이 가장 안전하고, 기존 동작과도 호환된다.

### 사용자 방향

- 비어 있으면 추천 기준으로 진행한다.
