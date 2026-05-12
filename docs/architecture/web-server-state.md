# Web server-state standard with TanStack Query

## 목적

`apps/web`의 서버 상태는 TanStack Query를 표준으로 사용한다. 서버/API가 원천인 값은 query/mutation 훅으로 읽고 쓰며, 폼 입력값·모달 열림 여부·애니메이션 상태처럼 화면 안에서만 의미가 있는 클라이언트 상태는 React Query로 올리지 않는다.

이 문서는 Yeon 웹의 구조 기준이다. 에이전트 실행 체크리스트는 `.claude/commands/tanstack-query-conventions.md`가 이 문서를 기준으로 유지한다.

## 표준 구조

- Query provider는 `apps/web/src/lib/query-provider.tsx`를 사용한다.
- queryKey는 raw 배열을 컴포넌트나 훅 옵션에 직접 쓰지 않고, 서비스 가까이에 factory 함수로 둔다.
- 서버 호출은 도메인 fetch wrapper를 경유한다.
  - 예: card-service는 `apps/web/src/features/card-service/hooks/card-service-fetch.ts`의 `cardServiceFetchJson` / `cardServiceFetchVoid`를 사용한다.
- mutation 훅은 `use<Verb><Entity>` 이름으로 한 책임만 가진다.
- mutation 성공 후 영향받는 queryKey는 `onSuccess`에서 `invalidateQueries`로 명시한다.
- 게스트 ↔ 인증 분기는 사용처가 아니라 query/mutation 훅 내부에서 감춘다.
- 사용자 노출 에러 메시지는 한국어 `~지 못했습니다.` 형태를 기본으로 한다.

## queryKey factory 규칙

```ts
export const cardDecksQueryKey = (isAuthenticated: boolean) =>
  ["card-decks", isAuthenticated ? "server" : "guest"] as const;

export const cardDeckDetailQueryKey = (
  isAuthenticated: boolean,
  deckId: string
) => [...cardDecksQueryKey(isAuthenticated), deckId] as const;
```

- factory 함수는 해당 데이터를 소유하는 feature/hook 파일에서 export한다.
- 서비스 규모가 커져 여러 파일이 같은 key 계층을 공유하면 `features/<service>/hooks/<service>-query-keys.ts`로 분리한다.
- 전역 `queryKeys` 중앙 파일은 기본으로 만들지 않는다. 서비스 경계를 흐리고 교차 의존을 키우기 때문이다.

## fetch wrapper 규칙

```ts
const data = await cardServiceFetchJson<CardRoomListResponse>(
  "/api/v1/card-rooms",
  { method: "GET" },
  "카드방 목록을 불러오지 못했습니다."
);
```

- 직접 `fetch()`를 흩뿌리지 않는다.
- wrapper는 `credentials`, 서버 한국어 `message`, fallback error 같은 반복 처리를 흡수한다.
- 도메인 wrapper가 아직 없으면 먼저 작은 wrapper를 만들고 query/mutation에서 사용한다.

## mutation / invalidation 규칙

```ts
const queryClient = useQueryClient();

return useMutation({
  mutationFn: async (body: UpdateCardDeckBody) => {
    // auth/guest 분기는 이 안에서 처리한다.
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: cardDecksQueryKey(isAuthenticated),
    });
    void queryClient.invalidateQueries({
      queryKey: cardDeckDetailQueryKey(isAuthenticated, deckId),
    });
  },
});
```

- 자동 refetch에 기대지 않는다.
- 한 mutation이 여러 목록/상세에 영향을 주면 모든 key를 나열한다.
- optimistic update는 `onMutate`와 `onError` rollback까지 설계된 경우에만 쓴다.

## 금지 패턴

- `queryKey: ["members"]`처럼 raw 배열을 훅 옵션에 직접 쓰기.
- query/mutation 안에서 도메인 wrapper 없이 직접 `fetch()`를 반복하기.
- mutation 성공 후 관련 목록/상세 key 무효화를 누락하기.
- 게스트/인증 분기를 컴포넌트 사용처마다 복제하기.
- 사용자 노출 에러 메시지를 영문 또는 제각각의 문체로 작성하기.

## 현재 기준 구현

- 카드 덱 목록/상세: `apps/web/src/features/card-service/hooks/use-deck-list.ts`, `use-deck-detail.ts`
- 카드 덱 mutation: `apps/web/src/features/card-service/hooks/use-deck-mutations.ts`
- 카드 서비스 fetch wrapper: `apps/web/src/features/card-service/hooks/card-service-fetch.ts`
