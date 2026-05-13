# N-작업-codex_2158-진행\_room-shared-ui-shell

## 목표

- 카드 서비스/타자 서비스의 타자방/카드방에서 공통화 가능한 UI 셸을 실제 코드로 최소 추출한다.

## 범위

- 공통화: 캐릭터 입장 카드, 방 생성 모달 오버레이, 참가자 카드 표현 컴포넌트.
- 유지: 카드방 Spring/API·race-server 이벤트, 타자방 Colyseus/race 이벤트, 덱/시드/결과 도메인 로직.

## 진행 상태

- 작업 시작.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`

## 메모

- 사용자가 pnpm build 남발을 금지했으므로 이번 UI 셸 추출에서는 build를 기본 실행하지 않는다.

## 완료 내용

- `features/room-shared`에 공통 방 UI 셸을 추가했다.
- 카드방/타자방 로비의 입장 캐릭터 카드와 방 생성 모달 오버레이를 공통 컴포넌트로 교체했다.
- 카드방/타자방 참가자 카드 렌더링을 공통 참가자 카드로 교체했다.
- 도메인별 방 생성/입장/게임 진행 로직은 변경하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.

## 빌드

- 사용자 지침에 따라 이번 변경에서는 `pnpm --filter @yeon/web build`를 실행하지 않았다.
