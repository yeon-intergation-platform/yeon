# mobile process env 타입 보정 백로그 (2026-05-12)

## 1차: Expo 공개 환경변수 타입 보정

### 작업내용

- `apps/mobile/src/services/api-base-url.ts`에서 사용하는 `process.env.NODE_ENV`, `process.env.EXPO_PUBLIC_API_BASE_URL` 타입 오류를 제거한다.
- Node 런타임 의존성을 추가하지 않고 Expo 공개 환경변수 접근에 필요한 최소 ambient type만 모바일 앱 내부에 둔다.
- repo-wide typecheck pre-commit을 다시 통과할 수 있는지 확인한다.

### 논의 필요

- 없음. 현재 오류는 런타임 로직 변경이 아니라 TypeScript ambient type 누락이다.

### 선택지

1. `@types/node`를 모바일 devDependency로 추가한다.
2. 모바일 앱 내부에 Expo에서 실제 사용하는 env 키만 선언하는 최소 타입 파일을 추가한다.
3. `process.env` 접근을 우회한다.

### 추천

- 2번. Expo 앱에 Node 타입 전체를 끌어오지 않고 실제 사용하는 공개 env 키만 선언한다.

### 사용자 방향

- 비어 있음. 추천 기준으로 진행한다.
