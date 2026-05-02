---
name: route-state-contract
description: |
  yeon 신규 화면/페이지에서 상태 저장 위치를 결정하는 3계층 룰. reload-safe 상태는 URL을 SoT, 사용자 작성 중인 큰 데이터는 server-backed draft ID, ephemeral UI만 메모리. 트리거: `apps/web/src/app/**/page.tsx` 신규 작성, `useSearchParams`/`router.replace`/`URLSearchParams` 첫 도입, 또는 새 화면의 URL 쿼리 키 추가.
---

# route-state-contract

## Purpose

새 화면을 만들 때 "어떤 상태를 어디에 둘지"가 매번 다르게 결정되어 reload 시 사용자 입력 손실, 공유 가능한 URL 깨짐, 뒤로가기 비대응이 반복된다. 이 스킬은 모든 신규 화면에 동일한 3계층 결정 룰을 적용한다.

## Use_When

- `apps/web/src/app/**/page.tsx`를 신규 작성할 때
- 기존 화면에 `useSearchParams`, `URLSearchParams`, `router.replace`, `router.push` 첫 도입 시
- "이 상태를 새로고침해도 유지하고 싶다"는 요구가 등장했을 때
- 사용자 입력 중인 데이터를 임시 보관해야 할 때 (긴 폼, 다단계 마법사, 에디터)

## Do_Not_Use_When

- 단순 모달 open/close, hover, focus 같은 순수 UI 상태
- 서버 상태(TanStack Query 데이터) — 이미 캐시가 SoT 역할
- 전역 인증 컨텍스트 — `auth-context` 별도 룰

## Why_This_Exists

notepad에 priority directive로 명시되어 있는 룰: "새 기능/화면 개발 시 route state contract 먼저 정의: reload-safe 상태는 URL source of truth, draft는 server-backed draft ID, ephemeral UI만 memory." 이 룰이 스킬 형태로 없어서 새 화면 만들 때 잊혔다.

## The 3-Layer Rule

### Layer 1: URL (Source of Truth, reload-safe)

- 새로고침 후에도 동일 화면 보여야 하는 상태
- 공유 가능한 링크에 담겨야 하는 상태
- 뒤로가기/앞으로가기에 반응해야 하는 상태

**예시**:

- 카드 학습 진행 인덱스: `?i=3`
- 필터/정렬: `?sort=recent&filter=active`
- 탭 선택: `?tab=summary`
- 페이지네이션: `?page=2`
- 학습 모드: `?mode=review`

**구현 패턴** (`use-deck-play-state.ts` 참조):

```ts
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const rawIndex = parseIndexFromParam(searchParams.get("i"));
const currentIndex = clampIndex(rawIndex, items.length);

const updateIndex = (next: number) => {
  const params = new URLSearchParams(searchParams.toString());
  if (next === 0)
    params.delete("i"); // 기본값은 키 제거
  else params.set("i", String(next));
  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname);
};
```

규칙:

- 기본값은 쿼리에서 **제거** (URL 깔끔하게)
- 입력 검증/clamp는 사용 시점에 (URL은 사용자가 조작 가능)
- replace vs push: 동일 화면 내 상태 전환은 `replace`, 진짜 페이지 이동은 `push`

### Layer 2: Server-backed Draft (사용자 작성 중인 큰 데이터)

- 폼이 길거나 다단계여서 reload 손실 시 사용자 분노 큰 경우
- 자동 저장 + 복구 흐름 필요한 경우

**예시**:

- 카드 일괄 작성 중인 미저장 카드들
- 상담 기록 편집 초안
- 긴 마크다운 노트 작성 중

**구현 패턴**:

1. 서버에 draft endpoint (`POST /api/v1/<entity>/drafts`)로 첫 저장 → `draftId` 받음
2. `draftId`만 URL에 담음 (`?draft=abc123`)
3. 자동 저장은 본문을 `PATCH /api/v1/<entity>/drafts/{id}`
4. publish 시 draft → real entity로 승격

URL에 본문을 담지 않는 이유: 길이 제한, 공유 시 민감 데이터 노출, history 부풀림.

### Layer 3: Memory (ephemeral UI만)

- 새로고침되면 사라져도 무방한 순수 UI 상태

**예시**:

- 모달/다이얼로그 open
- hover/focus
- 카드 뒤집힘 (`isFlipped`) — 학습 진행은 URL이지만 뒷면 노출은 메모리
- 스와이프 노출 (`isDeleteRevealed`) — UI 일시 상태
- 입력 도중 임시 검증 메시지

**구현 패턴**: 평범한 `useState` / `useReducer`.

## Decision Flow

```
새 상태 추가됨
  ↓
새로고침 시 유지 필요? ─── No ──→ Layer 3: useState
  │ Yes
  ↓
공유 링크에 담겨야 함? ─── Yes ──→ Layer 1: URL
  │ No (작성 중인 큰 데이터)
  ↓
                              Layer 2: Server-backed Draft
```

## Anti-Patterns

❌ 학습 인덱스를 `useState(0)`만으로 → 새로고침 시 0으로 리셋
❌ 긴 폼 본문을 `?body=<encoded>`로 URL에 박음 → URL 길이 한계, 공유 시 민감 정보 노출
❌ 모달 open 상태를 URL에 → 뒤로가기 시 모달이 다른 페이지처럼 동작 (이게 의도면 OK, 아니면 noise)
❌ Layer 1과 Layer 3가 중복: 같은 값이 URL과 useState에 모두 있고 동기화 try
❌ `router.push`로 같은 화면 내 상태 전환 → history 폭증

## Verification

- 새 화면 작성 후 다음 시나리오 직접 확인:
  1. 상태 변경 → 새로고침 → 동일 상태로 복구되는가?
  2. URL 복사 → 다른 탭에서 붙여넣기 → 동일 화면 표시되는가?
  3. 뒤로가기 → 직전 상태 복귀하는가?

## References

- 기준 구현: `apps/web/src/features/card-service/hooks/use-deck-play-state.ts`
- notepad priority: "route state contract" directive
