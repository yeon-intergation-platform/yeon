# 커뮤니티 Playwright 실사용 UX 점검

## 1차

### 작업내용

- 로컬 web/backend를 실행하고 Playwright로 `/community`와 게시글 상세 흐름을 실제 사용자처럼 탐색한다.
- 게스트 닉네임/비밀번호, 글 작성, 댓글 작성, 수정, 삭제, 오류 상태, 모바일 375px 레이아웃을 확인한다.
- 사용 중 발견한 버그와 불편을 우선순위대로 좁게 수정한다.
- 웹 커뮤니티와 모바일 chat-service는 현재 parity registry상 `platform-divergent`이므로, 공유 계약을 새로 만들지 않는 한 웹 경로 안에서 수정한다.

### 논의 필요

- 커뮤니티 web feed와 mobile chat-service feed를 장기적으로 동일 도메인으로 수렴할지 여부는 별도 제품 결정이 필요하다.
- 이번 작업은 수렴 설계가 아니라 현재 웹 커뮤니티의 실제 사용성 개선에 한정한다.

### 선택지

- A. Playwright로 실제 흐름을 먼저 탐색하고, 재현된 문제만 고친다.
- B. 기존 코드만 읽고 예상되는 UI 문제를 한꺼번에 리디자인한다.
- C. mobile chat-service까지 공용 queryKey/화면 구조로 묶는다.

### 추천

- A. 현재 목표는 실제 사용 시뮬레이션 기반 개선이므로 재현 증거를 먼저 확보해야 한다. B는 과한 리디자인 위험이 있고, C는 registry상 아직 제품 수렴 결정이 선행되지 않았다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 실행 결과

- Playwright 실사용 재현으로 게스트 작성자 확인 dismiss 상태와 세션 비밀번호 소실이 충돌하는 버그를 확인했다.
- 작성자 확인 bypass 조건을 `dismiss && 닉네임/비밀번호 완성`으로 제한했다.
- 상세 삭제 성공 후 빈 상세 화면에 머무르지 않고 커뮤니티 목록으로 복귀하도록 수정했다.
- 검증: Playwright 재현/회귀 확인, 웹 전체 Vitest, lint, typecheck, diff check, parity check 통과.
