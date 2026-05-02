---
globs:
  - apps/web/src/features/typing-service/**
  - apps/race-server/**
  - packages/typing-race-engine/**
  - packages/race-shared/**
---
# Typing Race — 기능이 먼저 보이는 흰 배경 미니멀 레이스 UI

## UI 제약
- 배경: 흰색(`bg-white`), 텍스트: `#111`
- CTA: 검정(`#111`) — 색 강조는 상태 표현 전용만 허용
  - 오렌지: 진행/경쟁, 초록: 준비/완료, 빨강: 오타/오류, 골드: 1위
- **금지**: 다크 배경, 그라디언트, 장식용 아이콘, 추상 설명 우선 표시

## 주요 파일
- `apps/web/src/features/typing-service/typing-decks-screen.tsx` — 덱 관리 (상태 복잡)
- `apps/web/src/features/typing-service/use-typing-decks.ts` — API 통합 훅
- `apps/web/src/features/typing-service/use-race-room.ts` — 레이스 방 상태
- `apps/web/src/features/typing-service/use-typing-settings.ts` — 설정/locale 상태

## API & 패키지
- Contract: `@yeon/api-contract/typing-decks`
- 게임 엔진: `packages/typing-race-engine/`
- 공유 프로토콜: `packages/race-shared/`
- 멀티플레이 서버: `apps/race-server/` (Colyseus)

## 핵심 불변 규칙
- race-server 변경 시 seed/protocol 무결성 반드시 확인
- 멀티플레이: 모든 참가자 동일 seed 보장 필수
- 상태 타입은 discriminated union (WPM/accuracy/phase 등)
- CPM/WPM/accuracy 계산 로직 변경 시 engine 패키지와 동기화
