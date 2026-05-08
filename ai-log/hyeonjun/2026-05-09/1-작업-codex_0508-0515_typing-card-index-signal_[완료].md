# typing/card index signal 작업 로그

- 시작: 05:08
- 목표: `/typing-service`, `/card-service`의 SSR 본문 신호를 강화해 Search Console의 미발견/미크롤 상태를 줄일 수 있는 공개 텍스트 구조를 추가한다.
- 범위: `apps/web/src/features/typing-service/**`, `apps/web/src/features/card-service/**`, `docs/product/backlog/seo.md`
- 제약: 현재 워킹트리의 backend/.gradle, .idea dirty 파일은 건드리지 않고 웹 owned path만 수정한다.
- 계획:
  1. typing/card 서비스의 첫 HTML 본문 신호가 약한 구간을 보강한다.
  2. lint/typecheck/build로 배포 가능성을 확인한다.
  3. commit → push → PR(main)까지 완료한다.
- 변경:
  - `/typing-service` 첫 SSR 본문에 서비스 설명, 핵심 하이라이트, FAQ 섹션 추가
  - `/card-service` 첫 SSR 본문에 서비스 설명, 핵심 하이라이트, FAQ 섹션 추가
  - `.gitignore`에 `.idea/`, `apps/backend/.gradle/`, `apps/backend/HELP.md` 추가
  - index에 올라간 IDE/Gradle 생성물은 `git rm --cached`로 추적 대상에서 제거
- 검증:
  - `git diff --check` 통과
  - `pnpm --filter @yeon/web lint` 통과
  - `pnpm --filter @yeon/web typecheck` 통과
  - `pnpm --filter @yeon/web build` 통과
