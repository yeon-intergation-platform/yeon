# Spring Google Sheets Import Context Pilot

## 작업내용
- `google-sheets-export-service.ts`의 import coordinator가 직접 조합하는 current member payload / field definitions / snapshot read context를 Spring internal read API로 이동한다.
- 이번 차수는 import conflict 계산 자체를 통째로 옮기지 않고, conflict 판단에 필요한 서버 기준 context 조합만 Spring으로 이동한다.

## 논의 필요
- import conflict 계산까지 같은 차수에 묶을지
- current payload canonicalization을 Next에 둘지 Spring에 둘지
- export read/snapshot read package를 재사용할지 import 전용 read API를 만들지

## 선택지
- 선택지 A: import context read API만 먼저 만든다.
- 선택지 B: import conflict engine 전체를 같이 옮긴다.
- 선택지 C: Google sheet transport를 먼저 옮긴다.

## 추천
- **선택지 A**
- 이유: Next import coordinator에서 가장 큰 남은 source of truth는 기존 members/field definitions/current payload/snapshots 조합이다. 이 read context만 먼저 Spring으로 이동하면 side effect 없이 conflict engine 다음 차수를 준비할 수 있다.

## 사용자 방향
- 추천 기준으로 진행
