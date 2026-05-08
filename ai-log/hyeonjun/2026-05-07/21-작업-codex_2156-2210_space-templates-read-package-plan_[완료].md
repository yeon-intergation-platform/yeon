# space-templates read package plan

- 작업 목표: Spring 첫 파일럿 read-only 내부 구조를 문서로 고정
- 작업 범위: controller/service/repository/dto/mapper/model 패키지 설계, Next BFF 호출 경계
- 기준: 코드 수정 없이 docs/ai-log만 추가
- 비목표: 실제 Java 클래스 생성, Next route fetch 전환, DB schema 변경

## 결정

- backend root: `world.yeon.backend.space_templates`
- 1차는 `read.*` 하위 패키지로만 시작
- write command 패키지는 이번 단계에서 만들지 않음
- Next는 계속 인증/BFF source of truth 유지
- Spring은 read query source of truth만 먼저 가져감
