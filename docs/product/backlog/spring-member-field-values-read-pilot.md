# Spring Member Field Values Read Pilot

## 작업내용
- `member-fields` GET route의 남은 legacy인 `memberId` values 결합 branch를 Spring으로 옮기기 위한 다음 파일럿을 연다.
- 1차 범위는 `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields?memberId=...` 에서
  field definition + member field values 결합 응답을 Spring으로 이전하는 것이다.

## 논의 필요
- values lane이 field definition read를 함께 반환할지, values만 반환할지
- overview lazy backfill을 values lane과 같이 옮길지, 별도 bootstrap/write lane으로 유지할지
- `memberId`가 잘못됐을 때 error를 404로 통일할지

## 선택지
- 선택지 A: definition + values 결합 응답 전체를 Spring으로 옮긴다.
- 선택지 B: values만 Spring으로 옮기고 field definitions는 기존 Spring read 결과를 조합한다.
- 선택지 C: overview lazy backfill까지 한 번에 같이 옮긴다.

## 추천
- **선택지 B**
- 이유: field definition read는 이미 Spring으로 올라갔으니, values lane은 member/field value join만 담당하게 분리하는 편이 원인 분리가 쉽다.

## 사용자 방향
- 추천 기준으로 진행
