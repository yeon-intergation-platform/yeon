# Docker Next.js 빌드 캐시 mount 적용 백로그

## 1차 - Next.js 빌드 캐시 mount 추가

### 작업내용

- 루트 `Dockerfile`의 `@yeon/web` 빌드 단계에 BuildKit cache mount를 추가한다.
- 캐시 대상은 monorepo 내 실제 Next 산출 경로인 `/app/apps/web/.next/cache`로 한정한다.
- 런타임 이미지 복사 구조와 standalone output 구조는 변경하지 않는다.

### 논의 필요

- 캐시 mount가 GitHub Actions self-hosted ARM64 runner와 GitHub-hosted AMD64 runner에서 실제로 어느 정도 재사용되는지 확인이 필요하다.
- 효과가 작으면 pruner stage 구조 개선은 별도 계측 뒤 진행한다.

### 선택지

1. `next build` RUN에 `.next/cache` mount만 추가한다.
2. pruner stage의 `COPY . .` 구조까지 함께 바꾼다.
3. 이번에는 코드 변경 없이 workflow 로그 계측만 추가한다.

### 추천

- 1번만 적용한다. 런타임 동작 변경 없이 빌드 캐시 재사용 가능성을 높이는 최소 변경이다.

### 사용자 방향

- 1번만 적용해서 main에 머지한다.
