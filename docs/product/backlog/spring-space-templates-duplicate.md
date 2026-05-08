# Spring space-templates duplicate 이전 백로그

## 차수 1
- 작업내용: `POST /api/v1/space-templates/{templateId}/duplicate`를 Spring internal contract로 이전하고 Next duplicate route의 기존 `duplicateTemplate` 직접 호출을 제거한다.
- 논의 필요: duplicate 접근 권한 규칙을 read/detail과 동일하게 유지할지 여부
- 선택지:
  - A. 본인 소유 템플릿만 복제 허용
  - B. 본인 소유 + 시스템 템플릿 복제 허용
- 추천: B. 현재 Next 구현이 `getAccessibleTemplate`을 사용하므로 시스템 템플릿 복제도 유지해야 계약이 바뀌지 않는다.
- 사용자 방향: B

## 차수 2
- 작업내용: backend duplicate service/controller 테스트, web duplicate route 테스트, runtime smoke evidence를 남긴다.
- 논의 필요: duplicate smoke 이후 cleanup을 포함할지 여부
- 선택지:
  - A. duplicate 생성 확인 후 cleanup까지 포함
  - B. duplicate 생성만 확인
- 추천: A. 템플릿 row를 남기지 않아야 반복 실행 시 상태 오염을 막는다.
- 사용자 방향: A
