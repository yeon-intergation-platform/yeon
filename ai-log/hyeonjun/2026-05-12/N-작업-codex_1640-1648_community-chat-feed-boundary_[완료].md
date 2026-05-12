# 커뮤니티 채팅/피드 경계 복구

- 시작: 16:40
- 범위: 커뮤니티 상단 채팅 위젯
- 목표:
  - 채팅 입력이 피드 글을 생성하지 않도록 분리
  - 채팅창 기본 높이/스크롤 영역 확대
- 주의: 기존 public-check 작업 변경분은 건드리지 않음

## 완료

- 채팅 위젯의 메시지 source를 feed post에서 chat room message로 변경했다.
- 채팅 전송은 `/chat/rooms/{roomId}/messages`만 호출하며 feed 글 생성 API를 호출하지 않는다.
- feed variant 채팅 영역 높이를 96px → 180px로 키우고 메시지 목록 자동 하단 스크롤을 추가했다.
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
