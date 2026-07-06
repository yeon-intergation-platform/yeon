# 백지 학습 모드 (3단 백지 학습법) 기획/백로그

작성일: 2026-07-06
분류: `typing-service` 확장 기능 (신규 4번째 서비스 아님)
상태: 기획 확정 대기 (실행 전 사용자 방향 확인 필요)

> 용어: 제품/앱 이름은 **"백지"**, 학습 방식은 **"3단 백지 학습법 (보고 쓰기 → 가리고 쓰기 → 안 보고 쓰기)"**.
> 태그라인: **"안 보고 쓸 수 있으면, 진짜 아는 것."**
> (학문적 근거는 retrieval practice / active recall이지만, 사용자 표기는 전문어 "인출"을 쓰지 않고 "안 보고 쓰기"로 통일한다.)

---

## 0. 한 줄 정의

**"안 보고 빈 화면에 기억으로 써서 채점받는 백지 학습 모드."**
보고 따라 치는 타자(손가락·운동)가 아니라, 안 보고 기억에서 꺼내 쓰는 것(지식)을 훈련·측정한다.

핵심 철학: **안 보고 쓸 수 있어야 진짜 아는 것이다.**

---

## 1. 배경과 문제

### 1.1 왜 이걸 만드는가 — 경쟁 공백

| 기존 도구             | 하는 일                                                                            | 한계                                                |
| --------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| Monkeytype / 타자연습 | 보이는 텍스트를 따라 침                                                            | 안 보고 쓰기가 없음 → 운동 훈련일 뿐 지식과 무관    |
| Anki                  | 카드 뒤집고 "나 알았어"를 **스스로** 채점                                          | 주관적. 알아봄(재인)을 써냄(재생)으로 착각하기 쉬움 |
| **백지**              | 텍스트를 **안 보여주고** → 기억으로 전부 타이핑 → 원본/의미와 대조해 **객관 채점** | (공백 — 아무도 안 함)                               |

타이핑이 결정적인 이유: 말로 "안다"는 속일 수 있어도, **빈 화면에 한 글자씩 실제로 써내는 것은 못 속인다.** 안 보고 쓰기를 강제하는 가장 정직한 매체가 타이핑이다. 한국 학생들이 이미 아는 **백지 테스트/백지 복습**을 타이핑으로 구현한 것이다.

### 1.2 타깃

- 소수라도 **혼자 반복적으로** 쓰는 개인 학습자 (집단/실시간 전제 없음).
- 1차 재료 후보: 영어 문장, 코드/CS 개념, 시험 범위 암기 문장, 명문 등. **1차 버전은 한 종류로 좁힌다**(3.2 참조).

### 1.3 리텐션 근거 (소수 충성 성립 조건)

- **누적 자산**: 백지 이력·마스터리 곡선·"안 보고 쓸 수 있게 된 문장" 컬렉션이 쌓일수록 이탈 비용 상승.
- **매일 돌아올 이유**: SRS가 "오늘 복습할 문장"을 띄운다 → 고정 트리거.
- **정직한 성취**: 스스로 채점이 아니라 객관 점수 → "진짜 외웠다"는 확신이 보상.

---

## 2. 핵심 개념

### 2.1 3단 백지 학습법 (난이도 3단계 = 학습 루프이자 리텐션 장치)

각 문장(passage)은 개인별로 아래 계단을 오른다. 사용자에게 보이는 이름은 모두 일상어다.

1. **보고 쓰기 (See)** — 원문을 보며 그대로 따라 친다. 익히는 단계. (기존 솔로 연습과 동일)
2. **가리고 쓰기 (Partial)** — 원문의 일부 토큰/구간을 빈칸으로 가리고 전체를 쓴다. 부분 점수.
3. **안 보고 쓰기 (Blank)** — 원문을 전혀 안 보여주고 전부 기억으로 써낸다. 이 단계 통과 = **졸업(Mastered)**.

한 단계를 안정적으로 통과하면 다음 단계로 승급, 실패하면 강등/유지. 승급·강등이 SRS 간격과 연동된다.
(코드 식별자는 `see | partial | blank`를 유지하고, 화면 표기만 "보고 쓰기/가리고 쓰기/안 보고 쓰기"로 매핑한다.)

### 2.2 채점 이원화 (재료 성격에 따라)

| 유형               | 재료 예                                 | 채점 방식                                                                        | 근거                                                  |
| ------------------ | --------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **축자(Verbatim)** | 코드, 공식, 영어 문장, 단어, 명문, 판례 | 원문과 **글자단위 diff** → 정확도 % + 틀린 위치 하이라이트                       | 정답이 딱 정해짐. **`calculateAccuracy()` 이미 존재** |
| **개념(Semantic)** | "○○를 설명해봐"처럼 뜻만 맞으면 되는 것 | **Z.ai(GLM) LLM**이 "핵심 포인트를 써냈는가"로 채점 (토씨 달라도 뜻 맞으면 정답) | 축자 diff로는 오답 처리되는 정답을 구제               |

**1차 버전은 축자부터.** 채점이 객관·즉시·무료라 제품의 심장("안 보고 쓸 수 있어야 진짜 안다")을 점수로 정직하게 증명할 수 있다. 개념 채점(Z.ai)은 2차.

---

## 3. 범위 결정

### 3.1 서비스 편입: `typing-service`의 새 모드

- 신규 4번째 서비스로 만들지 않는다. **유지보수 3종(card/typing/community) 범위를 지킨다** (AGENTS.md).
- 타자 지문(deck/passage)을 **콘텐츠 원천**으로 재사용하고, 카드 서비스의 **SRS 스케줄러 패턴**을 재사용한다. → typing + card 자산을 한 기능으로 합치되 목적만 새로 정의.
- 동결 서비스(counseling-workspace)는 **구현 패턴 참고용으로 읽기만** 하고 절대 수정하지 않는다.

### 3.2 1차 재료 (사용자 결정 필요 — 6장 열린 질문 Q1)

기본 추천: **영어 문장 암기** 또는 **코드 스니펫**. 둘 다 축자 채점이 자연스럽고, 지문 스키마에 `languageTag: en|code`, `textType: code`가 이미 존재해 데이터 변경이 최소.

---

## 4. 아키텍처

### 4.1 소유권 경계 (AGENTS.md 준수)

| 책임                                           | 위치                                                            | 근거                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 백지 진도·마스터리·SRS 일정·시도 이력 **저장** | **Spring** (`apps/backend`, 신규 패키지 `typing_baekji`)        | 도메인 쓰기·장기 상태는 Spring 소유                                             |
| 개념 채점 **LLM 호출(Z.ai)**                   | **Spring** (`TypingBaekjiGradingService`)                       | 신규 백엔드 로직. 기존 `CounselingRecordAiService` HttpClient 패턴 미러링       |
| 축자 채점 (글자 diff)                          | **클라이언트(@yeon/ui/web)** 계산 + 서버가 결과 검증·저장       | `calculateAccuracy()` 재사용. 단, 점수 위변조 방지 위해 서버가 원문 대조 재계산 |
| 화면·입력·가림 렌더                            | **@yeon/ui** 공유(웹/모바일 패리티)                             | 타자 서비스는 Universal UI 대상                                                 |
| 웹 API 라우트                                  | `apps/web/src/app/api/v1/typing-baekji/*` (BFF 프록시 → Spring) | 기존 `/api/v1/typing-decks` 컨벤션                                              |

> 확인 필요: 타자 플레이 화면의 현재 `@yeon/ui` 공유 범위(일부는 `apps/web/src/features/typing-service`에 있음). 신규 백지 화면은 처음부터 공유 컴포넌트로 설계해 패리티 레지스트리에 등록한다.

### 4.2 Z.ai(GLM) 연동

- 키: `ZAI_API_KEY` (이미 `apps/web/.env`에 저장, gitignored / `.env.example`에 이름만 문서화 완료).
- 백엔드 전달: `scripts/dev-all.mjs`의 백엔드 env 전달 목록에 `ZAI_API_KEY` 1줄 추가(현재 `OPENAI_API_KEY`처럼 명시 전달 필요).
- API: OpenAI 호환 chat completions. 엔드포인트 `https://api.z.ai/api/paas/v4/chat/completions` (**정확 base URL/모델 실구현 시 확인**), `Authorization: Bearer <ZAI_API_KEY>`, `response_format: {type: json_object}`.
- 모델: 채점은 짧고 저렴해야 하므로 `glm-4.5-flash`(저비용) 계열 기본, 실패 시 상위 모델 폴백(`OPENAI_TRANSCRIPTION_FALLBACK_MODELS` 방식 참고).
- 구현 원본: `apps/backend/.../counseling_record_ai/service/CounselingRecordAiService.java:36-160` — `HttpClient.newHttpClient()`, `HttpRequest.newBuilder(URI.create(...))`, `resolveAiChatModel()`(env `OPENAI_AI_CHAT_MODEL`), 예외 `CounselingRecordAiServiceException(status, code, msg)` 패턴을 그대로 미러링.

### 4.3 재사용 자산 (실측 근거)

- `packages/api-contract/src/typing-decks.ts`: 덱/지문 스키마. 지문 = `prompt`(≤4000), `textType`(short/long/code), `difficulty`(easy/normal/hard), `languageTag`(ko/en/mixed/code). → **백지 대상 텍스트 원천 그대로 사용.**
- `apps/web/src/features/typing-service/race-metrics.ts`: `calculateAccuracy(prompt, input)`(글자 diff %), `calculateTypingSpeedMetrics`(WPM, `@yeon/race-shared`). → **축자 채점·속도 측정 재사용.**
- `apps/backend/.../card_decks/route/service/CardDeckRouteService.java:142-155` + `.../repository/CardDeckRouteRepository.java:260`: `reviewItem` → 난이도별 `nextReviewAt`(hard +1d / good +3d / easy +4d), 필드 `reviewDifficulty·lastReviewedAt·nextReviewAt`. → **백지 SRS 스케줄 로직 미러링.**

---

## 5. 데이터 모델 (신규)

기존 타자 덱/지문은 그대로 두고(공유 콘텐츠), **개인별 백지 상태**만 신규로 추가한다.

### 5.1 테이블 (Spring, `typing_baekji`)

- `typing_baekji_progress`
  - `id`, `user_id`, `passage_id`(FK → 기존 타자 지문), `deck_id`
  - `stage`(see | partial | blank) — 3단 백지 현재 단계
  - `grading_mode`(verbatim | semantic) — 지문 성격에 따라 결정(파생 or 지정)
  - `mastery_score`(최근 정확도), `mastered_at`(안 보고 쓰기 통과 시각, nullable)
  - `review_difficulty`, `last_reviewed_at`, `next_review_at` — 카드 SRS 미러
  - `created_at`, `updated_at`
  - UNIQUE(`user_id`, `passage_id`)
- `typing_baekji_attempt` (시도 로그, 성장 곡선·통계용)
  - `id`, `progress_id`(FK), `user_id`, `passage_id`
  - `stage`, `grading_mode`, `accuracy`(0~100), `wpm`, `passed`(bool)
  - `masked_ratio`(가리고 쓰기 단계에서 가린 비율, nullable)
  - `graded_by`(client_diff | zai), `created_at`

### 5.2 api-contract (신규 `packages/api-contract/src/typing-baekji.ts`)

- `BaekjiStage = see | partial | blank`, `GradingMode = verbatim | semantic` (as const + literal union, `enum` 금지)
- `BaekjiSessionQuery`(due only? deckId?), `BaekjiCardDto`(passageId, prompt 또는 maskedPrompt, stage, gradingMode)
- `SubmitBaekjiAttemptBody`(passageId, stage, input, elapsedSeconds)
- `BaekjiAttemptResultDto`(accuracy, wpm, passed, nextStage, nextReviewAt, diff 하이라이트 or semantic feedback)
- 값이 진실의 원천이 되도록 상수 객체로 승격, raw 문자열 분산 금지(구현 원칙 준수).

### 5.3 엔드포인트 (Spring + 웹 BFF `/api/v1/typing-baekji`)

- `GET /api/v1/typing-baekji/session?deckId=&scope=due` — 오늘 쓸 카드 목록(SRS `next_review_at <= now` 우선)
- `POST /api/v1/typing-baekji/attempts` — 백지 시도 제출 → 채점(축자: 서버 재대조 / 개념: Z.ai) → 진도·SRS 갱신 → 결과 반환
- `GET /api/v1/typing-baekji/stats?deckId=` — 마스터리 분포·연속일·성장 곡선

---

## 6. 채점 설계 상세

### 6.1 축자(Verbatim)

- 클라이언트: `calculateAccuracy(prompt, input)`로 즉시 프리뷰(틀린 글자 위치 하이라이트).
- 서버: **원문을 신뢰 원천으로 다시 대조**해 최종 accuracy 확정(클라 점수 신뢰 금지 — 상태 오염 방어).
- 통과 임계값(예: 안 보고 쓰기 ≥ 95%)은 상수로. 통과 시 stage 승급 + `next_review_at` 연장, 실패 시 강등/단축.

### 6.2 가리고 쓰기(Partial)

- 원문을 토큰(공백/구두점 기준 또는 문장 단위)으로 쪼개 일정 비율(`masked_ratio`)을 `▁▁▁`로 치환해 노출.
- 가린 구간만 채점 대상. 채점은 가린 토큰의 정확 재생 여부.
- 가림 비율은 stage 진행에 따라 점증(보고 쓰기→가리고 쓰기 초반 20% → 후반 60% → 안 보고 쓰기 100%).

### 6.3 개념(Semantic, 2차 / Z.ai)

- 입력(사용자가 기억으로 쓴 설명) + 원문(정답)을 Z.ai에 보내 **rubric 채점**: `response_format: json_object`로 `{score: 0~100, coveredPoints:[], missedPoints:[], verdict}` 강제.
- 프롬프트는 "핵심 개념 포함 여부"만 평가하고 표현 차이는 감점하지 말 것을 명시.
- 실패/타임아웃 시: 사용자에게 "자동 채점 실패" 안내 + 축자 fallback 또는 재시도(예외 은닉 금지, 의미 있는 한국어 메시지).

---

## 7. UX 플로우 (1차)

1. 덱 선택 → "백지 복습 시작"
2. 오늘 쓸 카드 큐(SRS due 우선) 제시
3. 각 카드: 현재 stage에 맞는 화면
   - 보고 쓰기: 원문 보이고 따라치기
   - 가리고 쓰기: 일부 가림, 전체 쓰기
   - 안 보고 쓰기: 프롬프트/힌트만(제목·첫 글자 등) + 빈 입력창, 기억으로 전부 쓰기
4. 제출 → 즉시 채점 결과(정확도, 틀린 위치, 쓰기 속도, 통과/승급 여부, 다음 복습일)
5. 큐 소진 → 세션 요약(오늘 쓴 문장 수, 마스터리 변화, 연속일)
6. **리더보드·공유·소셜 없음**(솔로 집중).

---

## 8. 차수별 실행 계획

### 1차 — 데이터/계약 기반 (Spring + api-contract)

- **작업내용**: `typing_baekji_progress`·`typing_baekji_attempt` 마이그레이션, `packages/api-contract/src/typing-baekji.ts` 스키마, Spring `typing_baekji` 패키지(엔티티·repository·route service 골격), 3개 엔드포인트 stub + 축자 채점(서버 재대조) + SRS 갱신.
- **논의 필요**: SRS 간격 정책을 카드와 동일(hard+1d/good+3d/easy+4d)으로 둘지, 3단 백지 단계(stage)에 맞춰 별도 곡선으로 둘지.
- **선택지**: (a) 카드와 동일 재사용 (b) 백지 전용 곡선(예: 안 보고 쓰기 통과 시 +7d 등 stage 가중)
- **추천**: (a)로 시작해 데이터 쌓인 뒤 (b)로 튜닝. KISS/YAGNI.
- **사용자 방향**: (비어 있으면 추천대로)

### 2차 — 백지 플레이 UI (@yeon/ui 공유, 웹 우선 + 모바일 패리티)

- **작업내용**: 백지 세션 화면(보고/가리고/안 보고 쓰기 렌더), 가림 마스킹 로직, 제출·결과 화면, `race-metrics` 재사용, queryKey·api-client 배선. 패리티 레지스트리 등록.
- **논의 필요**: 안 보고 쓰기 단계 힌트 수준(무힌트 vs 제목/첫 글자/글자 수).
- **선택지**: (a) 완전 무힌트 (b) 최소 힌트(제목+글자 수)
- **추천**: (b) — 완전 무힌트는 진입 장벽이 커 초기 이탈 위험. 힌트량을 stage로 조절.
- **사용자 방향**:

### 3차 — 검증·다듬기 + 배포

- **작업내용**: Playwright 스크린샷 근거(보고/가리고/안 보고 쓰기/결과), lint·typecheck, `verify:parity`(공유 개념 건드리므로 필수), 문서화.
- **논의 필요**: 1차 재료 시드 덱(영어/코드) 기본 제공 여부.
- **선택지**: (a) 빈 상태로 사용자가 직접 덱 생성 (b) 기본 시드 덱 1개 동봉
- **추천**: (b) 최소 시드 1개 — 첫 사용 공허함 방지.
- **사용자 방향**:

### 4차 (후속) — 개념 채점(Z.ai/GLM)

- **작업내용**: `TypingBaekjiGradingService`(CounselingRecordAiService 패턴 미러링), Z.ai 호출·rubric JSON 파싱·폴백·예외, `dev-all.mjs`에 `ZAI_API_KEY` 전달 추가, semantic 재료용 UI 피드백.
- **논의 필요**: 개념 채점을 별도 재료 타입으로 노출할지, 기존 지문에 grading_mode 플래그로 부여할지.
- **선택지**: (a) grading_mode를 지문/진도에 지정 (b) 덱 단위 정책
- **추천**: (a) 지문 단위가 유연.
- **사용자 방향**:

---

## 9. 검증 계획

- 코드 변경: `pnpm --filter @yeon/web lint`/`typecheck`, 백엔드 해당 모듈 테스트.
- 공유 개념(타자 화면·queryKey·view-state) 변경 → `pnpm verify:parity` 필수(AGENTS.md, CI 강제).
- 라우팅/서버·클라 경계/신규 API route 추가 → 배포 전 `pnpm build` 게이트.
- UI 변경 → `docs/guides/design-screenshot-evidence.md`에 따라 Playwright before/after 스크린샷(타자 검증 시 race-server 포함 기동).
- 마이그레이션 → drift 체크.

---

## 10. 리스크 / 방어

- **가림 토큰화가 언어별로 다름**(한글/영문/코드) → 언어별 마스킹 전략 분리, 초기엔 축자+영문/코드로 한정.
- **클라 채점 위변조** → 서버 원문 재대조를 신뢰 원천으로(상태 정합성).
- **Z.ai 응답 불안정/비용** → 저비용 모델 기본 + 타임아웃·폴백·JSON 강제, 개념 채점은 4차로 분리해 1차 리스크에서 격리.
- **완전 무힌트 진입장벽** → stage 기반 힌트량 조절.
- **패리티 drift** → 신규 공유 개념 도입 시 레지스트리 먼저 등록.

---

## 11. 열린 질문 (사용자 결정 필요)

- **Q1. 1차 재료를 뭘로 좁힐까?** (영어 문장 / 코드·CS / 시험 암기 문장 / 기타) — 데이터·마스킹·시드 덱이 여기 맞춰짐. 추천: 사용자가 지금 실제로 외우고 싶은 것.
- **Q2. 제품 표기 확정?** 현재 **"백지"**(앱 이름) + "3단 백지 학습법"(방식) + 태그라인 "안 보고 쓸 수 있으면, 진짜 아는 것."으로 진행 중.
- **Q3. 1차 범위를 축자만으로 확정하고 개념 채점(Z.ai)은 4차로 미루는 데 동의하는가?** 추천: 동의(리스크 격리).

---

## 부록 A. 이번 준비 작업에서 이미 완료한 것

- `apps/web/.env`에 `ZAI_API_KEY` 저장(gitignored, 커밋 안 됨).
- `apps/web/.env.example`에 `ZAI_API_KEY` 이름만 문서화(값 없음).
- 화면 목업(모바일/데스크톱) — `docs/product/mockups/typing-baekji-mock*.html`.
