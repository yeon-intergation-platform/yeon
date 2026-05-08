# space-templates read repository skeleton

- 작업 목표: 차수 A repository skeleton 구현
- 작업 범위: entity, repository, repository tests, 검증 가능한 최소 migration helper
- 기준: read-only 유지, 현재 Next 동작(list는 사용자 템플릿만) 보존
- 비목표: service/controller/BFF 전환, write API

## 실행 메모

- 구현 중 확인:
  - 현재 Next `listTemplates(currentUser.id)`는 시스템 템플릿이 아니라 **사용자 템플릿만** 반환한다.
  - 상세 조회만 시스템 템플릿 접근을 허용한다.
- 재발방지:
  - 이후 service/controller 구현 시 목록 응답에 시스템 템플릿을 섞지 않는다.
