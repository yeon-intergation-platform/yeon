# GitHub Actions self-hosted 전용 전환

## 1차

### 작업내용

- GitHub-hosted runner billing/spending-limit 차단으로 시작되지 않는 백엔드 테스트 워크플로를 self-hosted ARM64 runner 전용으로 전환한다.
- `backend-tests.yml`의 `test-and-report`, `karate-flows` job에서 `ubuntu-latest` 사용을 제거한다.
- ARM64 self-hosted runner에서도 Karate가 JDK 21 경로를 찾도록 환경변수 fallback을 보강한다.

### 논의 필요

- 없음. 사용자가 GitHub-hosted runner를 더 이상 사용하지 않겠다고 명시했다.

### 선택지

- A. 문제가 난 `backend-tests.yml`만 self-hosted로 전환한다.
- B. 모든 workflow를 전수 검색하고 hosted runner가 남아 있으면 같이 제거한다.

### 추천

- B. 실제 문제는 `backend-tests.yml` 두 job이지만, 재발 방지를 위해 전체 `.github/workflows`를 검색해 hosted `runs-on` 잔여분이 없는지 확인한다.

### 사용자 방향

- GitHub-hosted runner를 쓰지 않고 오로지 self-hosted runner만 사용한다.
