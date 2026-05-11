# 타자방 상세 레이아웃 개선

## 상태

- 시작: 2026-05-12
- 브랜치: `codex/typing-room-layout-20260512`
- 목적: 타자방 상세 화면의 헤더 중복 문구, CTA 위치, 참여자 카드/캐릭터, 채팅 폭, 시작 버튼 위치 개선

## 작업 예정

- `TypingServiceHeader` 중앙 nav/중복 title 정리
- `typing-room-screen.tsx` 상세 레이아웃 변경
- race room protocol에 participant `characterId` 전달
- web build/typecheck 등 검증
- main PR 생성 및 머지

## 검증 기록

- 진행 중

## 구현 기록

- 헤더 title 중복을 제거하고 타자 서비스 nav를 중앙 컬럼으로 이동.
- 타자방 상세의 헤더 초대/나가기 버튼 제거, main 상단 화살표 나가기 CTA 추가.
- 방 상단 정보 카드 오른쪽 하단에 설정 설명, 초대, 시작/준비 CTA 배치.
- race-shared/race-server/useRaceRoom에 participant `characterId` 전달 추가.
- 참여자를 최대 2x2 캐릭터 카드로 표시하고 빈자리도 카드로 유지.
- 채팅 영역을 데스크톱 기준 960px 컬럼으로 확장.
- 제품 UI/프로토콜 개선으로 root version `0.0.1 -> 0.0.2` patch bump.

## 검증 기록

- `pnpm --filter @yeon/race-shared typecheck` 통과
- `pnpm --filter @yeon/race-server typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/race-server lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/race-shared test` 통과 (1 file, 6 tests)
- `pnpm --filter @yeon/web build` 통과
- `pnpm release:verify -- v0.0.2` 통과
- `git diff --check` 통과

## 상태

- 완료
