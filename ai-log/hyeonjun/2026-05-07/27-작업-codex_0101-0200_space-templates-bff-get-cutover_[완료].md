# space-templates bff get cutover

- 작업 목표: Next BFF GET 2개를 Spring backend fetch로 전환
- 작업 범위: server helper, GET list/detail route 전환, targeted route tests
- 기준: POST/PATCH/DELETE는 기존 Next service 유지
- 비목표: write route 전환, auth migration, client UI 변경

## 재발방지 메모

- GET만 먼저 전환하고 write route는 같은 파일 안에서도 유지할 수 있다.
- Spring internal contract error shape는 Next `jsonError`로 한 번 더 번역한다.
