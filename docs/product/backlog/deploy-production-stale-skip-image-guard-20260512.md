# 배포 워크플로 구버전 스킵 및 서비스 이미지 태그 가드

## 1차

### 작업내용
- `main`에 연속 merge가 발생했을 때 오래된 GitHub Actions run이 운영 배포를 수행하지 않도록 `deploy_production` 직전에 최신 `origin/main` SHA 검사를 추가한다.
- 변경되지 않은 서비스에 현재 커밋 SHA 이미지 태그를 강제로 주입하지 않도록 배포 스크립트를 수정한다.
- web만 빌드된 커밋에서 `yeon-backend:sha-... not found`가 발생하지 않게 한다.

### 논의 필요
- 운영 배포 run 자체를 cancel할지, 배포 직전 stale guard로 스킵할지 선택이 필요하다.

### 선택지
1. `main`도 `cancel-in-progress: true`로 변경한다.
2. 빌드는 허용하되 `deploy_production` 직전에 최신 main이 아니면 배포를 스킵한다.

### 추천
- 2번. 운영 배포 중간 취소보다 안전하고, 최신 커밋만 최종 배포된다는 목표를 만족한다.

### 사용자 방향
- 추천 기준으로 진행한다.
