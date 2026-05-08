# spring local import drafts route pilot

## 작업내용
- local import drafts list/detail/file route를 Spring으로 이동한다.
- analyze/import orchestration은 일단 Next에 유지한다.

## 논의 필요
- 없음. draft route layer만 먼저 thin BFF로 줄이는 작은 lane이다.

## 선택지
1. drafts GET/PATCH/DELETE/file 동시 이동
2. list/detail만 먼저 이동

## 추천
- 1. drafts GET/PATCH/DELETE/file 동시 이동
- 이유: 같은 import_drafts 저장소를 공유해서 함께 옮기는 편이 더 작다.

## 사용자 방향
- 추천 기준으로 진행
