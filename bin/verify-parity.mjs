#!/usr/bin/env node
// Universal UI Parity 검증 (강제 장치 18).
//
// docs/architecture/universal-ui-parity-registry.yaml 의 identical-value 주장을 실제 파일로 검증한다:
//   - SSOT 파일이 존재하는가
//   - 앱별 어댑터가 SSOT를 재수출/파생하는가(복제 금지: raw 재선언이 없는가)
// 또한 registry에 identical-value 개념이 있으면 대응 CHECK가 있는지(registry↔검증 drift) 교차 확인한다.
//
// 의존성 없음(node 내장만). CI: .github/workflows/ssot-check.yml 에서 `node bin/verify-parity.mjs`.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = "docs/architecture/universal-ui-parity-registry.yaml";

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const exists = (rel) => existsSync(join(ROOT, rel));

const failures = [];
const notes = [];
const fail = (id, msg) => failures.push(`[${id}] ${msg}`);
const note = (msg) => notes.push(msg);

// 공통 헬퍼: 파일이 존재하고 needle 들을 모두 포함하는가.
function mustContain(id, file, needles) {
  if (!exists(file)) {
    fail(id, `파일 없음: ${file}`);
    return null;
  }
  const src = read(file);
  for (const needle of needles) {
    if (!src.includes(needle)) {
      fail(id, `${file} 에 "${needle}" 가 없음(SSOT 파생 누락 의심).`);
    }
  }
  return src;
}

// raw 재선언 금지: 어댑터 파일에 직접 key 배열(`] as const`) 같은 복제가 없어야 한다.
function mustNotMatch(id, file, regex, why) {
  if (!exists(file)) return;
  const src = read(file);
  if (regex.test(src)) {
    fail(id, `${file} 에 복제 의심 패턴 발견(${why}). SSOT에서 파생하라.`);
  }
}

// ── 개념별 CHECK (어댑터가 존재하는 identical-value 개념) ─────────────────────
const CHECKS = {
  "typing-service-query-keys": () => {
    mustContain(
      "typing-service-query-keys",
      "packages/ui/src/runtime/ports/typing-service/query-keys.ts",
      ["typingServiceQueryKeys"]
    );
    mustContain(
      "typing-service-query-keys",
      "apps/web/src/features/typing-service/typing-service-query-keys.ts",
      ["@yeon/ui/runtime/ports/typing-service"]
    );
    mustNotMatch(
      "typing-service-query-keys",
      "apps/web/src/features/typing-service/typing-service-query-keys.ts",
      /\["typing-/,
      "raw typing queryKey 재선언"
    );
  },

  "card-rooms-query-keys": () => {
    mustContain(
      "card-rooms-query-keys",
      "packages/ui/src/runtime/ports/card-rooms/query-keys.ts",
      ["cardRoomsQueryKey"]
    );
    mustContain(
      "card-rooms-query-keys",
      "apps/web/src/features/card-service/hooks/use-card-room.ts",
      ["@yeon/ui/runtime/ports/card-rooms"]
    );
  },

  "room-voice-call-query-keys": () => {
    mustContain(
      "room-voice-call-query-keys",
      "packages/ui/src/runtime/ports/room-voice-call/query-keys.ts",
      ["roomVoiceCallConfigQueryKey"]
    );
    mustContain(
      "room-voice-call-query-keys",
      "apps/web/src/features/room-voice-call/use-room-voice-call.ts",
      ["@yeon/ui/runtime/ports/room-voice-call"]
    );
  },

  "life-os-query-keys": () => {
    const ssot = "packages/ui/src/runtime/ports/life-os/query-keys.ts";
    mustContain("life-os-query-keys", ssot, ["lifeOsQueryKeys"]);
    for (const adapter of [
      "apps/web/src/features/life-os/life-os.tsx",
      "apps/mobile/src/features/life-os/life-os-screen.tsx",
    ]) {
      mustContain("life-os-query-keys", adapter, ["lifeOsQueryKeys"]);
      mustNotMatch(
        "life-os-query-keys",
        adapter,
        /\["life-os",\s*"day"/,
        "raw life-os queryKey 재선언"
      );
    }
  },

  "card-deck-query-keys": () => {
    const ssot = "packages/ui/src/runtime/ports/card-deck/query-keys.ts";
    if (!exists(ssot))
      return fail("card-deck-query-keys", `SSOT 없음: ${ssot}`);
    mustContain("card-deck-query-keys", ssot, ["cardDeckQueryKeys"]);
    for (const adapter of [
      "apps/web/src/features/card-service/card-service-query-keys.ts",
      "apps/mobile/src/services/card-service/query-keys.ts",
    ]) {
      mustContain("card-deck-query-keys", adapter, [
        "@yeon/ui/runtime/ports/card-deck",
        "cardDeckQueryKeys",
      ]);
      mustNotMatch(
        "card-deck-query-keys",
        adapter,
        /\]\s*as const/,
        "raw queryKey 배열 재선언"
      );
    }
  },

  "card-recall-query-keys": () => {
    const ssot = "packages/ui/src/runtime/ports/card-deck/query-keys.ts";
    mustContain("card-recall-query-keys", ssot, ["cardRecallQueryKeys"]);
    for (const adapter of [
      "apps/web/src/features/card-service/card-service-query-keys.ts",
      "apps/mobile/src/services/card-service/query-keys.ts",
    ]) {
      mustContain("card-recall-query-keys", adapter, [
        "@yeon/ui/runtime/ports/card-deck",
        "cardRecallQueryKeys",
      ]);
      mustNotMatch(
        "card-recall-query-keys",
        adapter,
        /\["card-service",\s*"recall"/,
        "raw recall queryKey 재선언"
      );
    }
  },

  "card-recall-session-policy": () => {
    const ssot = "packages/ui/src/runtime/ports/card-deck/recall-policy.ts";
    mustContain("card-recall-session-policy", ssot, [
      "getCardRecallExclusionReason",
      "partitionCardDeckItemsForRecall",
    ]);
    for (const adapter of [
      "apps/web/src/features/typing-service/use-baekji-session.ts",
      "apps/mobile/src/features/card-service/card-recall-screen.tsx",
    ]) {
      mustContain("card-recall-session-policy", adapter, [
        "partitionCardDeckItemsForRecall",
      ]);
      mustNotMatch(
        "card-recall-session-policy",
        adapter,
        /frontText\.trim\(\)|backText\.trim\(\)/,
        "raw 백지 카드 유효성 재선언"
      );
    }
    mustContain(
      "card-recall-session-policy",
      "apps/web/src/features/typing-service/baekji-home.tsx",
      ["getCardRecallExclusionReason", "partitionCardDeckItemsForRecall"]
    );
  },

  "card-recall-request-state": () => {
    mustContain(
      "card-recall-request-state",
      "packages/ui/src/runtime/ports/card-deck/ai-draft-state.ts",
      [
        "classifyAiDeckSaveFailure",
        "deriveAiDeckOperationPolicy",
        "shouldApplyAiPreview",
      ]
    );
    mustContain(
      "card-recall-request-state",
      "packages/ui/src/runtime/ports/card-deck/recall-session-state.ts",
      ["createCardRecallSessionIdentity", "shouldApplyCardRecallResponse"]
    );
    mustContain(
      "card-recall-request-state",
      "apps/web/src/features/card-service/components/create-deck-ai-form.tsx",
      [
        "classifyAiDeckSaveFailure",
        "deriveAiDeckOperationPolicy",
        "shouldApplyAiPreview",
      ]
    );
    mustContain(
      "card-recall-request-state",
      "apps/mobile/src/features/card-service/card-ai-draft-state.ts",
      ["@yeon/ui/runtime/ports/card-deck", "deriveAiDeckOperationPolicy"]
    );
    mustContain(
      "card-recall-request-state",
      "apps/mobile/src/features/card-service/mobile-create-deck-ai-form.tsx",
      [
        "classifyAiDeckSaveFailure",
        "deriveAiDeckOperationPolicy",
        "shouldApplyAiPreview",
      ]
    );
    for (const adapter of [
      "apps/web/src/features/typing-service/use-baekji-session.ts",
      "apps/mobile/src/features/card-service/card-recall-screen.tsx",
    ]) {
      mustContain("card-recall-request-state", adapter, [
        "createCardRecallSessionIdentity",
        "shouldApplyCardRecallResponse",
      ]);
    }
  },

  "route-identity": () => {
    mustContain("route-identity", "packages/ui/src/runtime/ports/shared.ts", [
      "YeonRouteTarget",
    ]);
    // 경로 템플릿 SSOT: web/mobile가 같은 템플릿에서 파생해야 한다(하드코딩 금지).
    mustContain("route-identity", "packages/ui/src/runtime/ports/routes.ts", [
      "YEON_ROUTE_TEMPLATES",
      "cardDeckRecall",
      "recallSession",
    ]);
    mustContain(
      "route-identity",
      "apps/web/src/features/card-service/components/deck-card.tsx",
      ["resolveYeonWebPath"]
    );
    mustNotMatch(
      "route-identity",
      "apps/web/src/features/card-service/components/deck-card.tsx",
      /href=\{`\/card-service\/decks\//,
      "하드코딩된 카드 덱 경로"
    );
    mustContain(
      "route-identity",
      "apps/mobile/src/features/card-service/card-deck-list-screen.tsx",
      ["YEON_ROUTE_TEMPLATES"]
    );
    mustContain(
      "route-identity",
      "apps/web/src/features/typing-service/baekji-home.tsx",
      [
        "YEON_ROUTE_TEMPLATES.recallSession",
        "https://card.yeon.world/card-service/decks",
      ]
    );
    mustNotMatch(
      "route-identity",
      "apps/web/src/features/typing-service/baekji-home.tsx",
      /CARD_DECKS_HREF\s*=\s*["']\/card-service/,
      "blurt 서브도메인에서 깨지는 상대 카드 서비스 경로"
    );
    mustContain(
      "route-identity",
      "apps/mobile/src/features/card-service/card-deck-detail-screen.tsx",
      ["YEON_ROUTE_TEMPLATES.cardDeckRecall"]
    );
  },

  "deck-meta-format": () => {
    mustContain(
      "deck-meta-format",
      "packages/ui/src/runtime/ports/card-deck/format.ts",
      ["formatCardDeckMeta"]
    );
    for (const adapter of [
      "apps/web/src/features/card-service/components/deck-card.tsx",
      "apps/mobile/src/features/card-service/card-deck-list-screen.tsx",
    ]) {
      mustContain("deck-meta-format", adapter, ["formatCardDeckMeta"]);
      mustNotMatch(
        "deck-meta-format",
        adapter,
        /업데이트 \$\{|업데이트 \{formatDate/,
        "로컬 날짜 메타 재선언"
      );
    }
  },

  "card-item-repository": () => {
    mustContain(
      "card-item-repository",
      "packages/ui/src/runtime/ports/card-deck/item-repository.ts",
      ["YeonCardItemRepository"]
    );
    mustContain(
      "card-item-repository",
      "apps/web/src/features/card-service/runtime-adapters/card-item-repository.tsx",
      ["YeonCardItemRepository"]
    );
    mustContain(
      "card-item-repository",
      "apps/mobile/src/features/card-service/runtime-adapters/card-item-repository.ts",
      ["YeonCardItemRepository"]
    );
    // 모바일 detail/play 화면이 포트를 소비해야 한다(인라인 분기 제거).
    mustContain(
      "card-item-repository",
      "apps/mobile/src/features/card-service/card-deck-detail-screen.tsx",
      ["createMobileCardItemRepository"]
    );
    mustContain(
      "card-item-repository",
      "apps/mobile/src/features/card-service/card-deck-play-screen.tsx",
      ["createMobileCardItemRepository"]
    );
    // 웹 훅이 인라인 fetch가 아닌 포트를 소비해야 한다.
    mustContain(
      "card-item-repository",
      "apps/web/src/features/card-service/hooks/use-card-mutations.ts",
      ["useYeonCardItemRepository"]
    );
    mustContain(
      "card-item-repository",
      "apps/web/src/features/card-service/hooks/use-deck-detail.ts",
      ["useYeonCardItemRepository"]
    );
  },

  "card-deck-repository": () => {
    mustContain(
      "card-deck-repository",
      "packages/ui/src/runtime/ports/card-deck/repository.ts",
      ["YeonCardDeckRepository"]
    );
    // web/mobile 어댑터가 같은 포트 인터페이스를 구현해야 한다.
    mustContain(
      "card-deck-repository",
      "apps/web/src/features/card-service/runtime-adapters/card-deck-repository.tsx",
      ["YeonCardDeckRepository"]
    );
    mustContain(
      "card-deck-repository",
      "apps/mobile/src/features/card-service/runtime-adapters/card-deck-repository.ts",
      ["YeonCardDeckRepository"]
    );
  },

  "card-recall-repository": () => {
    mustContain(
      "card-recall-repository",
      "packages/ui/src/runtime/ports/card-deck/recall-repository.ts",
      ["YeonCardRecallRepository", "createRecallIdempotencyKey"]
    );
    mustContain(
      "card-recall-repository",
      "apps/web/src/features/card-service/runtime-adapters/create-card-recall-repository.ts",
      ["YeonCardRecallRepository", "@yeon/api-contract/recall"]
    );
    mustContain(
      "card-recall-repository",
      "apps/mobile/src/features/card-service/runtime-adapters/card-recall-repository.ts",
      ["YeonCardRecallRepository", "createRecallAttempt"]
    );
  },

  "screen-composition": () => {
    const ssot = "packages/ui/src/runtime/ports/card-deck/view-state.ts";
    mustContain("screen-composition", ssot, [
      "deriveCardDeckListViewState",
      "YeonCardDeckListViewState",
    ]);
    // 웹 타입은 SSOT union을 재수출해야 한다(복제 금지).
    mustContain(
      "screen-composition",
      "apps/web/src/features/card-service/types.ts",
      ["CardServiceHomeViewState = YeonCardDeckListViewState"]
    );
    // 양 화면이 공용 파생 함수를 소비해야 한다.
    mustContain(
      "screen-composition",
      "apps/web/src/features/card-service/card-service-decks-screen.tsx",
      ["deriveCardDeckListViewState"]
    );
    mustContain(
      "screen-composition",
      "apps/mobile/src/features/card-service/card-deck-list-screen.tsx",
      ["deriveCardDeckListViewState"]
    );
    // 덱 상세 view-state도 web/mobile 공용 SSOT 파생.
    mustContain(
      "screen-composition",
      "packages/ui/src/runtime/ports/card-deck/view-state.ts",
      ["deriveCardDeckDetailViewState"]
    );
    mustContain(
      "screen-composition",
      "apps/web/src/features/card-service/deck-detail-screen.tsx",
      ["deriveCardDeckDetailViewState"]
    );
    mustContain(
      "screen-composition",
      "apps/mobile/src/features/card-service/card-deck-detail-screen.tsx",
      ["deriveCardDeckDetailViewState"]
    );
    // 덱 플레이 view-state도 web/mobile 공용 SSOT 파생.
    mustContain(
      "screen-composition",
      "apps/web/src/features/card-service/deck-play-screen.tsx",
      ["deriveCardDeckPlayViewState"]
    );
    mustContain(
      "screen-composition",
      "apps/mobile/src/features/card-service/card-deck-play-screen.tsx",
      ["deriveCardDeckPlayViewState"]
    );
  },
};

// ── registry ↔ CHECK 교차 검증 ────────────────────────────────────────────
function parseRegistryConcepts() {
  const text = read(REGISTRY);
  const concepts = [];
  let cur = null;
  for (const line of text.split("\n")) {
    const idMatch = line.match(/^\s*-\s*id:\s*([\w-]+)\s*$/);
    if (idMatch) {
      cur = { id: idMatch[1], parity: null, hasAdapters: false };
      concepts.push(cur);
      continue;
    }
    if (!cur) continue;
    const pMatch = line.match(/^\s*parity:\s*([\w-]+)/);
    if (pMatch) cur.parity = pMatch[1];
    if (/^\s*adapters:/.test(line)) cur.hasAdapters = true;
  }
  return concepts;
}

console.log("Universal UI Parity 검증\n");

if (!exists(REGISTRY)) {
  console.error(`❌ registry 없음: ${REGISTRY}`);
  process.exit(1);
}

const concepts = parseRegistryConcepts();

// identical-value + 어댑터 보유 개념은 CHECK가 있어야 한다(없으면 검증 누락 경고).
for (const c of concepts) {
  if (c.parity === "identical-value" && c.hasAdapters && !CHECKS[c.id]) {
    note(
      `registry의 identical-value 개념 "${c.id}" 에 대응 CHECK가 없다. bin/verify-parity.mjs 에 추가 권장.`
    );
  }
}

for (const [id, run] of Object.entries(CHECKS)) {
  if (!concepts.some((c) => c.id === id)) {
    note(
      `CHECK "${id}" 가 registry에 없는 개념을 가리킨다. registry 동기화 필요.`
    );
  }
  run();
}

if (notes.length) {
  console.log("ℹ️  참고:");
  for (const n of notes) console.log(`   - ${n}`);
  console.log("");
}

if (failures.length) {
  console.error("❌ Parity 위반:");
  for (const f of failures) console.error(`   - ${f}`);
  console.error(
    `\n총 ${failures.length}건. identical-value 개념은 SSOT 한곳에서만 선언하고 어댑터는 재수출/파생해야 한다.`
  );
  process.exit(1);
}

console.log(
  `✅ Parity OK — 검증 개념 ${Object.keys(CHECKS).length}종, registry 개념 ${concepts.length}종.`
);
