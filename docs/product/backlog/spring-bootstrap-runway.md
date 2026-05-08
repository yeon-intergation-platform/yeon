# Spring Bootstrap Runway Backlog

## 문서 목적
- Yeon의 Spring 중심 전환을 시작하기 전에, **`apps/backend` 기준 bootstrap runway**를 안전하게 확보하기 위한 전용 계획문서다.
- 이 문서는 전체 기능 마이그레이션 계획이 아니다.
- 목표는 **Spring Boot를 로컬에서 확실히 띄우고, 최소 배포 경로를 정하고, health check와 Next 최소 연동 확인 기준을 고정하는 것**이다.

## 현재 결정
- Spring Boot 시작 위치: `apps/backend`
- 작업 브랜치: `migration/spring-platform-core`
- 이번 문서의 범위: bootstrap runway만
- 진행 원칙: 작은 작업 → 검증 → 멈춤 → 다음 프롬프트로 이어가기

## 비목표
- 아직 Spring 코드/Gradle 프로젝트를 생성하지 않는다.
- 아직 `apps/web` 기능 로직을 수정하지 않는다.
- 아직 DB 스키마/마이그레이션을 변경하지 않는다.
- 아직 CI/CD를 수정하지 않는다.
- 아직 전체 기능 마이그레이션 총괄 문서를 새로 쓰지 않는다.

## 완료 기준
이 문서 기준 1차 runway가 완료되었다고 보려면 최소 아래가 충족되어야 한다.

1. `apps/backend`를 Spring Boot 시작 위치로 확정했다.
2. 로컬 기동 목표와 readiness 기준이 문서화되었다.
3. 첫 배포 대상/방식 후보와 결정 순서가 문서화되었다.
4. health check endpoint와 확인 절차가 문서화되었다.
5. Next ↔ Spring 최소 연동 확인 범위가 문서화되었다.
6. 각 단계의 중단 조건과 검증 명령이 문서화되었다.

## 차수 1 — 시작 위치와 역할 고정
- 작업내용: `apps/backend`를 Spring Boot 시작 위치로 확정하고, 기존 `apps/web`, `apps/race-server`, `packages/*`와의 역할 경계를 고정한다.
- 논의 필요: `apps/backend` / `services/backend` / 별도 repo
- 선택지: `apps/backend` 고정
- 추천: 현재 모노레포 패턴을 그대로 따른다.
- 사용자 방향: `apps/backend`로 진행
- 세부 단계:
  1. `apps/backend`를 신규 런타임 앱 위치로 문서화한다.
  2. `apps/web`는 UI/BFF, `apps/backend`는 코어 API 후보로 역할을 구분한다.
  3. `apps/race-server`는 독립 실시간 서버로 남긴다.
  4. `packages/api-contract`, `packages/domain`, `packages/utils` 재사용 원칙을 적는다.
  5. 초기에는 backend가 shared package를 소비하는 방향으로 시작한다고 적는다.
  6. backend가 직접 소유할 영역과 아직 소유하지 않을 영역을 나눈다.
  7. bootstrap 단계에서 auth/DB/배포 세부 기술 선택은 보류한다고 적는다.
  8. 이후 기능 이관은 bootstrap runway 완료 뒤에만 시작한다고 적는다.
  9. 위치 결정 재논의 조건을 적는다.
  10. 이 차수 완료 시 코드 생성은 아직 하지 않는다고 다시 명시한다.

## 차수 2 — 로컬 기동 runway 계획
- 작업내용: Spring Boot를 로컬에서 “실행 가능” 상태까지 가져가기 위한 목표와 검증 기준을 먼저 문서화한다.
- 논의 필요: Gradle wrapper 포함 여부 / local profile naming / 환경변수 전략
- 선택지: Spring Boot 표준 + `dev.local` 유사 profile 전략 검토
- 추천: 첫 실행 기준을 단순하게 두고 외부 연동은 mock 또는 미연결 상태로 시작한다.
- 사용자 방향: 작은 bootstrap만 먼저
- 세부 단계:
  11. 로컬에서 요구할 최소 Java 버전 기준을 정한다.
  12. Gradle wrapper 사용 여부를 정한다.
  13. 기본 app 포트 후보를 정한다.
  14. `dev.local` 성격의 local profile 필요 여부를 정한다.
  15. `.env.example` 또는 동등한 예시 파일 전략을 정한다.
  16. 첫 부팅 시 필요한 최소 환경변수 집합을 정의한다.
  17. readiness 기준을 `HTTP 200 health check`까지로 제한한다.
  18. 로컬에서 아직 연결하지 않을 외부 의존성 목록을 적는다.
  19. 실패 시 우선 확인할 로그/체크 순서를 적는다.
  20. “첫 기동 성공”의 판정 기준을 문장으로 고정한다.

## 차수 3 — 최소 배포 runway 계획
- 작업내용: 기능 배포가 아니라 **빈 Spring Boot 앱이라도 안전하게 올라가는 최소 배포 경로**를 정의한다.
- 논의 필요: 어디에 배포할지 / preview가 필요한지 / main 반영 전 검증 경로
- 선택지: 로컬 → 수동 preview/개발 환경 → health check 확인
- 추천: 기능 없는 상태의 배포 통로를 먼저 확보한다.
- 사용자 방향: 천천히 검증 가능한 경로 우선
- 세부 단계:
  21. 첫 배포 대상 환경 후보를 적는다.
  22. 이미지/빌드 산출 방식 후보를 적는다.
  23. 배포 전 필수 로컬 검증 항목을 적는다.
  24. 배포 후 첫 확인 항목을 `health endpoint`로 제한한다.
  25. 배포 성공 판정 기준을 적는다.
  26. 배포 실패 시 롤백/중단 원칙을 적는다.
  27. backend 단독 배포가 가능한지 확인 항목을 적는다.
  28. 아직 CI 자동화 없이도 가능한 수동 검증 경로를 적는다.
  29. 배포 로그에서 확인할 핵심 신호를 적는다.
  30. 이 차수에서는 DNS, 실사용 트래픽, 인증 연동을 제외한다고 적는다.

## 차수 4 — health check 및 운영 확인 계획
- 작업내용: backend가 “떠 있다”를 객관적으로 판정할 health/observability 최소 기준을 정의한다.
- 논의 필요: `/health` / `/actuator/health` / 커스텀 readiness endpoint
- 선택지: Spring 표준 health 기반
- 추천: 첫 단계는 health check만 확실히 본다.
- 사용자 방향: 복잡한 운영 체계는 뒤로 미룸
- 세부 단계:
  31. health endpoint 형태를 정한다.
  32. readiness와 liveness를 분리할지 보류할지 정한다.
  33. 로컬 확인 명령을 정한다.
  34. 배포 후 확인 명령을 정한다.
  35. 로그에서 startup complete 신호를 정한다.
  36. 실패 상태에서 expected response를 적는다.
  37. 아직 모니터링/알람은 제외한다고 적는다.
  38. 최소 로그 레벨 원칙을 적는다.
  39. secret 없는 health 확인만 먼저 한다고 적는다.
  40. health 기준 충족 시 다음 단계로 넘어가는 조건을 적는다.

## 차수 5 — Next 최소 연동 확인 계획
- 작업내용: 기능 마이그레이션이 아니라, Next가 Spring backend의 존재를 확인할 수 있는 최소 연동 경로만 정의한다.
- 논의 필요: proxy route / server action / 단순 fetch smoke
- 선택지: 가장 얇은 fetch/proxy smoke 확인
- 추천: UI 변경 없는 최소 smoke 연동만 본다.
- 사용자 방향: 연동 확인만 먼저
- 세부 단계:
  41. Next에서 호출할 최소 endpoint 범위를 정한다.
  42. 응답 payload를 health 수준 또는 간단한 ping 수준으로 제한한다.
  43. SSR/CSR 중 어느 경로로 먼저 확인할지 정한다.
  44. 쿠키/인증 없는 호출만 먼저 본다.
  45. CORS 또는 proxy 필요 여부를 확인 항목으로 둔다.
  46. “연동 성공” 판정 기준을 적는다.
  47. 아직 사용자 기능 노출은 하지 않는다고 적는다.
  48. Playwright까지는 가지 않고 수동/간단 smoke 확인만 먼저 한다고 적는다.
  49. 연동 실패 시 분류 기준(network / app boot / route config)을 적는다.
  50. 이 차수 완료 후에만 실제 기능 이관 후보를 논의한다고 적는다.

## 차수 6 — 검증, 중단 조건, 다음 턴 진입 규칙
- 작업내용: bootstrap runway를 실행으로 옮길 때 필요한 검증 및 stop rule을 고정한다.
- 논의 필요: 실패 허용 범위 / 문서 → 코드 전환 시점 / 다음 프롬프트 단위
- 선택지: 단계별 검증 통과 시에만 다음 단계 진입
- 추천: 작은 성공 증거 없으면 절대 다음 단계로 가지 않는다.
- 사용자 방향: 테스트하고 반복
- 세부 단계:
  51. 문서 단계 완료 증거를 정의한다.
  52. 코드 생성으로 넘어갈 진입 조건을 정의한다.
  53. 로컬 기동 실패 시 중단 조건을 정의한다.
  54. 배포 실패 시 중단 조건을 정의한다.
  55. health 실패 시 중단 조건을 정의한다.
  56. Next 연동 실패 시 중단 조건을 정의한다.
  57. 다음 프롬프트당 최대 작업량을 정의한다.
  58. 각 턴 종료 시 남길 보고 포맷을 정의한다.
  59. rollback 또는 되돌림 판단 기준을 정의한다.
  60. runway 완료 후 첫 기능 파일럿 선정 규칙을 정의한다.

## 이번 문서 작성 후 바로 할 일
1. 이 문서를 기준으로 `apps/backend` bootstrap 원칙 SSOT 문서를 만들지 결정한다.
2. 다음 프롬프트에서는 **차수 1의 1~3단계 정도만** 실제 문서화한다.
3. 코드 생성은 차수 2~4의 문서 기준이 더 선명해진 뒤에만 시작한다.
