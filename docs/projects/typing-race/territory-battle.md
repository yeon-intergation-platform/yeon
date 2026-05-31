# 타자 점령전 기획/기술 계획

기준일: 2026-06-01

## 목표

`typing.yeon.world`에 실시간 팀 기반 타자 게임 모드 `타자 점령전`을 추가한다. 사용자는 제한 시간 안에 단어를 정확히 입력해 팀 보드 칸을 점령하고, 더 높은 팀 점수로 승리한다.

## MVP 범위

- 2팀: red / blue
- 기본 시간: 60초
- 기본 보드: 5x5
- 기본 단어풀: 내장 한국어 짧은 단어
- 입력 방식: 현재 목표 단어 또는 보드 단어를 제출
- 판정: 서버 authoritative
- 경기 중 저장: 없음
- 경기 종료 저장: 후속 단계에서 Spring 소유 API로 검토
- Phaser: 서버 규칙 검증 후 v0.2에서 적용

## 제품 구조

```text
typing.yeon.world
├─ 바로 연습
├─ 연습 덱 관리
├─ 레이스 입장
└─ 점령전 입장
```

## 화면

### 로비

- 흰 배경 미니멀 UI
- 빠른 시작
- 규칙 요약
- 방 생성/참여는 후속 확장

### 플레이

- 상단: red/blue 팀 점수, 제한 시간, 내 팀
- 중앙: 5x5 점령 보드
- 하단: 목표 단어, 입력창, CPM/정확도/콤보
- 상태 색상: red/blue/neutral, 오류 red, 성공 green, MVP gold

### 결과

- 승리 팀
- 팀 점수
- 내 점수
- 점령 칸 수
- 정확도/CPM
- 다시 하기

## 기술 결정

| 영역            | 결정                                                     |
| --------------- | -------------------------------------------------------- |
| Web route       | `apps/web/src/app/typing-service/territory`              |
| Web UI          | React + Tailwind, 기능 우선 UI                           |
| Game rendering  | v0.1 React board, v0.2 Phaser scene                      |
| Realtime        | `apps/race-server` Colyseus room                         |
| Shared protocol | `packages/race-shared/src/territory-battle.ts`           |
| Engine          | `packages/typing-race-engine`는 v0.2 렌더링 전환 때 확장 |
| Storage         | 경기 종료 후만 저장, 신규 backend ownership은 Spring     |
| Deployment      | 기존 race-server/web Docker workflow 사용                |

## 서버 authoritative 원칙

클라이언트는 입력 반응과 임시 UI만 처리한다. 다음 값은 서버만 확정한다.

- 점령 성공 여부
- 점령 대상 칸
- 점수
- 콤보
- 팀 점수
- 제한 시간 종료
- 승리 팀

## 프로토콜 초안

Client -> Server

```text
territory.join
territory.ready
territory.start
territory.submitWord
territory.ping
```

Server -> Client

```text
territory.state
territory.countdown
territory.cellCaptured
territory.scoreUpdated
territory.result
territory.error
```

## 점수 규칙

```text
기본 점수 = 단어 글자 수 x 10
무오타 보너스 = +20
탈환 보너스 = +30
콤보 보너스 = combo x 5
라인 완성 보너스 = +100
```

## 구현 순서

1. 300 체크리스트와 backlog 작성
2. shared 타입/순수 helper 구현
3. React 기반 local prototype route 구현
4. Colyseus `TerritoryBattleRoom` 구현
5. web client hook 연결
6. 서버 authoritative 제출/종료 검증
7. 운영 smoke test
8. Phaser 연출 전환

## 관련 문서

- `docs/projects/typing-race/territory-battle-checklist-300.md`
- `docs/projects/typing-race/service-plan-v0.1.md`
- `docs/projects/typing-race/architecture.md`
- `docs/agent-rules/typing-service.md`
