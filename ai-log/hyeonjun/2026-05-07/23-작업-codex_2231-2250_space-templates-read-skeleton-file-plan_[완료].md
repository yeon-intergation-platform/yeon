# space-templates read skeleton file plan

- 작업 목표: 첫 파일럿 read-only 구현 턴의 파일 생성 순서를 문서로 고정
- 작업 범위: main/test 파일 목록, 최소 write set, 차수별 생성 순서, 검증 기준
- 기준: 코드 수정 없이 docs/ai-log만 추가
- 비목표: 실제 Java 파일 생성, Next BFF fetch 전환

## 결정

- 첫 실제 구현 턴은 차수 A만
- 차수 A write set:
  - `SpaceTemplateEntity.java`
  - `SpaceTemplateReadRepository.java`
  - `SpaceTemplateReadRepositoryTests.java`
- controller/service는 다음 턴으로 미룸
