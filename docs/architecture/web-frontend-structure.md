# Web frontend structure standard

## 목적

`apps/web`의 route boundary, feature boundary, server-state boundary를 분리해 같은 기능이 `app/*`와 `features/*`에 이중 구현되는 일을 막는다. 이 문서는 팀의 프론트 구조 기준이다. 에이전트 실행 체크리스트는 `.claude/commands/frontend-structure-conventions.md`가 이 문서를 기준으로 유지한다.

## 기본 원칙

- `app/*`는 Next.js route 조립, layout, metadata, route handler, server action boundary만 맡는다.
- 제품 기능의 훅, 클라이언트 컴포넌트, 순수 로직, API wrapper, query key factory는 `features/*`가 소유한다.
- 같은 도메인을 `app/<service>/_hooks|_components|_lib`와 `features/<service>/*`에 동시에 구현하지 않는다.
- 이미 app 내부에 기능 구현이 남아 있으면 실제 사용 경로를 확인한 뒤 feature로 흡수하거나 route bridge만 남긴다.

## 디렉터리 역할

| 위치                            | 허용 책임                                                              | 금지 책임                                                         |
| ------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `app/**/page.tsx`               | route params/search params 해석, feature container 조립, metadata 연결 | 서버 상태 fetch/mutation 직접 구현, 긴 view JSX, 도메인 규칙      |
| `app/**/_components`            | route 전용 얇은 조립 컴포넌트, feature re-export bridge                | 재사용 가능한 feature UI, mutation/query wiring, 도메인 파생 로직 |
| `app/**/_hooks`                 | 임시 route bridge hook. 신규 추가 금지에 가깝게 취급                   | 장기 서버 상태 hook, query key factory, business state machine    |
| `features/<service>/components` | 제품 기능 UI/presentational component                                  | route params 직접 소유                                            |
| `features/<service>/hooks`      | query/mutation/container/model hook                                    | 여러 서비스의 무관 상태 조립                                      |
| `features/<service>/api`        | 서비스 fetch wrapper, API DTO adapter                                  | React component state                                             |
| `features/<service>/lib`        | 순수 파생 함수, formatter, state reducer                               | fetch, router, React hook                                         |

## Server state 규칙

서버/API가 원천인 값은 TanStack Query 표준을 따른다.

- 자세한 기준은 `docs/architecture/web-server-state.md`를 따른다.
- queryKey는 서비스별 factory만 사용한다.
- 직접 `fetch()`는 component/page/hook에 흩뿌리지 않고 서비스별 `*-fetch.ts` wrapper를 경유한다.
- mutation 성공 후 영향받는 queryKey를 명시적으로 invalidate한다.

## 상태 소유권 규칙

하나의 값은 한 계층이 원천으로 소유해야 한다.

- 서버 원본: React Query cache.
- 낙관적 임시 상태: rollback 기준이 있는 optimistic store 또는 mutation context.
- 편집 draft: form/local reducer 상태.
- route 상태: URL search params 또는 route params.
- 화면 상태: modal open, selected tab, hover, animation 등 local state.

서버 원본과 local override를 병합해야 한다면 타입 이름과 저장소를 분리하고, 삭제/초기화/성공 반영 시 override 폐기 경로를 반드시 둔다.

## God component / God hook 분해 기준

다음 중 2개 이상에 해당하면 분해 대상이다.

- 250줄을 넘는 클라이언트 컴포넌트 또는 hook.
- query/mutation, route navigation, form draft, optimistic state, view JSX를 한 파일이 동시에 소유.
- `set*`, `delete*`, `reset*`, `invalidate*`가 같은 파일에 다수 존재.
- 실패/삭제/로그아웃/space 전환 시 cleanup 경로를 눈으로 추적하기 어렵다.

분해 순서:

1. 서버 호출과 queryKey를 `features/<service>/api|hooks`로 이동한다.
2. 순수 파생값/formatter를 `features/<service>/lib`로 이동한다.
3. container/model hook이 view에 필요한 값과 callback만 반환하게 한다.
4. view component는 렌더링과 사용자 이벤트 전달만 담당한다.
5. app route 파일은 feature container 조립만 남긴다.

## 금지 패턴

- 신규 기능을 `app/<service>/_hooks` 또는 `_lib`에 장기 구현으로 추가.
- 같은 hook/component 이름을 app과 feature에 동시에 유지.
- `queryKey: ["members"]`, `setQueriesData({ queryKey: ["members"] })` 같은 raw key 사용.
- component 내부에서 서비스 wrapper 없이 직접 `fetch()` 반복.
- 서버 원본, optimistic 임시값, form draft를 같은 배열/object에 섞어 저장.
- formatter가 적용되지 않은 한 줄 route handler 방치.

## 예외

- route handler, server action, metadata, Open Graph image처럼 Next route boundary 자체인 코드는 `app/*`가 소유한다.
- 기존 migration 중인 app 내부 hook/component는 bridge로 유지할 수 있지만, 새 책임을 추가하지 않고 feature 이동 백로그를 남긴다.
- 작은 route 전용 presentational component는 app 내부에 둘 수 있으나 서버 상태나 도메인 규칙을 소유하면 feature로 이동한다.

## 리뷰 체크리스트

- 이 파일이 route boundary인가, product feature인가?
- 같은 도메인 구현이 app과 feature에 두 벌 남아 있지 않은가?
- 서버 상태 queryKey와 fetch가 서비스별 factory/wrapper를 경유하는가?
- 서버 원본, optimistic 상태, draft 상태의 source of truth가 분리되어 있는가?
- 삭제/초기화/실패/space 전환 시 파생 상태가 정리되는가?
- 250줄 이상 파일이면 container hook, view component, pure lib로 나눌 수 있는가?
