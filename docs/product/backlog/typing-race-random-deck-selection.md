# 타자 레이스 덱 문장 랜덤 선택 보장

## 배경

타자 레이스 진입 시 같은 문장이 반복 노출된다. 타자방 생성/시작과 바로 레이스 진입 모두 선택 덱 안에서 매 게임 새로운 문장을 선택해야 한다.

## 1차

### 작업내용

- 타자방 생성 화면에서 query `selectedDeckId`가 없어도 현재 선택/기본 덱의 race seed를 생성한다.
- 타자방 시작 시 기존처럼 시작 메시지마다 새 race seed를 보내되, 생성 초기 seed도 fallback 고정 문장에 의존하지 않게 한다.
- 바로 레이스(`joinOrCreate` quick)도 room 생성 옵션에 선택 덱 race seed를 포함한다.
- 서버 fallback 고정 문장은 진짜 seed 생성 실패/비정상 입력의 최후 fallback로만 남긴다.

### 논의 필요

- quick race에서 기존 방에 합류하는 경우 기존 방 seed를 유지해야 하므로, 새 seed는 방이 새로 생성될 때만 적용되어야 한다.

### 선택지

1. 클라이언트가 quick joinOrCreate 옵션에 race seed를 실어 보내고, 기존 방 합류 시 서버의 기존 seed를 따른다.
2. race-server가 독자적으로 seed 목록을 들고 랜덤 선택한다.

### 추천

- 덱 API/권한/source of truth는 web/Spring에 있으므로 1안을 적용한다. 멀티플레이 참가자는 서버 roomSeed를 그대로 받아 동일 문장을 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.
