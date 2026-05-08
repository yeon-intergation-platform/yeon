# Spring Member Fields Read Pilot

## 작업내용
- 다음 Spring 파일럿으로 `member-fields read`를 연다.
- 1차 범위는 `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields` 한 경로만 본다.
- 목표는 read source of truth를 Spring으로 옮기고, Next는 auth/BFF만 남기도록 cutover하는 것이다.

## 논의 필요
- overview/system tab field read와 custom tab field read를 같은 lane에 묶을지
- tab 접근 검증을 Spring에서 어디까지 수행할지
- member-field read 응답 shape를 그대로 유지할지

## 선택지
- 선택지 A: custom tab field read만 먼저 옮긴다.
- 선택지 B: overview + custom read를 같이 옮긴다.
- 선택지 C: fields보다 members read를 먼저 옮긴다.

## 추천
- **선택지 A**
- 이유: `member-tabs` 다음 자연스러운 인접 도메인이고, write/reset보다 부작용이 작으며 Spring read 패턴을 재사용하기 쉽다.

## 사용자 방향
- 추천 기준으로 진행
