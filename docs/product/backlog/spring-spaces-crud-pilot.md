# spaces CRUD Spring pilot

## 작업내용
- `/api/v1/spaces`
- `/api/v1/spaces/[spaceId]`
- Next direct `spaces-service` 의존 제거
- space 생성 시 default system tabs + overview fields bootstrap을 Spring으로 이동

## 논의 필요
- `GET /spaces/{spaceId}`는 기존과 동일하게 owner check 없이 publicId 조회를 유지할지

## 선택지
- A. 기존 동작 유지
- B. owner check 강화

## 추천
- A. 기존 동작 유지

## 사용자 방향
- 추천 기준으로 진행
