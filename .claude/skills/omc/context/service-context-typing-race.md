---
name: service-context-typing-race
description: typing-race 서비스 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. `/typing-service`, `apps/race-server`, `packages/race-shared`, `packages/typing-race-engine`, typing deck/race room 작업에 사용한다.
user_invocable: true
---

# service-context-typing-race

`omx team` 또는 병렬 작업에서 typing-race lane을 맡았으면 이 스킬을 먼저 읽는다. 목적은 새 기획을 만드는 것이 아니라, 기존 근거를 빠르게 공유해 서비스별 정확 라우팅을 가능하게 하는 것이다.

## 한 줄 서비스 톤

**기능이 먼저 보이는, 흰 배경의 미니멀 레이스 UI + 작은 픽셀 게임 감성.**

## 라우팅 번들

- Web routes: `apps/web/src/app/typing-service/**`, `apps/web/src/app/admin/typing-decks/**`
- Web feature: `apps/web/src/features/typing-service/**`
- Public API: `apps/web/src/app/api/v1/typing-decks/**`
- Realtime server: `apps/race-server/src/**`
- Shared protocol: `packages/race-shared/src/**`
- Client engine: `packages/typing-race-engine/src/**`
- Contracts: `packages/api-contract/src/typing-decks.ts`
- Docs: `docs/projects/typing-race/**`, `docs/product/backlog/typing-race.md`, `docs/design/anti-ai-design.md`

## 먼저 읽을 근거

1. `docs/design/anti-ai-design.md` — AI식 장식 제거, 기능 우선 UI 기준.
2. `docs/projects/typing-race/service-plan-v0.1.md` — 서비스 목표, seed, 게임 규칙, 화면 플로우.
3. `docs/projects/typing-race/architecture.md` — Next.js / Phaser / Colyseus / shared package 경계.
4. 현재 구현 중 맡은 파일: `apps/web/src/features/typing-service/**`, `apps/race-server/src/rooms/typing-race-room.ts`, `packages/race-shared/src/typing-race.ts` 중 해당 lane 파일.

## 디자인 기준

- 앱 셸은 흰 배경, 얇은 보더, 검정 CTA, 회색 보조 텍스트 중심으로 조용하게 둔다.
- 타이핑 문장, 입력창, 진행률, 방 입장/시작 액션이 장식보다 먼저 보여야 한다.
- 색은 상태 표현에만 쓴다: 진행/순위 강조 오렌지, 준비/정상 초록, 오타/에러 빨강, fallback/주의 노랑, 방장/왕관 골드 브라운.
- 픽셀 게임 감성은 레이스 캔버스, 낙타 스프라이트, 카운트다운, HUD 같은 플레이 영역에만 제한한다.
- 일반 UI는 sans, 타자 문장/입력/HUD 수치는 `font-mono` 계열을 우선한다.

## 피해야 할 것

- 과한 다크 히어로, 그라디언트, glow, blob, 도트 배경.
- 제품보다 마케팅 카피가 먼저 보이는 레이아웃.
- 장식용 아이콘 남발, 카드 안에 카드가 계속 중첩되는 구조.
- `/typing-service` 진입 후 실제 타자/방 입장보다 추상 설명을 먼저 보여주는 화면.

## 기능 기준

- 공개 진입점은 로그인 없이 바로 타자 연습 또는 레이스 진입이 가능해야 한다.
- 멀티 레이스는 모든 참가자가 같은 seed를 공유해야 하므로 race seed/protocol 경계를 임의로 깨지 않는다.
- 덱/문장 선택은 `typing-decks` API 계약과 race-server seed normalization/signing 흐름을 함께 확인한다.
- 진행률, CPM/WPM, accuracy, countdown, finish/result 같은 상태는 server/shared protocol과 UI 상태가 어긋나지 않게 검증한다.

## 팀 작업 체크

- lane이 `apps/web` UI만 건드려도 race seed, protocol, deck contract 영향이 있는지 확인한다.
- lane이 `apps/race-server`나 `packages/race-shared`를 건드리면 web client hooks/screens와 타입 계약을 함께 확인한다.
- 디자인 변경은 `docs/design/anti-ai-design.md` 기준으로 기능 우선인지 검토한다.
