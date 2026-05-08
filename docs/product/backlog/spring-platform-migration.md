# Spring Platform Migration Backlog

## 문서 목적
- Yeon을 **Spring 중심 백엔드 구조**로 장기 전환하기 위한 실행 백로그다.
- 이 문서는 한 번에 모두 수행하지 않는다.
- **여러 번의 프롬프트로 나누고, 매 턴 작은 작업만 수행한 뒤 멈춘다.**

## 현재 결정
- 전환 방향: Next.js 중심 서버 혼합 구조 → Spring 중심 구조
- 작업 브랜치: `migration/spring-platform-core`
- 기본 원칙: 큰 재작성 금지, 작은 문서/설계/검증 단위로 쪼개기
- 목표 기간: 3~6개월 이상 장기 리플랫폼 전제
- 기본 진행: `추천` 기준으로 진행

## 참고 원본
- `../study-platform-mvp/skills_context/SHARED/README.md`
- `../study-platform-mvp/skills_context/SHARED/ai-surface-policy.md`
- `../study-platform-mvp/skills_context/SHARED/local-backend-run.md`
- `../study-platform-mvp/skills_context/SHARED/local-playwright-e2e.md`
- `../study-platform-mvp/skills_context/SHARED/study-platform-backend-context.md`
- `../study-platform-mvp/skills_context/SHARED/study-platform-backend-verify.md`
- `../study-platform-mvp/skills_context/SHARED/study-platform-file-upload.md`
- `../study-platform-mvp/skills_context/SHARED/prd-to-frd-v2/README.md`
- `../study-platform-mvp/.claude/commands/SHARED/prd-to-frd-v2.md`
- `../study-platform-mvp/skills_context/PERSONAL/stack-pr.md`

## 진행 규칙
1. 한 프롬프트에 가능한 한 **한 차수 또는 1~3개 세부 단계**만 처리한다.
2. 문서/설계/코드/검증을 섞지 말고 작게 나눈다.
3. 작업 후에는 변경 파일, 검증 결과, 다음 추천 단계를 짧게 남기고 멈춘다.
4. migration 브랜치에서 작업하되, 기존 미커밋 변경은 건드리지 않는다.
5. SHARED 문서는 Yeon용 SSOT를 만들고 wrapper는 얇게 유지한다.

## 총 단계 수
- 30차수 × 10단계 = **300단계**

## 1차 — Spring 전환 원칙과 산출물 SSOT 고정
- 작업내용: 전환의 목표, 중단 조건, migration branch 운영 규칙을 고정한다.
- 논의 필요: 전환 원칙 문서 분리 / backlog에 포함 / ai-log에만 임시 기록
- 선택지: backlog + 후속 SSOT 문서 분리
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  1. migration 브랜치 운영 원칙을 문서화한다.
  2. 전환 성공 기준을 기능/운영/조직 관점으로 정의한다.
  3. 이번 전환의 비목표를 명시한다.
  4. Next.js 잔존 역할 초안을 정의한다.
  5. Spring 최종 책임 범위 초안을 정의한다.
  6. 중단/롤백 판단 기준을 정의한다.
  7. 여러 프롬프트로 나누는 작업 규칙을 확정한다.
  8. 차수별 완료 정의(DoD)를 공통 템플릿으로 만든다.
  9. 문서/코드/검증 산출물 폴더 맵을 정의한다.
  10. 전체 300단계 계획을 검토하고 동결한다.

## 2차 — 현재 Yeon 구조 실측 인벤토리
- 작업내용: apps/web, apps/race-server, packages/*, API/DB/인증 자산을 실측한다.
- 논의 필요: 수동 인벤토리 / 스크립트 추출 / 혼합 방식
- 선택지: 스크립트 추출 + 수동 보정
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  11. apps/web 라우트와 route handler 목록을 추출한다.
  12. apps/web/src/server 서비스와 레포지토리 현황을 추출한다.
  13. DB 스키마와 migration 개수를 목록화한다.
  14. packages/api-contract 사용처를 찾는다.
  15. packages/api-client 사용처를 찾는다.
  16. packages/domain 실제 도메인 범위를 확인한다.
  17. 모바일이 의존하는 API 목록을 정리한다.
  18. race-server 의존 경계를 정리한다.
  19. 외부 연동(Google/OneDrive/OpenAI 등) 목록을 정리한다.
  20. 전환 대상/비대상 초안 표를 만든다.

## 3차 — 도메인 분류와 우선순위 고정
- 작업내용: BFF, 웹 전용, 코어 백엔드 도메인을 분리한다.
- 논의 필요: 기능명 기준 분류 / 트래픽 기준 / 복잡도 기준
- 선택지: 복잡도 + 데이터 정합성 우선
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  21. auth 도메인 범위를 분리한다.
  22. users/spaces/members 범위를 분리한다.
  23. counseling-records 범위를 분리한다.
  24. integrations/file-analysis 범위를 분리한다.
  25. card-decks 범위를 분리한다.
  26. typing-service 범위를 분리한다.
  27. life-os 범위를 분리한다.
  28. public-check 범위를 분리한다.
  29. chat-service 범위를 분리한다.
  30. 1차/2차/3차 이관 우선순위를 확정한다.

## 4차 — Migration branch / stack 작업 체계 설계
- 작업내용: 큰 전환을 작은 브랜치/PR 스택으로 쪼개는 규칙을 만든다.
- 논의 필요: 단일 장수 브랜치 / stacked branch / 기능별 병렬 브랜치
- 선택지: migration 메인 브랜치 + 작은 stack 병행
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  31. migration 메인 브랜치의 역할을 정의한다.
  32. 하위 stack 브랜치 네이밍 규칙을 정한다.
  33. 각 stack의 최대 diff 기준을 정한다.
  34. 문서 stack과 코드 stack 분리 규칙을 정한다.
  35. 검증 실패 시 stack 되돌림 규칙을 정한다.
  36. 병렬 작업 시 충돌 회피 규칙을 정한다.
  37. PR 본문 공통 템플릿 초안을 만든다.
  38. 작업자별 ai-log 연결 규칙을 정의한다.
  39. merge 타이밍 규칙을 정한다.
  40. stack 운영 예시 3개를 만든다.

## 5차 — Spring 백엔드 신규 리포/모듈 뼈대 계획
- 작업내용: 백엔드 저장소 또는 모듈 레이아웃을 결정한다.
- 논의 필요: 모노레포 내부 추가 / 별도 repo / 하이브리드
- 선택지: 초기에는 모노레포 내부 또는 인접 repo 설계 문서화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  41. backend repo 위치 후보를 비교한다.
  42. Gradle 멀티모듈 여부를 결정한다.
  43. domain/application/infra/web 레이어 초안을 만든다.
  44. global common 모듈 범위를 정의한다.
  45. OpenAPI/validation/mapper 기본 스택을 결정한다.
  46. JPA/QueryDSL/MyBatis 사용 원칙을 정한다.
  47. 테스트 모듈 구조를 설계한다.
  48. 로컬 실행 profile 전략을 설계한다.
  49. 환경변수 이름 규칙을 설계한다.
  50. 초기 bootstrap 문서의 목차를 만든다.

## 6차 — Spring 코드 컨벤션과 기본 아키텍처
- 작업내용: 서비스/리포지토리/트랜잭션/예외/DTO 규칙을 만든다.
- 논의 필요: 기존 team 규칙 재사용 / 새 규칙 설계 / 혼합
- 선택지: 새 규칙 설계 후 기존 관례 일부 흡수
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  51. 패키지 네이밍 규칙을 정한다.
  52. Controller 책임 범위를 정한다.
  53. Application service 책임 범위를 정한다.
  54. Domain service/entity/value object 규칙을 정한다.
  55. Repository 추상화 수준을 정한다.
  56. 트랜잭션 어노테이션 기본 정책을 정한다.
  57. 예외 코드/에러 응답 포맷 규칙을 정한다.
  58. record DTO 사용 기준을 정한다.
  59. Mapper 사용 기준을 정한다.
  60. 로그/민감정보 마스킹 규칙을 정한다.

## 7차 — Yeon용 AI surface 구조 설계
- 작업내용: study-platform-mvp의 skills_context 구조를 Yeon에 맞게 들여올 설계를 만든다.
- 논의 필요: 현재 docs 기반 유지 / skills_context 추가 / 전면 재구성
- 선택지: skills_context/SHARED 추가 + wrapper 얇게 유지
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  61. Yeon에 skills_context 루트 도입 필요성을 문서화한다.
  62. SHARED와 PERSONAL 추적 정책을 정의한다.
  63. .claude/.codex wrapper 역할을 정리한다.
  64. 기존 docs/agent-rules와 중복 관계를 정리한다.
  65. SSOT 우선순위를 정의한다.
  66. 동기화 스크립트 필요 여부를 판단한다.
  67. skills_context 폴더 초안 구조를 설계한다.
  68. wrapper 생성/갱신 규칙을 정한다.
  69. 리뷰 대상과 로컬 전용 대상 분리 규칙을 정한다.
  70. Yeon AI surface 개편 ADR 초안을 만든다.

## 8차 — study-platform-mvp SHARED context 전체 이관 계획
- 작업내용: 좋은 SHARED context를 목록화하고 Yeon용으로 바꿀 순서를 정한다.
- 논의 필요: 필요 문서만 선별 / SHARED 전부 초벌 이관 / 요청별 이관
- 선택지: 전부 목록화 후 작은 단위 선별 이관
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  71. study-platform-mvp SHARED 전체 파일 인벤토리를 만든다.
  72. 각 파일의 Yeon 적합도를 3단계로 분류한다.
  73. 즉시 이관 후보를 뽑는다.
  74. 개념만 차용할 후보를 뽑는다.
  75. 버리거나 보류할 후보를 뽑는다.
  76. 파일별 owner를 지정한다.
  77. wrapper 필요 여부를 판정한다.
  78. 검증 스크립트 재사용 가능성을 판정한다.
  79. Yeon 경로 매핑표를 만든다.
  80. 이관 순서를 확정한다.

## 9차 — prd-to-frd-v2 Yeon 개편 계획
- 작업내용: trace-locked planning pipeline을 Yeon용으로 바꿀 계획을 세운다.
- 논의 필요: 원본 거의 유지 / 일부 템플릿만 사용 / 전면 Yeon화
- 선택지: 구조 유지 + 도메인/검증만 Yeon화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  81. prd-to-frd-v2 구조와 계약 파일을 분석한다.
  82. Yeon에 필요한 audit/implementation 산출물을 정의한다.
  83. planning_ir에 들어갈 필수 필드를 정의한다.
  84. Yeon용 conditional artifact 규칙을 설계한다.
  85. Yeon용 required columns 규칙을 설계한다.
  86. fixture 재사용 여부를 판단한다.
  87. Yeon 예시 fixture 범위를 정한다.
  88. 검증기 재사용/포팅 범위를 정한다.
  89. wrapper 문구와 호출 규칙을 설계한다.
  90. 첫 적용 대상 backlog를 정한다.

## 10차 — ai-surface-policy Yeon 개편 계획
- 작업내용: AI surface 추적 정책을 Yeon에 맞게 고친다.
- 논의 필요: docs 중심 유지 / skills_context 중심 전환 / 혼합
- 선택지: 혼합 후 점진 전환
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  91. 현재 추적 중인 .claude/.codex 자산을 분류한다.
  92. generated surface와 tracked surface 경계를 정한다.
  93. SHARED policy 문서 목차를 정의한다.
  94. PERSONAL 정책 반영 범위를 정한다.
  95. wrapper 필수 구조를 정의한다.
  96. 문서 복제 금지 규칙을 명문화한다.
  97. Yeon 저장소 ignore 정책 영향을 확인한다.
  98. bin/sync-skills.sh와의 연계를 설계한다.
  99. 리뷰 체크리스트를 설계한다.
  100. 정책 초안 리뷰 절차를 만든다.

## 11차 — study-platform-backend-context Yeon 개편 계획
- 작업내용: Spring 백엔드 팀 공용 context를 Yeon용으로 설계한다.
- 논의 필요: Spring 표준 직접 작성 / 기존 문서 기반 개편 / 혼합
- 선택지: 기존 문서 골격 기반 개편
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  101. Yeon 백엔드 기술 스택 후보를 확정한다.
  102. profile 정책(dev.local/qa/prod 등) 초안을 만든다.
  103. package 구조 초안을 만든다.
  104. controller/service/repository 패턴을 정의한다.
  105. 보안/문서화 도구 선택을 기록한다.
  106. 쿼리 기술 선택 기준을 정한다.
  107. 테스트 스택 기준을 정한다.
  108. 로깅/예외/DTO 규칙을 정한다.
  109. legacy Next 자산과 매핑 규칙을 정한다.
  110. Yeon backend context 초안 문서 목차를 만든다.

## 12차 — study-platform-backend-verify Yeon 개편 계획
- 작업내용: 백엔드 검증 게이트를 Yeon용으로 만든다.
- 논의 필요: 기본 compile/test만 / 품질 게이트 체계화 / 과도한 체크
- 선택지: 게이트 체계화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  111. Yeon backend 최소 검증 명령을 정한다.
  112. 컴파일 게이트를 정의한다.
  113. 단위 테스트 게이트를 정의한다.
  114. API integration contract 게이트를 정의한다.
  115. 인증/권한 visibility 게이트를 정의한다.
  116. 파일 업로드/외부 연동 게이트를 정의한다.
  117. 시간/정산/마감 정책 게이트 필요 여부를 판정한다.
  118. 증거 보고 포맷을 정의한다.
  119. PR 본문 연결 방식을 정한다.
  120. 실패 시 blocker 보고 규칙을 정한다.

## 13차 — local-backend-run Yeon 개편 계획
- 작업내용: Spring 로컬 실행 컨텍스트를 Yeon 환경에 맞게 만든다.
- 논의 필요: docker-compose 중심 / run script 중심 / IDE 중심
- 선택지: run script 중심 + 문서 보강
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  121. Yeon backend 로컬 포트 정책을 정한다.
  122. dev.local profile 이름을 정한다.
  123. 환경변수 예시 파일 전략을 정한다.
  124. run-local.sh 또는 대체 스크립트 위치를 정한다.
  125. 기동 readiness 확인 방식을 정한다.
  126. 로컬 seed/DDL 전략을 정한다.
  127. 개인 overlay profile 허용 방식을 정한다.
  128. frontend 연계 시 표준 URL을 정한다.
  129. AI가 띄운 프로세스 cleanup 정책을 정한다.
  130. Yeon local backend run 문서 목차를 만든다.

## 14차 — local-playwright-e2e Yeon 개편 계획
- 작업내용: 브라우저 E2E를 Next+Spring 전환 구조에 맞게 바꾼다.
- 논의 필요: Playwright 최소 smoke / 통합 회귀 / 시나리오별 계층화
- 선택지: 최소 smoke에서 시작해 계층화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  131. E2E에서 사용할 backend URL 정책을 정한다.
  132. E2E에서 사용할 frontend URL 정책을 정한다.
  133. Next와 Spring 동시 기동 절차를 정한다.
  134. 테스트 계정/seed 전략을 정한다.
  135. headed/headless 기본값을 정한다.
  136. 로그인/세션 시나리오를 정의한다.
  137. 핵심 업무 시나리오 smoke 목록을 만든다.
  138. 산출물(trace/screenshot) 저장 정책을 정한다.
  139. 실패 분류 체계를 정한다.
  140. Yeon local Playwright E2E 문서 목차를 만든다.

## 15차 — study-platform-file-upload Yeon 개편 계획
- 작업내용: 파일 업로드 아키텍처를 Yeon 도메인에 맞게 재설계한다.
- 논의 필요: 현재 방식 유지 / two-step 업로드 / 직접 multipart 단일화
- 선택지: 도메인별 판단 전 two-step 우선 검토
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  141. 현재 counseling/audio/import 업로드 흐름을 인벤토리한다.
  142. 도메인별 binary upload 유형을 분류한다.
  143. upload URL 분리 필요성을 판단한다.
  144. object storage 사용 정책을 정한다.
  145. local/prod 업로더 분기 정책을 정한다.
  146. 파일 메타데이터 저장 구조를 설계한다.
  147. 후처리 이벤트 필요 여부를 정한다.
  148. 보안/확장자/사이즈 검증 정책을 정한다.
  149. 응답 DTO 표준 형식을 정한다.
  150. Yeon file upload context 문서 목차를 만든다.

## 16차 — PERSONAL stack-pr 개편 방향 결정
- 작업내용: 개인 stack PR workflow를 Yeon에서 어떻게 쓸지 결정한다.
- 논의 필요: PERSONAL 유지 / SHARED 승격 / 사용 안 함
- 선택지: PERSONAL 유지 + 필요한 부분만 SHARED 지침화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  151. Yeon의 main-only 정책과 stack PR 충돌점을 찾는다.
  152. migration branch 전용 stack 규칙을 설계한다.
  153. 개인 로컬 workflow와 팀 공용 workflow를 분리한다.
  154. PR base 전략(main vs migration branch)을 정한다.
  155. 문서 stack 예시를 만든다.
  156. 코드 stack 예시를 만든다.
  157. 검증 evidence 템플릿을 정한다.
  158. gh CLI 사용 규칙을 정한다.
  159. merge 금지/허용 조건을 정한다.
  160. Yeon용 stack workflow 문서 위치를 결정한다.

## 17차 — API 계약 재설계 계획
- 작업내용: Next route handler 계약을 Spring API 계약으로 재정의한다.
- 논의 필요: OpenAPI 우선 / Zod 우선 / 양방향 병행
- 선택지: OpenAPI + TS contract 병행
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  161. 공개 API와 내부 BFF API를 분리한다.
  162. 기존 /api/v1 엔드포인트를 목록화한다.
  163. 도메인별 canonical API를 지정한다.
  164. 응답 래퍼 표준을 정한다.
  165. 에러 응답 표준을 정한다.
  166. pagination/검색/정렬 표준을 정한다.
  167. 버전 전략(v1 유지 여부)을 정한다.
  168. OpenAPI 생성 방식과 산출 위치를 정한다.
  169. TS client 생성 또는 수동 유지 전략을 정한다.
  170. API 계약 전환 체크리스트를 만든다.

## 18차 — 인증/세션 이관 설계
- 작업내용: 로그인, 세션, 모바일 인증을 Spring 중심으로 옮길 설계를 만든다.
- 논의 필요: Next 세션 유지 / Spring 토큰 중심 / 하이브리드
- 선택지: 하이브리드로 점진 이관
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  171. 현재 웹 로그인 흐름을 시퀀스로 그린다.
  172. 현재 모바일 인증 흐름을 시퀀스로 그린다.
  173. 세션 source of truth 위치를 결정한다.
  174. 쿠키/토큰 저장 전략을 정한다.
  175. refresh 토큰 정책을 정한다.
  176. SSR 보호 페이지 연계 방식을 정한다.
  177. 로그아웃/만료 처리 정책을 정한다.
  178. 권한/역할 모델 초안을 만든다.
  179. 인증 이관 순서를 정한다.
  180. 인증 회귀 테스트 목록을 만든다.

## 19차 — 사용자/공간/멤버 코어 도메인 설계
- 작업내용: users/spaces/members/public-check를 Spring 코어로 재설계한다.
- 논의 필요: 현 구조 유지 / aggregate 재구성 / 최소 추출
- 선택지: aggregate 재구성 후 최소 추출
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  181. users 도메인의 핵심 상태를 정의한다.
  182. spaces aggregate 경계를 정의한다.
  183. members/member-fields/member-tabs 관계를 정의한다.
  184. public-check 세션 수명주기를 정의한다.
  185. template/duplicate 규칙을 정의한다.
  186. sheet-export와의 연결 지점을 정의한다.
  187. 권한 모델을 반영한다.
  188. 읽기/쓰기 API를 나눈다.
  189. 트랜잭션 경계를 정의한다.
  190. 마이그레이션 우선순위를 정한다.

## 20차 — 상담 기록 코어 도메인 설계
- 작업내용: counseling-records, transcript, analyze 흐름을 Spring 중심으로 재설계한다.
- 논의 필요: 현재 흐름 유지 / 이벤트 기반 강화 / 완전 배치 분리
- 선택지: 현재 흐름 유지 + 이벤트 기반 강화
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  191. 상담 기록 생성/수정 상태 전이를 정의한다.
  192. audio 업로드와 저장 흐름을 정의한다.
  193. transcribe 시작/완료/실패 상태를 정의한다.
  194. analyze 시작/완료/재시도 상태를 정의한다.
  195. segments 저장 규칙을 정의한다.
  196. 채팅/AI 보조 기능 경계를 정의한다.
  197. 학생 연결 관계를 정의한다.
  198. 감사로그 필요 범위를 정의한다.
  199. 장기 보관/삭제 정책을 정의한다.
  200. 1차 추출 API 범위를 정한다.

## 21차 — 외부 연동/가져오기 도메인 설계
- 작업내용: Google Drive, OneDrive, local import, OCR/preview 흐름을 설계한다.
- 논의 필요: 도메인별 개별 구현 / 공통 import pipeline / 혼합
- 선택지: 공통 import pipeline
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  201. OAuth provider 공통 상태 모델을 정의한다.
  202. import draft 상태 모델을 정의한다.
  203. file analysis/preview 공통 인터페이스를 정의한다.
  204. provider별 adapter 경계를 정의한다.
  205. retry/backoff 정책을 정의한다.
  206. webhook/callback 보안 정책을 정의한다.
  207. 대용량 파일 처리 정책을 정의한다.
  208. 실패 사유 표준화를 정의한다.
  209. 사용자 알림/진행률 노출 방식을 정의한다.
  210. 1차 이관 provider를 정한다.

## 22차 — 비동기 처리/배치/이벤트 설계
- 작업내용: Spring으로 옮길 때 필요한 job/queue/event 전략을 정한다.
- 논의 필요: 동기 우선 / 이벤트 최소 도입 / 큐 적극 도입
- 선택지: 동기 우선 + 필요한 곳만 이벤트
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  211. 현재 비동기성 있는 작업 목록을 정리한다.
  212. 즉시 동기로 유지할 작업을 정한다.
  213. 이벤트로 분리할 작업을 정한다.
  214. 스케줄러/배치가 필요한 작업을 정한다.
  215. 큐 기술 후보를 비교한다.
  216. 재시도/멱등성 정책을 정한다.
  217. dead-letter 필요 여부를 판단한다.
  218. 운영 모니터링 지표를 정의한다.
  219. 이벤트 payload 표준을 정의한다.
  220. 1차 도입 범위를 확정한다.

## 23차 — DB 이전 전략 설계
- 작업내용: Drizzle/Next 기반 DB 사용을 Spring 중심으로 이전하는 전략을 세운다.
- 논의 필요: DB 그대로 사용 / 스키마 재정비 병행 / 새 DB 분리
- 선택지: 기존 DB 유지 + 점진 재정비
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  221. 현재 테이블 ownership을 분류한다.
  222. Spring ORM 매핑 대상 테이블을 분류한다.
  223. 읽기 전용 테이블을 분류한다.
  224. 쓰기 전환 순서를 정한다.
  225. migration 도구(Flyway 등) 전략을 정한다.
  226. 기존 migration과의 공존 전략을 정한다.
  227. DDL drift 관리 방식을 정한다.
  228. seed/fixture 전략을 정한다.
  229. 데이터 보정 작업 목록을 만든다.
  230. DB cutover 체크리스트를 만든다.

## 24차 — Next.js BFF 축소 전략
- 작업내용: Next 서버 역할을 화면 근처 BFF로 줄이는 계획을 만든다.
- 논의 필요: 전면 API proxy / 혼합 / direct client call 확대
- 선택지: 혼합 후 도메인별 정리
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  231. Next에 남길 API 범주를 정의한다.
  232. 즉시 proxy화할 API 범주를 정의한다.
  233. 서버 액션 잔존 기준을 정한다.
  234. SSR 데이터 패칭 전략을 정한다.
  235. 캐싱/재검증 전략을 정한다.
  236. 에러 변환 규칙을 정한다.
  237. BFF 전용 DTO 규칙을 정한다.
  238. 쿠키/헤더 전달 정책을 정한다.
  239. Next server 제거 후보 목록을 만든다.
  240. 최종 BFF 모양을 문서화한다.

## 25차 — 테스트 피라미드 재설계
- 작업내용: Spring 중심 테스트 체계를 만든다.
- 논의 필요: 단위 위주 / 통합 위주 / 균형
- 선택지: 단위 + API 통합 + 핵심 E2E 균형
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  241. 단위 테스트 대상 기준을 정한다.
  242. Repository 테스트 기준을 정한다.
  243. Controller/API integration 테스트 기준을 정한다.
  244. contract sentinel 테스트 기준을 정한다.
  245. 파일 업로드 테스트 기준을 정한다.
  246. OAuth/callback 테스트 기준을 정한다.
  247. Playwright smoke 대상 플로우를 정한다.
  248. fixture/seed 재사용 규칙을 정한다.
  249. CI에서 돌릴 최소 셋을 정한다.
  250. 수동 QA 체크리스트를 만든다.

## 26차 — 보안/관측성/운영 기준 설계
- 작업내용: Spring 운영을 위한 보안과 observability 기준을 세운다.
- 논의 필요: 최소 로그만 / 표준 운영 세트 / 과도한 엔터프라이즈화
- 선택지: 표준 운영 세트
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  251. 인증 실패/권한 실패 로그 기준을 정한다.
  252. PII 마스킹 정책을 정한다.
  253. actuator/health 공개 범위를 정한다.
  254. 메트릭 기본 셋을 정한다.
  255. 트레이싱 필요 범위를 정한다.
  256. 에러 코드 대시보드 기준을 정한다.
  257. rate limit 필요 엔드포인트를 정한다.
  258. 감사로그 대상 작업을 정한다.
  259. 비밀값 로딩 전략을 정한다.
  260. 운영 점검 runbook 목차를 만든다.

## 27차 — 로컬 개발/CI/CD 개편 계획
- 작업내용: 개발자가 Next+Spring을 동시에 다룰 수 있게 로컬/CI를 설계한다.
- 논의 필요: 기존 pnpm만 유지 / 혼합 빌드 도입 / 완전 분리
- 선택지: 혼합 빌드 도입
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  261. 루트 명령 체계에 backend 명령을 추가할지 결정한다.
  262. 로컬 동시 실행 스크립트 전략을 정한다.
  263. 환경변수 파일 분리 전략을 정한다.
  264. CI 단계 순서를 설계한다.
  265. backend build cache 전략을 설계한다.
  266. OpenAPI/TS client 생성 자동화 전략을 정한다.
  267. preview 환경 필요 여부를 판단한다.
  268. migration 검증 단계 추가 여부를 정한다.
  269. branch 보호와 required checks를 정한다.
  270. 개발자 온보딩 문서 목차를 만든다.

## 28차 — 1차 파일/문서 이식 실행 계획
- 작업내용: 요청한 개편 문서들을 어떤 순서로 실제 생성할지 세부 계획을 만든다.
- 논의 필요: 문서 먼저 / 코드 뼈대 먼저 / 혼합
- 선택지: 문서 먼저
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  271. Yeon용 skills_context 루트 생성 시점을 정한다.
  272. ai-surface-policy 초안 작성 차수를 정한다.
  273. backend-context 초안 작성 차수를 정한다.
  274. backend-verify 초안 작성 차수를 정한다.
  275. local-backend-run 초안 작성 차수를 정한다.
  276. local-playwright-e2e 초안 작성 차수를 정한다.
  277. file-upload context 초안 작성 차수를 정한다.
  278. prd-to-frd-v2 wrapper/SSOT 작성 차수를 정한다.
  279. PERSONAL stack-pr 정리 차수를 정한다.
  280. 각 문서별 검토 순서를 확정한다.

## 29차 — 1차 코어 도메인 파일럿 이관 계획
- 작업내용: 문서 다음에 어떤 실제 도메인을 첫 파일럿으로 옮길지 결정한다.
- 논의 필요: auth 우선 / counseling 우선 / spaces 우선
- 선택지: counseling 또는 spaces 우선, auth는 뒤
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  281. 파일럿 후보 도메인 3개를 비교한다.
  282. 파일럿 성공 기준을 정의한다.
  283. 파일럿 범위를 API 단위로 자른다.
  284. 파일럿에 필요한 DB 범위를 자른다.
  285. 파일럿 검증 셋을 정의한다.
  286. 파일럿 동안 Next 변경 최소화 방식을 정한다.
  287. 롤백 전략을 정한다.
  288. 운영 영향도 측정 지표를 정한다.
  289. 파일럿 결과 회고 포맷을 정한다.
  290. 2차 확장 조건을 정한다.

## 30차 — 최종 전환/정리/교육 계획
- 작업내용: 장기 전환 완료 후 남는 정리 작업까지 계획한다.
- 논의 필요: 필요 시점에만 작성 / 지금부터 미리 작성 / 최소 초안만
- 선택지: 최소 초안만 지금 작성
- 추천: 추천 기준 진행
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  291. 레거시 Next server 제거 조건을 정한다.
  292. 남길 BFF 목록 최종화 조건을 정한다.
  293. 도메인별 완료 판정표를 만든다.
  294. 문서 승격/폐기 기준을 정한다.
  295. 운영 인수인계 체크리스트를 만든다.
  296. 개발자 교육 세션 주제를 정한다.
  297. 장애 대응 훈련 필요 여부를 정한다.
  298. 최종 cutover rehearsal 계획을 정한다.
  299. 전환 종료 선언 조건을 정한다.
  300. post-migration cleanup backlog를 분리한다.

