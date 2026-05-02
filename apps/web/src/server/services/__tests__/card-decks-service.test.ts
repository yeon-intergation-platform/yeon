import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { responses, txCalls, txControl, txOps, chain } = vi.hoisted(() => {
  const responses: unknown[] = [];
  const txCalls: { count: number } = { count: 0 };
  const txControl: { failure: Error | null } = { failure: null };
  const txOps: {
    insideTx: boolean;
    insertCount: number;
    updateCount: number;
    outsideTxUpdateCount: number;
  } = {
    insideTx: false,
    insertCount: 0,
    updateCount: 0,
    outsideTxUpdateCount: 0,
  };
  const proxy: unknown = new Proxy({} as Record<string | symbol, unknown>, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) =>
          Promise.resolve(responses.shift() ?? []).then(resolve);
      }
      if (prop === "catch" || prop === "finally") return undefined;
      if (prop === "transaction") {
        return async (fn: (tx: unknown) => Promise<unknown>) => {
          txCalls.count += 1;
          if (txControl.failure) {
            throw txControl.failure;
          }
          txOps.insideTx = true;
          try {
            return await fn(proxy);
          } finally {
            txOps.insideTx = false;
          }
        };
      }
      if (prop === "insert") {
        return () => {
          txOps.insertCount += 1;
          return proxy;
        };
      }
      if (prop === "update") {
        return () => {
          txOps.updateCount += 1;
          if (!txOps.insideTx) {
            txOps.outsideTxUpdateCount += 1;
          }
          return proxy;
        };
      }
      return () => proxy;
    },
  });
  return { responses, txCalls, txControl, txOps, chain: proxy };
});

vi.mock("@/server/db", () => ({ getDb: () => chain }));
vi.mock("@/server/db/schema", () => ({
  cardDecks: {},
  cardDeckItems: {},
  users: {},
}));
vi.mock("drizzle-orm", () => ({
  and: (...conditions: unknown[]) => conditions,
  asc: (col: unknown) => col,
  desc: (col: unknown) => col,
  eq: (col: unknown, val: unknown) => ({ col, val }),
  sql: (parts: TemplateStringsArray) => parts,
}));

const generatedIds: string[] = [];
vi.mock("@/server/lib/public-id", () => ({
  generatePublicId: (prefix: string) => {
    const id = `${prefix}_test${generatedIds.length + 1}`;
    generatedIds.push(id);
    return id;
  },
  ID_PREFIX: { cardDeckItems: "dki", cardDecks: "dck" },
}));

import {
  createCardDeckItems,
  getCardDeckDetail,
  reviewCardDeckItem,
} from "../card-decks-service";

const FIXED_NOW = new Date("2026-05-03T00:00:00.000Z");

const makeDeckRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: "dck_test1",
  ownerUserId: "user-1",
  title: "테스트 덱",
  description: null,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-01T00:00:00.000Z"),
  ...overrides,
});

const makeItemRow = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  publicId: "dki_test1",
  deckId: 1,
  frontText: "앞면",
  backText: "뒷면",
  reviewDifficulty: null,
  lastReviewedAt: null,
  nextReviewAt: null,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-01T00:00:00.000Z"),
  ...overrides,
});

beforeEach(() => {
  responses.length = 0;
  generatedIds.length = 0;
  txCalls.count = 0;
  txControl.failure = null;
  txOps.insideTx = false;
  txOps.insertCount = 0;
  txOps.updateCount = 0;
  txOps.outsideTxUpdateCount = 0;
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("reviewCardDeckItem", () => {
  it("hard 결과는 nextReviewAt 을 1일 후로 설정한다", async () => {
    const deck = makeDeckRow();
    const item = makeItemRow();
    const expectedNext = new Date("2026-05-04T00:00:00.000Z");

    responses.push(
      [deck],
      [item],
      [
        {
          ...item,
          reviewDifficulty: "hard",
          lastReviewedAt: FIXED_NOW,
          nextReviewAt: expectedNext,
          updatedAt: FIXED_NOW,
        },
      ]
    );

    const result = await reviewCardDeckItem(
      "user-1",
      "dck_test1",
      "dki_test1",
      "hard"
    );

    expect(result.reviewDifficulty).toBe("hard");
    expect(result.nextReviewAt).toBe(expectedNext.toISOString());
    expect(result.lastReviewedAt).toBe(FIXED_NOW.toISOString());
  });

  it("good 결과는 nextReviewAt 을 3일 후로 설정한다", async () => {
    const deck = makeDeckRow();
    const item = makeItemRow();
    const expectedNext = new Date("2026-05-06T00:00:00.000Z");

    responses.push(
      [deck],
      [item],
      [
        {
          ...item,
          reviewDifficulty: "good",
          lastReviewedAt: FIXED_NOW,
          nextReviewAt: expectedNext,
          updatedAt: FIXED_NOW,
        },
      ]
    );

    const result = await reviewCardDeckItem(
      "user-1",
      "dck_test1",
      "dki_test1",
      "good"
    );

    expect(result.reviewDifficulty).toBe("good");
    expect(result.nextReviewAt).toBe(expectedNext.toISOString());
  });

  it("easy 결과는 nextReviewAt 을 4일 후로 설정한다", async () => {
    const deck = makeDeckRow();
    const item = makeItemRow();
    const expectedNext = new Date("2026-05-07T00:00:00.000Z");

    responses.push(
      [deck],
      [item],
      [
        {
          ...item,
          reviewDifficulty: "easy",
          lastReviewedAt: FIXED_NOW,
          nextReviewAt: expectedNext,
          updatedAt: FIXED_NOW,
        },
      ]
    );

    const result = await reviewCardDeckItem(
      "user-1",
      "dck_test1",
      "dki_test1",
      "easy"
    );

    expect(result.reviewDifficulty).toBe("easy");
    expect(result.nextReviewAt).toBe(expectedNext.toISOString());
  });

  it("비소유자가 접근하면 deck 단계에서 404 ServiceError 를 던진다", async () => {
    responses.push([]);

    await expect(
      reviewCardDeckItem("other-user", "dck_test1", "dki_test1", "good")
    ).rejects.toMatchObject({
      status: 404,
      message: "덱을 찾지 못했습니다.",
    });
    expect(txOps.updateCount).toBe(0);
  });

  it("itemId 가 존재하지 않으면 404 ServiceError 를 던진다", async () => {
    const deck = makeDeckRow();
    responses.push([deck], []);

    await expect(
      reviewCardDeckItem("user-1", "dck_test1", "dki_missing", "good")
    ).rejects.toMatchObject({
      status: 404,
      message: "카드를 찾지 못했습니다.",
    });
    expect(txOps.updateCount).toBe(0);
  });
});

describe("getCardDeckDetail", () => {
  it("비소유자가 접근하면 404 ServiceError를 던진다", async () => {
    responses.push([]);

    await expect(
      getCardDeckDetail("other-user", "dck_test1")
    ).rejects.toMatchObject({
      status: 404,
      message: "덱을 찾지 못했습니다.",
    });
  });
});

describe("createCardDeckItems", () => {
  it("transaction 안에서 items insert와 deck.updatedAt 갱신을 함께 수행한다", async () => {
    const deck = makeDeckRow();
    const insertedRows = [
      makeItemRow({
        id: 11,
        publicId: "dki_test1",
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }),
      makeItemRow({
        id: 12,
        publicId: "dki_test2",
        frontText: "앞2",
        backText: "뒤2",
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }),
    ];

    responses.push([deck], insertedRows, []);

    const result = await createCardDeckItems("user-1", "dck_test1", {
      items: [
        { frontText: "앞면1", backText: "뒷면1" },
        { frontText: "앞면2", backText: "뒷면2" },
      ],
    });

    expect(txCalls.count).toBe(1);
    expect(result).toHaveLength(2);
    expect(result[0].updatedAt).toBe(FIXED_NOW.toISOString());
    expect(result[1].updatedAt).toBe(FIXED_NOW.toISOString());
  });

  it("transaction 내부에서 실패하면 ServiceError로 변환되어 전파된다", async () => {
    const deck = makeDeckRow();
    responses.push([deck]);
    txControl.failure = new Error("DB write failed");

    await expect(
      createCardDeckItems("user-1", "dck_test1", {
        items: [{ frontText: "앞면", backText: "뒷면" }],
      })
    ).rejects.toMatchObject({
      status: 500,
      message: "카드를 일괄 추가하지 못했습니다.",
    });
    expect(txCalls.count).toBe(1);
  });

  it("inserted item과 deck.updatedAt이 동일한 timestamp를 사용한다", async () => {
    const deck = makeDeckRow();
    const insertedRows = [
      makeItemRow({
        id: 13,
        publicId: "dki_test1",
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }),
    ];

    responses.push([deck], insertedRows, []);

    const result = await createCardDeckItems("user-1", "dck_test1", {
      items: [{ frontText: "앞면", backText: "뒷면" }],
    });

    expect(result[0].updatedAt).toBe(FIXED_NOW.toISOString());
    expect(result[0].updatedAt).toBe(insertedRows[0].updatedAt.toISOString());
  });

  it("deck.updatedAt 갱신은 transaction 콜백 안에서만 일어난다 (rollback 보장)", async () => {
    const deck = makeDeckRow();
    const insertedRows = [
      makeItemRow({
        id: 14,
        publicId: "dki_test1",
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }),
    ];

    responses.push([deck], insertedRows, []);

    await createCardDeckItems("user-1", "dck_test1", {
      items: [{ frontText: "앞면", backText: "뒷면" }],
    });

    expect(txOps.updateCount).toBeGreaterThanOrEqual(1);
    expect(txOps.outsideTxUpdateCount).toBe(0);
  });

  it("transaction 진입 전 실패하면 deck.updatedAt 도 갱신되지 않는다", async () => {
    const deck = makeDeckRow();
    responses.push([deck]);
    txControl.failure = new Error("DB write failed");

    await expect(
      createCardDeckItems("user-1", "dck_test1", {
        items: [{ frontText: "앞면", backText: "뒷면" }],
      })
    ).rejects.toMatchObject({ status: 500 });

    expect(txOps.updateCount).toBe(0);
    expect(txOps.insertCount).toBe(0);
  });
});
