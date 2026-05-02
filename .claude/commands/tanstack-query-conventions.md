---
name: tanstack-query-conventions
description: |
  yeon 저장소의 TanStack Query 사용 컨벤션. queryKey 함수화, isAuthenticated 분기, 한국어 에러 메시지, invalidateQueries 시점을 통일한다. 트리거: 파일이 `@tanstack/react-query`를 임포트하거나 `useMutation`/`useQuery`/`useQueryClient`를 신규 작성/수정할 때.
---

# tanstack-query-conventions

## Purpose

yeon 코드베이스에서 server-state 훅(`use*Query`/`use*Mutation`)이 도메인마다 다르게 작성되어 캐시 무효화 누락, queryKey 충돌, 에러 메시지 비표준이 반복된다. 이 스킬은 카드 서비스에 정착된 패턴을 표준으로 고정한다.

## Use_When

- 신규 또는 수정 파일이 `from "@tanstack/react-query"`를 임포트할 때
- `useMutation`, `useQuery`, `useQueryClient`, `useInfiniteQuery`를 신규 작성할 때
- `queryKey`를 정의/사용/무효화할 때
- 게스트(로컬 store) ↔ 인증(서버 API) 분기를 query/mutation 안에서 처리해야 할 때

## Do_Not_Use_When

- 단순 `useState`/`useReducer`만 쓰는 클라이언트 상태 코드
- TanStack Query 사용하지 않는 풀 클라이언트 컴포넌트
- 서버 컴포넌트(RSC), Route Handler, Server Action — 이쪽은 `server-services` 룰 적용

## Why_This_Exists

같은 도메인에 `useUpdateDeck`과 `useDeleteDeck`이 따로 작성되며, 한쪽은 `invalidateQueries`를 호출하지 않는 등 캐시 정합성 사고가 반복됐다. queryKey가 raw 문자열로 흩어지면 typo로 무효화 누락이 발생한다. 표준화로 이런 류 버그를 사전 차단한다.

## Conventions

### 1. queryKey는 함수로 export

- raw `["card-decks"]` 배열을 컴포넌트에 흩지 않는다.
- `apps/web/src/features/<service>/hooks/use-*.ts`에 `<entity>QueryKey()` 함수를 export 한다.

```ts
// 좋음
export const cardDecksQueryKey = (isAuthenticated: boolean) =>
  ["card-decks", isAuthenticated ? "auth" : "guest"] as const;

export const cardDeckDetailQueryKey = (
  isAuthenticated: boolean,
  deckId: string
) => [...cardDecksQueryKey(isAuthenticated), deckId] as const;

// 나쁨 — 무효화에서 typo 위험
queryClient.invalidateQueries({ queryKey: ["card-decks"] });
```

### 2. mutation 네이밍은 `use<Verb><Entity>`

- `useUpdateDeck`, `useDeleteCard`, `useCreateRecord`처럼 동사+엔티티.
- 한 mutation은 한 책임만 (CRUD 합쳐서 `useDeckMutation()` 같은 거대 훅 금지).

### 3. mutationFn 내부에서 isAuthenticated 분기

- 게스트/인증을 동일 인터페이스로 노출. 사용처가 분기 알 필요 없게.

```ts
return useMutation({
  mutationFn: async (body: UpdateCardDeckBody) => {
    if (isAuthenticated) {
      const data = await cardServiceFetchJson<{ deck: CardDeckDto }>(
        `/api/v1/card-decks/${deckId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
        "덱을 수정하지 못했습니다."
      );
      return data.deck;
    }
    return updateGuestDeck(deckId, body);
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

### 4. fetch는 도메인 fetch wrapper 경유

- 직접 `fetch()` 호출 금지. `<service>-fetch.ts`(예: `card-service-fetch.ts`)에 정의된 `cardServiceFetchJson<T>(url, init, errorMessage)` / `cardServiceFetchVoid` 사용.
- wrapper가 한국어 에러 메시지, 401 redirect, content-type 검사 등을 일원화한다.

### 5. invalidateQueries는 onSuccess에서 명시 호출

- 자동 refetch 의존하지 않는다. 어떤 키가 무효화되는지 코드로 드러낸다.
- 한 mutation이 여러 query에 영향 → 영향받는 모든 키를 나열.
- 반환값 무시: `void queryClient.invalidateQueries(...)`

### 6. 에러 메시지는 한국어 + "~지 못했습니다" 형태

- 사용자 노출 메시지: `"덱을 삭제하지 못했습니다."`, `"카드를 추가하지 못했습니다."`
- fetch wrapper 세 번째 인자로 전달, mutationFn 안에서 throw 하지 않는다.

### 7. queryFn은 reactive deps만 받는다

```ts
return useQuery({
  queryKey: cardDeckDetailQueryKey(isAuthenticated, deckId),
  queryFn: async () => cardServiceFetchJson<CardDeckDetailResponse>(...),
  enabled: deckId.length > 0,
});
```

### 8. optimistic update는 명시적으로 onMutate + onError 롤백

- 부분 작업으로 도입하지 않는다. 도입하면 onError에서 이전 캐시 복원 필수.
- 모든 mutation에 적용할 필요 없음 — 사용자 인지 지연이 큰 경우만.

## Anti-Patterns

❌ `queryKey: ["deck", id]` — raw 배열을 컴포넌트에 흩뿌림
❌ `mutationFn: () => fetch(...)` — wrapper 미경유
❌ onSuccess 누락 → 캐시 stale
❌ `try { await fetch } catch { setError("실패") }` — 에러 표현 wrapper로 통일해야 함
❌ 영문 에러 메시지 (`"Failed to delete deck"`)
❌ `useQuery`의 `select`로 derive 하지 않고 컴포넌트에서 매번 `data?.items?.filter(...)`

## Verification

- 작성한 mutation의 `onSuccess`에서 영향받는 모든 queryKey가 invalidate되는지 직접 확인
- `grep -r "queryKey: \[" apps/web/src/features/<service>/` — raw 배열이 남아있지 않은지

## References

- 기준 구현: `apps/web/src/features/card-service/hooks/use-deck-mutations.ts`
- queryKey 패턴: `apps/web/src/features/card-service/hooks/use-deck-list.ts`
- fetch wrapper: `apps/web/src/features/card-service/hooks/card-service-fetch.ts`
