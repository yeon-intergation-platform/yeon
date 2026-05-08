# Spring Google Sheets Import Evaluation Pilot

## 작업내용
- `google-sheets-export-service.ts` import coordinator에 남은 conflict evaluation / canonical payload / planned create-update 계산을 Spring internal API로 이동한다.
- 이번 차수는 mutation 실행 자체는 Next에 남기고, Spring은 blocked/applied 판정과 실행 계획만 반환한다.

## 논의 필요
- evaluation 결과에 planned creates/updates를 포함할지
- blocked/applied decision까지 Spring이 가질지
- mutation orchestration까지 같은 차수에 묶을지

## 선택지
- 선택지 A: evaluation + planned actions만 Spring으로 이동한다.
- 선택지 B: mutation orchestration까지 같이 이동한다.
- 선택지 C: Google transport를 먼저 이동한다.

## 추천
- **선택지 A**
- 이유: read context는 이미 Spring으로 옮겼고, 이제 남은 가장 큰 domain logic은 conflict engine이다. 이 부분만 먼저 옮기면 Next는 sheet read + planned action apply + re-export 수준으로 줄어든다.

## 사용자 방향
- 추천 기준으로 진행
