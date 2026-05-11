# spring dev:all backend run

## 1차

- 작업내용: 루트 `pnpm dev:all`이 web/mobile/race-server와 함께 `apps/backend` Spring Boot 로컬 실행도 포함하도록 현재 스크립트와 실행 전제를 정리하고 최소 수정한다.
- 논의 필요: backend를 항상 같이 띄울지, 옵션 플래그로만 띄울지 결정이 필요하다.
- 선택지:
  - A. `dev:all` 기본값에 backend를 포함한다.
  - B. `dev:all`은 유지하고 `dev:all:with-backend`를 추가한다.
- 추천: A. Spring migration이 진행 중인 현재 기준에서 `dev:all`은 로컬 전체 개발 런타임을 의미하는 편이 자연스럽고, 이미 `apps/backend`가 루트 앱 집합에 포함되어 있어 기본 포함이 맞다.
- 사용자 방향: A

## 2차

- 작업내용: `pnpm dev:all` 실행 시 tmux 기반으로 web / backend / mobile 로그를 세로 3분할 pane에 분리하고, race-server는 별도 window로 분리해 관찰성을 높인다.
- 논의 필요: race-server까지 같은 3-pane 안에 우겨 넣을지, 보조 window로 분리할지 결정이 필요하다.
- 선택지:
  - A. 메인 window는 3-pane(web/backend/mobile)만 두고 race-server는 별도 window로 분리한다.
  - B. 3-pane 중 하나에서 2개 서비스를 함께 실행해 로그를 다시 섞는다.
- 추천: A. 사용자가 불편함을 말한 핵심은 Spring/Next/프론트 로그 분리이므로 이 3개를 메인 화면에서 즉시 보이게 하고, race-server는 필요할 때만 별도 window로 보는 편이 가장 읽기 쉽다.
- 사용자 방향: A

## 3차

- 작업내용: `dev:all` tmux 실행에서 zsh reserved variable 오류를 제거하고, web/backend/mobile/race-server가 기본 포트 충돌 시 자동으로 다음 빈 포트로 올라가도록 보정한다. 동적으로 바뀐 포트는 web↔backend, mobile↔web, web↔race-server 연동 env에도 반영한다.
- 논의 필요: 의존성 미설치(node_modules missing)까지 자동 복구할지, 아니면 포트/로그 UX만 정리할지 결정이 필요하다.
- 선택지:
  - A. 이번에는 포트 충돌/로그 UX만 정리하고 의존성 설치는 수동으로 둔다.
  - B. `pnpm install`까지 자동으로 태운다.
- 추천: A. 설치 자동화는 시간이 길고 부작용 가능성이 있으므로 이번 요청 핵심인 포트 충돌/로그 문제만 안정적으로 정리하는 편이 안전하다.
- 사용자 방향: A

## 4차

- 작업내용: detached tmux 세션에서 `bootstrap` window를 먼저 지워 세션 자체가 사라지는 버그를 막고, `pnpm dev:all`이 사용자 별도 터미널 실행 기준으로 정상 세션을 유지하게 고친다.
- 논의 필요: `bootstrap`을 영구 보존할지, 실제 서비스 window 생성 후 정리할지 결정이 필요하다.
- 선택지:
  - A. cleanup 대상에서 `bootstrap`을 빼고, 서비스 window가 만들어진 뒤에만 안전하게 정리한다.
  - B. `bootstrap`은 남겨 두고 사용자가 수동으로 닫는다.
- 추천: A. 빈 bootstrap window는 최종 화면에 필요 없지만, detached 세션 생성 직후 지우면 세션 자체가 없어지므로 서비스 window 생성 이후에만 정리하는 편이 가장 안전하다.
- 사용자 방향: A

## 5차

- 작업내용: `apps/web/.env`, `apps/mobile/.env`를 원본 `../yeon`에서 rescue 작업트리로 복사하고, `dev:all` 실패 시 pane가 남아 즉시 로그를 볼 수 있게 tmux/파일 로그 보존 구조를 추가한다.
- 논의 필요: 실패 로그를 pane에만 남길지, 파일에도 동시에 남길지 결정이 필요하다.
- 선택지:
  - A. pane 유지 + 파일 로그 동시 저장
  - B. pane 유지 만 하고 파일 로그는 저장하지 않음
- 추천: A. 사용자는 실행 직후 pane에서 보고 싶고, 이후 다시 열어도 확인할 수 있어야 하므로 파일 로그까지 남기는 편이 재현과 공유에 유리하다.
- 사용자 방향: A

## 6차

- 작업내용: `dev:all` 재실행 시 기존 실패 pane/window를 죽이거나 덮어쓰지 않고, 실행마다 새 tmux window 이름을 부여해 이전 실패 로그를 같은 세션에 그대로 보존한다.
- 논의 필요: 같은 세션 안에서 window 이름만 run별로 늘릴지, 세션 자체를 매번 새로 만들지 결정이 필요하다.
- 선택지:
  - A. 세션은 유지하고 `dev-all-<runId>`, `race-server-<runId>`처럼 run별 window만 새로 만든다.
  - B. 매번 완전히 새 세션을 만들어 이전 세션을 사용자가 직접 관리하게 한다.
- 추천: A. 사용자가 "그 터미널 세션에 그대로 실패 로그"를 원하므로 같은 세션 안에서 이전 window를 남겨 두는 편이 가장 직관적이다.
- 사용자 방향: A

## 7차

- 작업내용: `pnpm dev:all`의 backend 실행을 dev-only 자동 재시작 구조로 보강한다. Spring Boot DevTools를 `developmentOnly` 의존성으로 추가하고, backend 실행 시 Gradle `classes --continuous`를 함께 띄워 Java 소스 변경이 classpath 변경으로 반영되도록 한다.
- 논의 필요: DevTools 의존성만 추가할지, `dev:all`에서 classpath 갱신 프로세스까지 같이 관리할지 결정이 필요하다.
- 선택지:
  - A. `developmentOnly spring-boot-devtools`만 추가하고 사용자가 IDE/수동 빌드로 classpath를 갱신한다.
  - B. `dev:all` backend 실행에서 `classes --continuous`와 `bootRun`을 함께 관리해 저장 후 자동 재시작까지 이어지게 한다.
- 추천: B. 사용자가 기대하는 것은 "백엔드 코드 수정 시 로컬 백엔드가 알아서 반영"되는 경험이므로 DevTools만 추가하면 반쪽짜리다. dev-only 보조 스크립트로 classpath 갱신까지 묶는 편이 가장 직접적이다.
- 사용자 방향: B
