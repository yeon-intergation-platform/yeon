# 타자 점령전 레퍼런스 이미지 및 기능 지원 백로그 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 사용자가 제공한 점령전 로비/플레이/결과 레퍼런스 이미지를 프로젝트 내부에 보관하고, 지원해야 할 기능을 백로그로 고정한다.
- 범위: screenshot/typing-territory, docs/product/backlog, ai-log

## 변경

- `screenshot/typing-territory/lobby-reference-2026-06-01-201256.png` 추가
- `screenshot/typing-territory/gameplay-reference-2026-06-01-201426.png` 추가
- `docs/product/backlog/typing-territory-reference-feature-support-20260601.md` 작성
- 이 작업 로그 작성

## 레퍼런스 기능 메모

- 로비: 방 정보, 팀별 슬롯, 방장/준비 상태, 프로필 팝오버, 팀 이동, 준비 해제, 이모티콘, 채팅/상세 로그
- 플레이: 팀 점수판, 좌우 랭킹, 중앙 카드 보드, 말풍선 지시, 카운트다운, 하단 입력 조작부
- 결과: 승리 배지, 팀별 점수 카드, 좌우 랭킹, 방 나가기/대기방, 자동 복귀 카운트다운

## 검증

- `file screenshot/typing-territory/lobby-reference-2026-06-01-201256.png screenshot/typing-territory/gameplay-reference-2026-06-01-201426.png`
- 예정: `git diff --check`, `/opt/homebrew/bin/bash bin/sync-skills.sh --check`, `bash bin/verify-ssot.sh --project-only`
