# Typing Race Backlog

타이핑 레이스 프로젝트의 실행 항목을 관리합니다.

- 로비 핵심 기능 실행 계획: `docs/product/backlog/typing-room-lobby-backlog.md`
- 타자방 로비 화면 정의(운영/기능/정책 정합): `docs/projects/typing-race/typing-room-lobby-screen-definition.md`

## Active

- 공식 프로젝트 문서: `docs/projects/typing-race/`
- 현재 구조 기준: `docs/projects/typing-race/architecture.md`

## Historical References

- `history/2026-04-20/13-typing-race-온프레미스-확장형-구조도입_BACKLOG.md`
- `history/2026-04-21/2-타자연습-프로필-캐릭터선택_BACKLOG.md`
- `history/2026-04-21/3-타자연습-실시간멀티플레이-연결_BACKLOG.md`

### 차수 1 — 한국어/영어 타자속도 기준 분리

- 작업내용: `typing-service`의 속도 계산을 한국어와 영어에서 서로 다른 공식 기준으로 분리한다. 한국어는 자소 단위 타수(타/분), 영어는 5문자=1단어 기준 WPM으로 계산하며, 솔로/멀티/서버 랭킹/표시 단위를 모두 같은 기준으로 통일한다.
- 논의 필요: 한국어 표시를 `타수` 중심으로 단순화할지, 내부에는 CPM/WPM을 함께 유지할지 결정이 필요하다.
- 선택지:
  - 옵션 A. 한국어는 자소 단위 타수만 전면 표시하고 영어만 WPM/CPM을 노출한다.
  - 옵션 B. 내부 계산은 분리하되 UI는 양쪽 모두 CPM/WPM/타를 혼합 표기한다.
- 추천: 옵션 A. 사용자 기대와 한컴타자 기준에 가장 가깝고, 현재 혼동의 원인인 잘못된 WPM 표기를 제거할 수 있다.
- 사용자 방향: 추천 기준으로 진행.
