# 서비스 소개 섹션 도움말 모달 이동 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 타자·카드·커뮤니티 서비스 하단 소개 섹션을 제거하고 우측 상단 도움말 모달로 이동한다.
- 범위: apps/web 서비스 페이지/헤더/도움말 UI, docs/product/backlog, ai-log
- 원칙: 서비스 화면 안에서는 기능이 먼저 보이고, 소개/FAQ는 사용자가 도움말을 열 때만 본다.

## 변경

- 타자·카드·커뮤니티 페이지에서 하단 `ServiceSeoSection` 렌더링을 제거했다.
- 공통 도움말 모달 컴포넌트를 추가해 소개/주요 기능/FAQ 구조를 우측 상단 `도움말` 버튼 안으로 이동했다.
- 타자·카드 서비스는 기존 소개/기능/FAQ 데이터를 도움말 모달에서 재사용한다.
- 커뮤니티는 도움말 모달용 주요 기능/FAQ 데이터를 추가했다.
- 더 이상 렌더링하지 않는 `ServiceSeoSection` 및 커뮤니티 SEO 섹션 파일을 제거했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- Playwright: `/typing-service`, `/card-service`, `/community`에서 도움말 열기 전 소개 제목 0개, 도움말 모달 안 주요 기능/자주 묻는 질문 각 1개 확인
