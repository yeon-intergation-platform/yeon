---
name: guest-auth-branching
description: |
  yeon의 게스트(로컬 store) ↔ 인증(서버 API) 분기 패턴. 같은 도메인 인터페이스에서 mutation/query/캐시 무효화/병합 흐름을 통일한다. 트리거: 새 도메인에 게스트 모드 도입, `guestStore` 또는 `useIsAuthenticated` 신규 사용, `merge-guest-*` 컴포넌트/훅 작성.
---

# guest-auth-branching

## Purpose

카드 서비스에는 비로그인 사용자도 즉시 사용 가능하도록 로컬 store 기반 게스트 모드 + 로그인 시 서버 병합이 정착됐다. 이 패턴을 다른 도메인이 도입할 때 매번 다르게 짜이면 (a) 게스트 데이터 유실, (b) 캐시 키 충돌, (c) 병합 race condition이 발생한다.

## Use_When

- 새 도메인에 "비로그인도 즉시 사용 가능"한 기능 추가
- `useIsAuthenticated`를 신규 도메인에서 사용
- `guestStore`, `localStorage` 기반 도메인 데이터 store 신규 작성
- 로그인 시 게스트 데이터 → 서버 병합 흐름 작성 (`merge-guest-*` 컴포넌트)
- query/mutation 안에서 `isAuthenticated` 분기를 도입할 때

## Do_Not_Use_When

- 로그인 필수 기능 (auth-credentials, counseling-workspace, server-only admin) — 분기 자체가 필요 없음
- 단순 prefs/UI 설정만 localStorage에 저장하는 경우
- 모바일 앱 — 로그인 강제 흐름이라 게스트 모드 미적용

## Why_This_Exists

카드 서비스에 정착된 패턴:

- `auth-context`로 `useIsAuthenticated()` 노출
- `guest-card-service-store/`에 로컬 CRUD 함수 (`createGuestDeck`, `deleteGuestCard` 등)
- mutation/query에서 `isAuthenticated`로 분기, 사용처는 동일 인터페이스
- queryKey에 `"auth"|"guest"` 차원 추가 → 두 모드 캐시 분리
- 로그인 시 `merge-guest-dialog` 노출 → 사용자 동의 후 서버로 일괄 업로드 → 로컬 클리어

이게 도메인마다 다르게 작성되면 사고난다.

## Conventions

### 1. auth context는 단일 hook으로 노출

```ts
import { useIsAuthenticated } from "../auth-context";
const isAuthenticated = useIsAuthenticated();
```

- `session`/`user`를 직접 만지는 코드 금지 — 이 hook이 SoT.

### 2. 게스트 store는 도메인별 디렉토리

- 위치: `apps/web/src/lib/guest-<service>-store/`
- 노출 함수: 서버 API와 동일 동사 사용 (`createGuestDeck`, `updateGuestCard`, `deleteGuestDeck`)
- 내부 storage는 localStorage 또는 IndexedDB (도메인 데이터 크기에 따라)
- async 일관성: localStorage 동기지만 함수는 `Promise<T>` 반환 → query/mutation 인터페이스 통일

### 3. mutation/query 안에서 isAuthenticated 분기

- 사용처는 분기 모름. mutation hook이 흡수.

```ts
return useMutation({
  mutationFn: async (body: UpdateBody) => {
    if (isAuthenticated) return await serverFetch(...);
    return await guestStoreUpdate(...);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: entityQueryKey(isAuthenticated) });
  },
});
```

### 4. queryKey에 auth/guest 차원 포함

- 같은 사용자가 로그아웃→로그인 전환 시 캐시 섞임 방지.
- 다른 인증 상태로 다른 데이터 → 다른 queryKey.

```ts
export const entityQueryKey = (isAuthenticated: boolean, ...rest) =>
  ["entity", isAuthenticated ? "auth" : "guest", ...rest] as const;
```

### 5. 로그인 시 게스트 데이터 병합 흐름

- 자동 무음 병합 금지 — 사용자 동의 받기 (`merge-guest-dialog`)
- 다이얼로그 노출 조건: 로그인 직후 + 게스트 데이터 존재
- 동의 → 서버 일괄 upsert (낙관적 batch endpoint)
- 성공 → 로컬 store 클리어, queryClient invalidate(auth queryKey)
- 실패 → 로컬 보존, 사용자에게 재시도 안내

### 6. 게스트 → 인증 전환 시 강조 컬러

- 카드 서비스 룰: `rgba(232,99,10,0.08)` 배경 + `#a3430a` 텍스트
- 병합 다이얼로그·배너에서만 사용

### 7. 게스트 ID 충돌 방지

- 게스트 ID는 `guest_<uuid>` prefix 또는 별도 namespace
- 서버 ID와 절대 겹치지 않도록 prefix 또는 ULID 사용
- 병합 시 guest ID는 서버에서 새 ID 발급, 클라이언트는 매핑 후 store 클리어

### 8. 사이드바/리스트 정렬에서 두 모드 같은 함수

- 게스트/서버 데이터 정렬 함수 동일 (created_at, updated_at 기준)
- 게스트는 `Date.now()` 저장, 서버는 `created_at` ISO string — 표준화 필요

## Decision Flow

```
사용자 액션 (예: 카드 생성)
  ↓
useIsAuthenticated() 호출
  ├── true  → 서버 API 경로 (cardServiceFetchJson + invalidate auth queryKey)
  └── false → 게스트 store 함수 (createGuestDeck + invalidate guest queryKey)

로그인 직후
  ↓
게스트 store에 데이터 있음? ── No ──→ 종료
  │ Yes
  ↓
merge-guest-dialog 노출 ── 사용자 거절 ──→ 종료 (게스트 보존)
  │ 동의
  ↓
서버 batch upsert
  ├── 성공 → 로컬 클리어 + auth queryKey invalidate
  └── 실패 → 로컬 보존 + 재시도 안내
```

## Anti-Patterns

❌ 사용처에서 `if (isAuthenticated)` 직접 분기 → mutation hook 안으로 옮겨야
❌ queryKey가 게스트/인증 모두 동일 → 모드 전환 시 캐시 오염
❌ 로그인 직후 자동 무음 병합 → 사용자 데이터 손실 우려
❌ guest store에 sync 함수 노출 (`getGuestDeck()` 즉시 반환) → 인터페이스 비대칭
❌ guest ID가 서버 ID와 같은 namespace → 병합 시 충돌
❌ 게스트 데이터를 sessionStorage에 저장 → 탭 닫으면 손실
❌ 병합 실패 시 로컬 클리어 후 재시도 → 데이터 소실

## Verification

- 비로그인 → CRUD 정상 → 새로고침 → 데이터 유지
- 로그인 → merge-dialog 노출 → 동의 → 서버에 데이터 존재 + 로컬 비어있음
- 거절 → 로컬 보존 + 다음 로그인 시 다시 노출
- 캐시 검증: React Query devtools에서 auth/guest queryKey 분리 확인

## References

- 룰 SSOT: `.claude/rules/card-service.md`
- 게스트 store 기준: `apps/web/src/lib/guest-card-service-store/`
- auth context: `apps/web/src/features/card-service/auth-context.tsx`
- 병합 다이얼로그: `apps/web/src/features/card-service/components/merge-guest-dialog.tsx`
- mutation 분기: `apps/web/src/features/card-service/hooks/use-deck-mutations.ts`
