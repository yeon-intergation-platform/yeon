---
name: service-context-card-decks
description: 카드/덱 학습 보조 서비스 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. `/card-service`, card deck API, guest deck merge 작업에 사용한다.
user_invocable: true
---

# service-context-card-decks

카드/덱 lane을 맡았으면 이 스킬을 먼저 읽는다. 현재는 공식 기획 문서가 많지 않으므로, 구현 근거를 우선하고 추측으로 제품 방향을 확장하지 않는다.

## 한 줄 서비스 톤

**덱 생성·카드 편집·학습 진입이 먼저 보이는, 흰 배경의 생산성형 카드 학습 UI.**

## 근거 상태

- 기존 근거 부족: 별도 제품/디자인 문서는 확인되지 않았다.
- 현재 구현(`apps/web/src/features/card-service/**`)과 API contract를 근거로 삼는다.
- 없는 기능 기획이나 디자인 시스템을 새로 정의하지 않는다.

## 라우팅 번들

- Routes: `apps/web/src/app/card-service/**`
- Feature: `apps/web/src/features/card-service/**`
- API routes: `apps/web/src/app/api/v1/card-decks/**`
- Contracts: `packages/api-contract/src/card-decks.ts`, `packages/api-contract/src/card-deck-merge-guest.ts`
- Supporting storage/server code: `apps/web/src/lib/guest-card-service-store*`, card-deck 관련 server/repository 파일은 `rg "card-deck|cardDeck|card-service" apps/web/src packages`로 확인한다.

## 먼저 읽을 근거

1. `apps/web/src/features/card-service/card-service-home.tsx`
2. `apps/web/src/features/card-service/deck-detail-screen.tsx`
3. `apps/web/src/features/card-service/deck-play-screen.tsx`
4. `packages/api-contract/src/card-decks.ts`
5. `packages/api-contract/src/card-deck-merge-guest.ts`

## 기능 기준

- 주요 행동은 덱 생성, 카드 추가/일괄 추가, 덱 상세 편집, 카드 플레이/학습, 게스트 덱 계정 병합이다.
- 게스트 상태와 로그인 상태의 데이터 경계가 중요하다. 병합 UX와 API contract를 함께 확인한다.
- 덱/카드 개수, 업데이트 일자, empty/loading/error 상태를 명확히 보여준다.

## 디자인 기준

- 현재 구현 기준은 흰 배경, 검정 CTA, 얇은 회색 보더, 절제된 카드 리스트다.
- 색은 병합 안내/오류/상태처럼 사용자가 행동해야 하는 신호에 제한한다.
- 카드 자체보다 “다음 행동”이 먼저 보여야 한다: 새 덱, 카드 추가, 학습 시작.
- 카드 안에 카드가 과하게 중첩되는 구조를 피한다.

## 팀 작업 체크

- web UI 변경은 guest/local storage 흐름과 authenticated API 흐름을 함께 확인한다.
- API contract 변경은 `packages/api-contract`와 API route/client hook을 함께 갱신한다.
- 문서 근거가 부족한 영역은 “기존 근거 부족”으로 표시하고, 제품 방향을 추측하지 않는다.
