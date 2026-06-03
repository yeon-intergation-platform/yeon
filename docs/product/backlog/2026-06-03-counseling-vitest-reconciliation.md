# 동결 counseling-workspace 웹 vitest 정합

작성일: 2026-06-03

## 배경

전수 감사(PR #569) 이후 `apps/web`의 동결 도메인 counseling-workspace(상담 기록·스페이스·수강생/학생관리·출석체크·스페이스 템플릿) 라우트 핸들러 프로덕션 동작이 바뀌었으나(Universal UI 마이그레이션 `getYeonRequestCookies`/`createYeonUrl`, 공유 spring client fetch 시그니처·타임아웃·헤더 변경 등), 해당 vitest 테스트의 목/단언이 옛 동작을 단언해 21건이 실패한다. 13개 파일 전부 동결 도메인이며 card/typing/community에는 실패가 0건이다.

counseling-workspace는 AGENTS.md상 **동결**(품질 게이트 범위는 카드/타자/커뮤니티 3종 한정)이지만, 사용자가 명시적으로 "동결 해제하고 테스트 정합"을 지시했다(freeze override).

## 1차: counseling vitest 21건 정합

### 작업내용

- 13개 파일(counseling-records×3, public-check-sessions×1, space-templates×3, spaces/[spaceId] member-tabs·apply-template·snapshot-template×6)의 실패 테스트를 현재 프로덕션 동작에 맞게 정합한다.
- **테스트 전용 변경을 우선**: 목 경로(`@yeon/ui/runtime/YeonServerRequest` 등), fetch 단언 헤더, 기대 상태코드(미인증 403 등)를 새 동작에 맞춘다.
- 테스트가 명백한 프로덕션 버그를 드러내면 동결 정책상 임의 수정하지 않고 보고한다.

### 논의 필요

- 일부 실패가 테스트 drift가 아니라 감사가 의도치 않게 만든 프로덕션 회귀일 가능성. 그 경우 동결 도메인이라 즉시 수정 대신 사용자 보고.

### 선택지

1. 테스트 목/단언만 정합(프로덕션 counseling 코드 불변) — 추천
2. 프로덕션까지 수정
3. 게이트에서 제외(동결 정합)

### 추천

선택지 1. 동결 도메인이므로 프로덕션 로직은 건드리지 않고 테스트만 현재 동작에 정합. 버그 의심은 보고.

### 사용자 방향

"동결 해제하고 테스트 정합" 선택 → 선택지 1로 진행.
