# spring import commit pilot

## 작업내용
- integrations import commit orchestration을 Spring으로 이동한다.
- local/googledrive/onedrive import route는 공통 Spring commit 호출만 남긴다.

## 논의 필요
- 없음. analyze 흐름은 그대로 두고 commit만 옮기는 분리 lane이다.

## 선택지
1. local/googledrive/onedrive 공통 commit 동시 이동
2. local만 먼저 이동

## 추천
- 1. 공통 commit 동시 이동
- 이유: 이미 `_shared.ts`가 공용 orchestration을 들고 있어서 한 번에 비우는 편이 더 작다.

## 사용자 방향
- 추천 기준으로 진행
