# 게임 상세 라우트 metadata 커버리지 보강

## 1차수

### 작업내용

- 게임 상세 라우트의 `generateStaticParams()`가 카탈로그 slug 전체를 반환하는지 테스트한다.
- 상세 metadata가 game host canonical, Open Graph URL, robots index 정책을 유지하는지 테스트한다.

### 논의 필요

- 없음. 기능 변경 없이 SEO/라우팅 회귀 방지 테스트만 추가한다.

### 선택지

- A. 카탈로그 테스트만 유지한다.
- B. 실제 상세 라우트의 정적 파라미터와 metadata export를 테스트한다.

### 추천

- B. 카탈로그가 정상이어도 라우트 export가 깨지면 운영 상세 URL 노출과 검색 메타가 깨질 수 있다.

### 사용자 방향

- 추천 기준으로 진행한다.
