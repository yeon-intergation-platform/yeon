# 오류 응답 계약 전수 정리 및 web Docker build 안정화

## 목표

- 남은 `code/message` 전용 오류 응답 생산자를 공통 오류 계약으로 통일한다.
- `Build, Push, and Deploy Docker Image #895`에서 `web 최신 보장 실패`로 드러난 web Docker build 실패를 원인 기준으로 고친다.

## 현재 증거

- #895의 최종 실패 지점은 `verify_latest_completion`이지만, 직접 원인은 `build_web` 결과가 `failure`였기 때문이다.
- `build_web` 로그는 Next build가 컴파일을 끝낸 뒤 `Running TypeScript ...`에서 장시간 출력 없이 취소됐다.
- Docker install 중 `msgpackr-extract` optional native build가 Python 부재로 실패 로그를 남겼다.
- Spring 컨트롤러 다수와 Next BFF/API route 일부에 message-only 또는 로컬 `ErrorResponse(code, message)` 생산자가 남아 있다.

## 작업 계획

- Spring 공통 오류 helper에 현재 요청 기반 factory를 추가한다.
- 로컬 `ErrorResponse` record/DTO 사용을 `ApiErrorResponse`로 통일한다.
- Next route helper의 message-only 응답에 code를 넣고 schema 검증을 통과시킨다.
- web Docker 빌드가 타입체크를 중복 실행하지 않도록 하고, native optional dependency 빌드 환경을 보강한다.
- 스캔, 타입체크, 백엔드 테스트, diff 검증 후 PR로 main에 병합한다.

## 완료 내용

- `ApiErrorResponses.ofCurrentRequest(...)`를 추가해 컨트롤러 로컬 오류 응답이 `requestId`를 포함한 공통 `ApiErrorResponse`로 직렬화되게 했다.
- Spring 로컬 `ErrorResponse` 생산자와 Next BFF/API route의 `message` 단독 오류 응답을 공통 오류 계약으로 통일했다.
- web Docker builder에 `python3`, `make`, `g++`를 추가하고, Docker 이미지 빌드에서는 이미 CI에서 검증하는 Next TypeScript 중복 검사를 건너뛰게 했다.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web test`
- `./gradlew test` (`apps/backend`)
- `git diff --check`
- Spring 구형 `ErrorResponse` 생산자 스캔: 매칭 없음
- Web `message` 단독 오류 응답 생산자 스캔: 매칭 없음
- `docker build --target builder --progress=plain --build-arg NODE_MEMORY=3072 --build-arg NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world -t yeon-web-build-check:local .`
