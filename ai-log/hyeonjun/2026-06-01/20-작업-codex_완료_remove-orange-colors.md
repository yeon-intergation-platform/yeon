# 오렌지 색상 전면 제거 작업 로그

- 시작: 2026-06-01
- 종료: 2026-06-01
- 상태: 완료
- 목표: Yeon 서비스 UI에서 오렌지/앰버/옐로 강조 색상 사용을 제거한다.
- 범위: design-system/auth/typing/card/community/common UI, 일부 모바일/부가 화면의 기존 warm 색상 정리
- 사용자 방향: "주황색도 쓰지마. 우리 서비스는 그 어떤 곳에서도 주황색 전혀 사용하지 말아야해."

## 작업 내용

- 디자인 시스템 문서에서 타자/인증 오렌지 강조 토큰을 제거하고 중립/블랙 계열 기준으로 수정했다.
- Tailwind/CSS 전역 warm 상태 토큰(`amber`)을 중립 토큰(`neutral`)로 바꿨다.
- 타자방/점령전/멀티 레이스/카드 복습/커뮤니티 배지/인증 화면/클라우드 임포트 CTA의 오렌지·앰버·옐로 계열을 중립 색상으로 교체했다.
- 화면에 노출되던 왕관 색상과 왕관 이모지를 중립 텍스트로 정리했다.
- 모바일 카드 복습 및 life-os의 warm 배경색도 중립색으로 교체했다.

## 검증

- `rg`로 앱 소스 내 금지 warm 토큰(`#e8630a`, `#e87310`, `#ff6b35`, `#ff6b45`, `#fbbf24`, Tailwind `orange/amber/yellow-*` 등) 미검출 확인.
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/mobile typecheck`
- `git diff --check`
- `PATH="/opt/homebrew/bin:$PATH" bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (스크립트가 현재 환경에서 프로젝트 git 저장소 감지를 건너뛰고 전역 SSOT OK를 반환)
- Playwright: `http://localhost:3000/typing-service/rooms` 접속, console error 0, 금지 warm 토큰 DOM 미검출, 스크린샷 `/tmp/yeon-typing-rooms-no-orange.png` 저장.
