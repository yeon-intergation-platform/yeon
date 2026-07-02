# MoodDesk 제거 백로그

## 목표

MoodDesk와 Study Desk를 제품 표면에서 전부 제거한다. 카드 서비스는 기존 일반 학습만 유지하고, todo 서비스는 할 일 관리에만 집중한다.

## 1차: 런타임 제거

### 작업내용

- 플랫폼 서비스 목록에서 `mooddesk`를 제거한다.
- 정적 `/mooddesk` 자산과 `/card-service/study-desk` 라우트를 삭제한다.
- `focus-desk` feature와 Study Desk 링크 헬퍼, 관련 테스트를 제거한다.
- 카드 덱 상세와 todo 보드에서 Study Desk 진입 버튼을 제거한다.
- route SSOT에서 `cardStudyDesk`를 제거한다.
- 공식 backlog 문서의 MoodDesk 실행 계획을 제거/폐기한다.

### 논의 필요

- `mooddesk.yeon.world` 같은 인프라 라우트가 별도로 남아 있으면 Cloudflare/터널 설정에서도 제거해야 한다.
- 과거 `ai-log` 기록은 작업 이력으로 유지할지, 별도 아카이브 정리 대상으로 볼지 결정이 필요하다.

### 선택지

- A. 런타임 코드, public 자산, 공식 backlog 참조만 제거하고 과거 작업 로그는 유지한다.
- B. 과거 `ai-log`와 스크린샷까지 모두 삭제한다.
- C. Study Desk 이름만 제거하고 카드 안의 집중 학습 기능은 유지한다.

### 추천

A를 추천한다. 사용자가 말한 "mood desk 제거"는 제품 표면 제거로 해석하는 것이 가장 안전하다. 과거 작업 로그는 현재 런타임이 아니고, 삭제하면 추적성이 떨어진다.

### 사용자 방향

MoodDesk를 전부 제거한다.

## 완료 조건

- `/mooddesk` 정적 자산과 `/card-service/study-desk` 라우트가 없다.
- `focus-desk` feature와 Study Desk 링크 헬퍼가 없다.
- 플랫폼 홈, card 상세, todo 화면에서 MoodDesk/Study Desk 진입점이 없다.
- 관련 테스트와 타입 검사가 통과한다.
