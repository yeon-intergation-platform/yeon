# 커뮤니티 채팅/작성자 정보 배치 및 타자방 상태관리 개선

## 범위

- `/community` 상단 실시간 채팅 영역 폭 확장
- 글/댓글용 닉네임/비밀번호 입력 위치를 채팅 카드 오른쪽으로 이동
- 커뮤니티 상단 채팅 닉네임칸 제거, 카드/타자 내부 채팅 닉네임칸 유지
- 기본 비회원 닉네임 `익명이` 적용
- 내정보 이름 카드 제거
- 타자연습 캐릭터 프레임 설정 링크를 헤더 안으로 이동
- 타자방 대기 화면 방설정/참여자/채팅 3열 압축
- compact 실시간 채팅 위젯 아이콘/모션 접힘 UI 정리
- 타자방 새로고침/채팅 보존/1판 종료 후 로비 복귀 상태관리 개선

## 진행

- 작업 중

## 검증

- 진행: web/race-server lint/typecheck/build

## 추가 요청 반영

- compact 채팅 접힘 상태는 큰 아이콘만 남기고, 펼친 상태 안쪽 왼쪽 위에 `실시간 채팅` 제목을 배치한다.
- compact 채팅 닫기 버튼은 원테두리를 제거하고, 접속 수는 초록색 숫자 pill만 표시한다.
- `/typing-service` 홈은 `내 프로필`/`오늘의 시작` 2열 패널로 묶고 CTA 3개를 제목+설명 카드형 버튼으로 배치한다.
- lobby room은 시작 후에도 잠그지 않고 서버 onJoin guard로 신규 참여만 차단해 기존 참여자 새로고침 복귀를 허용한다.

## 완료 기록

- 커뮤니티 상단 채팅/작성자 정보 배치, compact 채팅 UI, 타자방 상태 복귀, `/typing-service` 홈 2열 패널을 반영했다.
- 검증: `pnpm --filter @yeon/race-server lint`, `pnpm --filter @yeon/race-server typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check`.

## presence 기준 수정

- 채팅 접속 수가 최근 채팅 작성자 기반이라 0으로 보이는 문제를 수정했다.
- 루트 레이아웃에서 사이트 접속 세션 heartbeat를 보내고, 채팅 위젯은 해당 active count를 작은 초록 dot 옆 숫자로 표시한다.
- 현재 구현은 프로세스 메모리 기반 presence이며 다중 인스턴스에서는 Redis 같은 공유 저장소로 승격 가능하다.
