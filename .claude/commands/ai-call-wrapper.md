---
name: ai-call-wrapper
description: |
  yeon 서버에서 외부 AI 모델(LLM/STT/요약/임베딩) 호출을 단일 wrapper로 통일하기 위한 컨벤션. 모델 ID 상수화, 비용 한도, 타임아웃, 한국어 에러, 재시도, 사용량 로깅을 표준화한다. 트리거: `from "openai"`, `from "@anthropic-ai/sdk"`, `from "@google-cloud/speech"`, 또는 STT/요약/임베딩/완성 신규 코드 작성 시.
---

# ai-call-wrapper

## Purpose

AI 호출은 비용·지연·실패 모드가 일반 HTTP와 다르다. 도메인마다 SDK를 직접 부르면 (a) 모델 ID drift, (b) 타임아웃 누락으로 사용자 무한 대기, (c) 비용 폭발, (d) 에러 메시지가 영어로 노출이 반복된다. 단일 wrapper로 통일한다.

## Use_When

- 서버 코드에 `from "openai"`, `from "@anthropic-ai/sdk"`, `from "@google/generative-ai"` 임포트
- STT(Speech-to-Text) 호출 — `@google-cloud/speech`, OpenAI Whisper 등
- 요약/추출/분류/embedding API 호출
- counseling-workspace AI 채팅, AI 요약 신규 작성
- 새 AI 기능 추가 (카드 자동 생성, 학생 리포트 자동 생성 등)

## Do_Not_Use_When

- 클라이언트 측 LLM 임포트 (보안상 클라이언트에 SDK 두지 않음 — 발견하면 서버로 옮겨야)
- 단순 vector 연산이나 ML 추론 라이브러리 (TF.js, ONNX 등 외부 호출 없음)
- 사내 자체 inference 서버가 별도 contract로 노출된 경우 (이쪽은 일반 fetch wrapper)

## Why_This_Exists

- 모델 ID는 raw 문자열 흩으면 deprecation 시 일괄 교체 어려움
- AI 호출은 분당 $$ 단위 → 사용량 로깅과 hard limit 필요
- 응답 지연이 길면 사용자에게 노출되는 에러가 가장 비싼 사용자 경험 손해
- 한국어 에러 일관성 필수

## Conventions

### 1. 모델 ID는 상수 객체로

```ts
// apps/web/src/server/ai/models.ts
export const AI_MODELS = {
  // 채팅·요약 (가성비 기본)
  chatDefault: "claude-sonnet-4-6" as const,
  chatFast: "claude-haiku-4-5-20251001" as const,
  chatHigh: "claude-opus-4-7" as const,
  // STT
  sttDefault: "whisper-1" as const,
  // 임베딩
  embeddingDefault: "text-embedding-3-small" as const,
} as const;
```

- 도메인 코드는 `AI_MODELS.chatDefault`만 참조. raw `"claude-..."` 금지.
- 모델 변경/롤백은 이 파일 한 곳에서.

### 2. 호출은 단일 wrapper 경유

```ts
// apps/web/src/server/ai/client.ts
export async function callChat(args: {
  model: keyof typeof AI_MODELS;
  messages: ChatMessage[];
  maxTokens: number;
  timeoutMs?: number;
  costCapKrw?: number;
  caller: string;  // 호출자 서비스명, 로깅·디버깅용
}): Promise<ChatResult> { ... }
```

도메인 코드:

```ts
// 좋음
const result = await callChat({
  model: "chatDefault",
  messages: [...],
  maxTokens: 800,
  caller: "counseling.summary",
});

// 나쁨 — SDK 직접 호출
const sdk = new Anthropic();
await sdk.messages.create({ model: "claude-sonnet-4-6", ... });
```

### 3. 타임아웃 필수

- wrapper 기본 타임아웃 (예: 30초)
- 도메인이 더 길게 필요하면 명시 override
- 타임아웃 시 한국어 에러: "AI 응답이 지연되었습니다. 잠시 후 다시 시도해주세요."

### 4. 비용 한도(cost cap)

- per-call: `costCapKrw` 옵션, 입력 토큰 + 예상 출력 토큰으로 사전 추정 → 초과 시 reject
- per-user/day: 별도 redis/db rate limit (admin이 조정)
- 초과 시 한국어 메시지: "오늘 AI 사용량을 초과했습니다."

### 5. 재시도 정책

- 429 (rate limit) → exponential backoff, 최대 2회
- 5xx → 최대 1회 재시도
- 401/403 → 재시도 금지 (서버 환경 문제, alert)
- 4xx (input invalid) → 재시도 금지

### 6. 한국어 에러 메시지

- 사용자 노출용: "AI 응답을 받지 못했습니다.", "응답이 잘려서 다시 시도해주세요.", "지원하지 않는 형식입니다."
- 영어 SDK 에러는 wrapper에서 catch → 한국어로 변환 후 throw
- 원본 에러는 서버 로그에만, 사용자에게 stack trace 노출 금지

### 7. 사용량 로깅

- 모든 wrapper 호출은 (caller, model, input tokens, output tokens, latency, success/error) 기록
- 위치: 서버 로그 + 분석용 DB table (별도 정의)
- caller 필드로 어떤 기능이 비용 많이 쓰는지 추적

### 8. streaming은 별도 함수

- `streamChat({...})` 따로 정의 — 토큰 단위로 yield
- 클라이언트는 SSE/EventSource 또는 WebSocket으로 받음
- 토큰 단위 응답도 위 사용량 로깅 적용 (마무리 시 합산)

### 9. STT는 청크/스트리밍 정책

- 짧은 음성: 한 번에 전송 + sync 응답
- 긴 음성: 청크 분할 + 진행 표시 (counseling 녹음 같은 케이스)
- 양쪽 모두 wrapper 함수로 노출 (`callStt({...})`)

### 10. 클라이언트 코드에 SDK 임포트 금지

- 보안: API 키 노출 위험
- 클라이언트는 우리 서버 endpoint만 호출 (`POST /api/v1/ai/<feature>`)
- ESLint rule 또는 grep로 검출 가능: `apps/web/src/{components,features,app}` 안에 `from "anthropic"` 발견되면 차단

## Anti-Patterns

❌ 도메인 코드에서 `new Anthropic()` 직접 인스턴스화
❌ 모델 ID `"claude-sonnet-4-5"` 식 raw string 흩뿌림
❌ 타임아웃 없는 호출 → 사용자 무한 로딩
❌ SDK 에러를 그대로 throw → 영어 stack trace 사용자 노출
❌ 비용 한도 없이 사용자 입력을 그대로 prompt에 → 잠재 비용 폭발
❌ 클라이언트에서 SDK 호출 → API key 노출
❌ 재시도를 무한 루프 → 비용 + 백엔드 부하 폭발

## Verification

- 새 AI 호출 추가 후:
  - `grep -r 'from "@anthropic-ai/sdk"' apps/web/src/` → 서버 경로(`server/ai/`)만 있는지
  - 클라이언트(`features/`, `components/`)에서 SDK import 없는지
  - 모델 ID raw string 누락 검사
  - 타임아웃 + 한국어 에러 + 사용량 로깅 모두 wrapper에 의해 처리되는지

## References

- 룰 SSOT: `.claude/rules/server-services.md`, `.claude/rules/counseling-workspace.md`
- 기준 위치 (없으면 생성): `apps/web/src/server/ai/`
- claude-api skill (Anthropic SDK 자체): 본 wrapper 안에서 호출 방식만 참고
- 모델 카탈로그: 글로벌 CLAUDE.md "Opus 4.7 / Sonnet 4.6 / Haiku 4.5"
