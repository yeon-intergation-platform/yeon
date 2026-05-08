# space-templates read service cycle

- 작업 목표: 차수 B(dto/mapper/service) 구현 및 verify
- 작업 범위: read DTO, mapper, service, service test
- 기준: repository 결과를 outward-compatible read DTO로 올림
- 비목표: controller/BFF 전환, write API

## 재발방지 메모

- 목록 응답은 현재 Next 기준으로 사용자 템플릿만 반환한다.
- detail만 시스템 템플릿 접근을 허용한다.
- 이후 controller/BFF 구현에서도 이 규칙을 깨지 않는다.
- Jackson `ObjectMapper.convertValue`로 제네릭 리스트를 변환할 때는
  Spring `ParameterizedTypeReference`가 아니라 Jackson `TypeReference`를 사용한다.
- jdbc 전용 read stack을 도입할 때는 base profile 테스트(contextLoads, security)를 깨지 않도록
  `@Profile(\"jdbc\")` 같은 활성 범위를 먼저 점검한다.
- bootstrap 초기 단계에선 Spring `ObjectMapper` bean 존재를 기본 가정하지 않는다.
  mapper는 필요하면 독립 `ObjectMapper`로 동작하게 만든다.

## Ralph 장기 운영 규칙

- 최종 목표는 Yeon 백엔드를 Spring Boot 중심으로 전부 마이그레이션 완료할 때까지 반복하는 것이다.
- 한 마이크로 작업에서 끝내지 않는다.
- 사이클 고정:
  - 다음 작업 판단
  - 구현
  - 테스트 작성/수정
  - verify
  - 실패 수정
  - 재발방지 규칙 기록
- 컨텍스트 압축 후에도 위 규칙을 먼저 다시 읽고 이어간다.
