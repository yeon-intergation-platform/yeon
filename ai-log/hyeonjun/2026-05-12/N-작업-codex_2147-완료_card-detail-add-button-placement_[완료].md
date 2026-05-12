# 카드 덱 상세 카드 추가 버튼 위치 정리

## 목표

- 카드서비스 덱 상세에서 `+ 카드 추가` 버튼을 카드 목록 문맥으로 이동한다.
- 덱 상세 액션 그룹의 쓸모없는 `YEON` 외부 링크 버튼을 데스크톱/모바일 모두 제거한다.
- 큰 디자인 변경 없이 현재 흰 배경 생산성 UI를 유지한다.

## 변경

- `DeckDetailScreen`의 최상단 단독 카드 추가 버튼을 제거했다.
- 카드 목록 헤더 우측에 카드 추가 버튼을 배치하고 모바일에서는 수량/추가 액션이 같은 줄로 잡히게 했다.
- `DeckDetailHeader`의 `YEON` 링크와 `PLATFORM_HOME_HREF` 의존을 제거했다.
- 백로그 `docs/product/backlog/card-detail-add-button-placement-20260512.md`를 추가했다.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `git diff --check` 성공
- `pnpm --filter @yeon/web build` 성공
