# 13 작업 - community chat identity sidebar

## 목표

- Playwright로 커뮤니티를 실제에 가깝게 사용하며 채팅/게스트 인증 UI를 개선한다.
- 채팅 시간 표시, 3일 보존 안내/로직, 우측 게스트 인증 카드 분리를 구현하고 검증한다.

## 제약

- base/PR target은 `main`이다.
- 신규 backend 소유권은 Spring(`apps/backend`)에 둔다.
- Next route는 Spring 호출/응답 브리지 역할만 유지한다.
- 상담 워크스페이스는 건드리지 않는다.
- 커뮤니티 web과 mobile chat-service queryKey는 registry상 `platform-divergent`라 이번 변경은 웹 커뮤니티와 Spring community-chat에 한정한다.

## 진행 메모

- 브랜치: `fix/community-chat-identity-sidebar-20260618`
- 시작 커밋: `origin/main` `ca3f8fb3`
- 디자인 방향: 기존 흰 배경 생산성 UI 유지. 닉네임/비밀번호는 글쓰기 액션과 분리된 작은 사이드 카드로 두고, 채팅 timestamp는 메시지 텍스트와 경쟁하지 않게 별도 meta 행으로 정리한다.
- 21st component builder 시도: `identity sidebar card` 요청이 120초 timeout. 기존 Yeon UI 컴포넌트로 직접 구현한다.
- 구현 결과:
  - 채팅 timestamp를 날짜+시간으로 바꾸고 메시지 아래 meta 행으로 배치했다.
  - 채팅 헤더에 3일 보존 안내를 추가했다.
  - Spring community-chat 목록 조회/전송 시 3일 이전 메시지를 정리하고 cutoff 이후 메시지만 반환하게 했다.
  - 게스트 인증 입력을 글쓰기 영역에서 제거하고 우측/모바일 상단 카드로 분리했다.
  - 닉네임/비밀번호를 localStorage에 저장해 글/댓글 작성·수정·삭제에서 자동 사용하게 했다.
  - Playwright 중 모바일 grid `min-width:auto`로 문서 가로 오버플로가 발생하는 버그를 발견해 `min-w-0`로 수정했다.
  - 저장된 게스트 인증값이 있으면 SSR의 `미등록`과 client 첫 렌더의 `등록됨`이 갈라지는 하이드레이션 오류를 발견해 localStorage 읽기를 mount 이후로 이동했다.

## 검증

- Playwright `http://localhost:3005/community`
  - 데스크톱: 인증 카드가 본문 오른쪽에 배치됨.
  - 글쓰기 영역: 닉네임/비밀번호 입력이 남지 않음.
  - 채팅: `채팅은 3일 뒤 사라져요.` 표시, timestamp `6. 18. 18:55` 형태와 메시지 아래 배치 확인.
  - 인증 카드 등록 후 글 작성/삭제: 본인확인 모달 없이 저장된 인증값 사용.
  - 모바일 390px: `scrollWidth === clientWidth`, 인증 카드가 본문 위에 표시됨.
  - 저장된 인증값 조건: page error/console error 없음, 하이드레이션 오류 재발 없음.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web test -- src/features/community/__tests__/community-guest-identity.test.ts` 통과. 실제 실행은 web 테스트 202개 파일/878개 테스트 전체 통과.
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.community_chat.service.CommunityChatServiceTests'` 통과.
- `pnpm verify:parity` 통과.
- `git diff --check` 통과.
- `pnpm build:web` 통과.
