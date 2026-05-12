# 타이핑 서비스 메뉴 카드 hover UI 작업 로그

- 시작: 2026-05-13 00:32 KST
- 기준: `main` / `origin/main`
- 목표: 타이핑 서비스 홈 메뉴 카드 설명을 기본 노출/브라우저 tooltip이 아닌 카드 내부 커스텀 hover UI로 변경.

## 예정

- 메뉴 카드 기본 상태: 메뉴명만 노출
- hover/focus 상태: 카드 안쪽 하단에 짧은 설명 fade-in
- 카드 높이 고정으로 레이아웃 흔들림 방지
- web lint/typecheck/build 검증

## 구현 결과

- `StartCard` 컴포넌트를 추가해 메뉴 카드 기본 상태는 메뉴명만 보이도록 정리했다.
- 설명 문구는 카드 내부 absolute 영역에 렌더링하고 `group-hover`/`group-focus-visible`에서 fade-in 되도록 했다.
- 카드 `min-h`를 고정해 hover 설명 노출 시 주변 레이아웃이 흔들리지 않도록 했다.
- 메뉴 카드에는 브라우저 기본 tooltip용 `title` 속성을 사용하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check && bash bin/verify-ssot.sh --project-only` 통과
