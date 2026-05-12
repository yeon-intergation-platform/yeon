---
name: frontend-structure-conventions
description: |
  yeon apps/web 프론트 구조 표준. app route boundary와 features product boundary 분리, God component/hook 분해, server/local/optimistic/draft 상태 소유권을 점검한다. 트리거: apps/web의 app/* 또는 features/* 구조를 만들거나 옮기거나 큰 React 컴포넌트/훅을 수정할 때.
---

# frontend-structure-conventions

## Purpose

`apps/web`에서 app route와 feature implementation이 섞여 같은 기능이 두 벌로 유지되는 문제를 막는다. 이 스킬은 공식 팀 문서 `docs/architecture/web-frontend-structure.md`를 실행 체크리스트로 적용한다.

## Use_When

- `apps/web/src/app/**/_components`, `_hooks`, `_lib`를 만들거나 수정할 때
- `apps/web/src/features/**`로 컴포넌트/hook/lib/api를 이동할 때
- 250줄 이상 React component/hook을 수정할 때
- query/mutation, router, form draft, optimistic state, view JSX가 한 파일에 섞인 코드를 만질 때
- `app/*`와 `features/*`에 같은 도메인 구현이 중복되어 보일 때

## Do_Not_Use_When

- 단순 copy/text/style만 바꾸고 구조 책임이 변하지 않을 때
- Spring/backend/domain package 작업
- 순수 TanStack Query key/fetch만 다루는 작은 변경은 `tanstack-query-conventions`를 우선 적용한다

## Source of Truth

- `docs/architecture/web-frontend-structure.md`
- server-state 세부 규칙: `docs/architecture/web-server-state.md`

## Workflow

1. 바꾸는 파일이 route boundary인지 product feature인지 먼저 판정한다.
2. route boundary가 아니면 기본 위치를 `features/<service>/*`로 잡는다.
3. app 내부에 남는 파일은 route 조립 또는 feature re-export bridge인지 확인한다.
4. 서버 상태가 있으면 `tanstack-query-conventions`도 함께 적용한다.
5. God component/hook이면 다음 순서로 분해한다.
   - API/query key/fetch wrapper
   - pure formatter/derive lib
   - container/model hook
   - presentational component
   - route bridge
6. 삭제/초기화/실패/space 전환 시 server/local/optimistic/draft 상태 cleanup 경로를 확인한다.
7. 변경 전후에 같은 도메인 구현이 app과 feature에 두 벌 남지 않았는지 검색한다.

## Review Checklist

- `app/*`에 product feature logic이 새로 추가되지 않았는가?
- feature component/hook/lib/api가 자기 서비스 디렉터리에 있는가?
- queryKey와 fetch는 서비스별 factory/wrapper를 경유하는가?
- 서버 원본, optimistic 임시값, 편집 draft, route state, 화면 state가 분리되어 있는가?
- 250줄 이상 파일을 더 키우지 않았는가?
- app 내부 bridge가 장기 구현처럼 새 책임을 갖지 않는가?

## Verification

- 구조 검색: `find apps/web/src/app/<service> -maxdepth 2 -type f`
- 중복 검색: `rg "<ComponentOrHookName>|<domain key>" apps/web/src/app apps/web/src/features`
- raw query key 검색: `rg 'queryKey:\s*\[' apps/web/src`
- 웹 변경 기본 검증: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web build`
