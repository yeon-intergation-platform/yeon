import { randomInt } from "node:crypto";

import { customAlphabet } from "nanoid";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  TYPING_PASSAGE_DIFFICULTIES,
  TYPING_PASSAGE_TEXT_TYPES,
  type CreateTypingDeckBody,
  type CreateTypingDeckPassageBody,
  type CreateTypingDeckPassagesBody,
  type CreateTypingRaceSeedBody,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckListQuery,
  type TypingDeckPassageDto,
  type TypingDeckSource,
  type TypingDeckVisibility,
  type TypingPassageDifficulty,
  type TypingPassageTextType,
  type TypingRaceSeedDto,
  type TypingRaceSeedVisibility,
  type UpdateTypingDeckBody,
  type UpdateTypingDeckPassageBody,
} from "@yeon/api-contract/typing-decks";

import { getDb } from "@/server/db";
import { typingDeckPassages, typingDecks } from "@/server/db/schema";

import { ServiceError } from "./service-error";

type TypingDeckRow = typeof typingDecks.$inferSelect;
type TypingDeckPassageRow = typeof typingDeckPassages.$inferSelect;
type DefaultTypingDeck = Omit<
  TypingDeckDto,
  "passageCount" | "isOwner" | "canEdit" | "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  passages: TypingDeckPassageDto[];
};

const PRIVATE_DECK_LOBBY_TITLE = "비공개 덱";
const STATIC_DEFAULT_CREATED_AT = "2026-05-01T00:00:00.000Z";
const idBody = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-",
  12,
);

function generateTypingDeckId() {
  return `tdk_${idBody()}`;
}

function generateTypingPassageId() {
  return `tps_${idBody()}`;
}

function defaultPassage(
  id: string,
  title: string,
  prompt: string,
  sortOrder: number,
  overrides: Partial<
    Pick<TypingDeckPassageDto, "textType" | "difficulty">
  > = {},
): TypingDeckPassageDto {
  return {
    id,
    title,
    prompt,
    textType: overrides.textType ?? TYPING_PASSAGE_TEXT_TYPES.short,
    difficulty: overrides.difficulty ?? TYPING_PASSAGE_DIFFICULTIES.normal,
    sortOrder,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
  };
}

export const DEFAULT_TYPING_DECKS: readonly DefaultTypingDeck[] = [
  {
    id: "default-ko-daily-rhythm",
    title: "한국어 기본 리듬",
    description:
      "짧은 문장과 자연스러운 호흡으로 정확도와 속도를 함께 기르는 기본 한국어 덱입니다.",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
    visibility: TYPING_DECK_VISIBILITY.public,
    source: TYPING_DECK_SOURCE.default,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
    passages: [
      defaultPassage(
        "default-ko-daily-rhythm-01",
        "정확도 워밍업",
        "오늘은 빠르게 치기보다 정확하게 끝까지 치는 연습을 합니다. 손끝에 힘을 빼고 문장의 흐름을 천천히 따라가세요.",
        0,
        { difficulty: TYPING_PASSAGE_DIFFICULTIES.easy },
      ),
      defaultPassage(
        "default-ko-daily-rhythm-02",
        "업무 메모",
        "회의 전에 핵심 질문을 세 가지로 정리하면 대화가 훨씬 선명해집니다. 기록은 짧게 남기고 결정 사항은 바로 공유합니다.",
        1,
      ),
      defaultPassage(
        "default-ko-daily-rhythm-03",
        "긴 호흡",
        "좋은 연습은 같은 문장을 무작정 반복하는 것이 아니라, 낯선 문장에서도 일정한 리듬을 유지하는 감각을 기르는 데서 시작됩니다.",
        2,
        { textType: TYPING_PASSAGE_TEXT_TYPES.long },
      ),
    ],
  },
  {
    id: "default-en-flow-basics",
    title: "English Flow Basics",
    description:
      "A default English deck for steady rhythm, word grouping, and comfortable typing flow.",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
    visibility: TYPING_DECK_VISIBILITY.public,
    source: TYPING_DECK_SOURCE.default,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
    passages: [
      defaultPassage(
        "default-en-flow-basics-01",
        "Flow warmup",
        "Keep your eyes one word ahead and let your fingers follow the rhythm. Smooth typing begins with relaxed shoulders and steady breathing.",
        0,
        { difficulty: TYPING_PASSAGE_DIFFICULTIES.easy },
      ),
      defaultPassage(
        "default-en-flow-basics-02",
        "Product note",
        "Small improvements compound when the team writes down decisions, checks the outcome, and keeps the next action visible to everyone.",
        1,
      ),
      defaultPassage(
        "default-en-flow-basics-03",
        "Long cadence",
        "Typing practice becomes more useful when each passage has a different cadence, because real work rarely arrives in perfectly repeated sentences.",
        2,
        { textType: TYPING_PASSAGE_TEXT_TYPES.long },
      ),
    ],
  },
];

function toIso(value: Date): string {
  return value.toISOString();
}

function toLanguageTag(value: string): TypingDeckLanguageTag {
  if (
    value === TYPING_DECK_LANGUAGE_TAGS.ko ||
    value === TYPING_DECK_LANGUAGE_TAGS.en ||
    value === TYPING_DECK_LANGUAGE_TAGS.mixed ||
    value === TYPING_DECK_LANGUAGE_TAGS.code
  ) {
    return value;
  }
  return TYPING_DECK_LANGUAGE_TAGS.mixed;
}

function toVisibility(value: string): TypingDeckVisibility {
  return value === TYPING_DECK_VISIBILITY.public
    ? TYPING_DECK_VISIBILITY.public
    : TYPING_DECK_VISIBILITY.private;
}

function toSource(value: string): TypingDeckSource {
  return value === TYPING_DECK_SOURCE.default
    ? TYPING_DECK_SOURCE.default
    : TYPING_DECK_SOURCE.user;
}

function toTextType(value: string): TypingPassageTextType {
  if (
    value === TYPING_PASSAGE_TEXT_TYPES.long ||
    value === TYPING_PASSAGE_TEXT_TYPES.code
  ) {
    return value;
  }
  return TYPING_PASSAGE_TEXT_TYPES.short;
}

function toDifficulty(value: string): TypingPassageDifficulty {
  if (
    value === TYPING_PASSAGE_DIFFICULTIES.easy ||
    value === TYPING_PASSAGE_DIFFICULTIES.hard
  ) {
    return value;
  }
  return TYPING_PASSAGE_DIFFICULTIES.normal;
}

function toDeckDto(
  row: TypingDeckRow,
  passageCount: number,
  currentUserId: string | null,
): TypingDeckDto {
  const isOwner = Boolean(
    currentUserId && row.ownerUserId && currentUserId === row.ownerUserId,
  );

  return {
    id: row.publicId,
    title: row.title,
    description: row.description,
    languageTag: toLanguageTag(row.languageTag),
    visibility: toVisibility(row.visibility),
    source: toSource(row.source),
    passageCount,
    isOwner,
    canEdit: isOwner && row.source === TYPING_DECK_SOURCE.user,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function toDefaultDeckDto(deck: DefaultTypingDeck): TypingDeckDto {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    languageTag: deck.languageTag,
    visibility: deck.visibility,
    source: deck.source,
    passageCount: deck.passages.length,
    isOwner: false,
    canEdit: false,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  };
}

function toPassageDto(row: TypingDeckPassageRow): TypingDeckPassageDto {
  return {
    id: row.publicId,
    title: row.title,
    prompt: row.prompt,
    textType: toTextType(row.textType),
    difficulty: toDifficulty(row.difficulty),
    sortOrder: row.sortOrder,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function normalizeTitle(value: string): string {
  const title = value.trim();
  if (!title) {
    throw new ServiceError(400, "덱 제목을 입력해주세요.");
  }
  return title;
}

function normalizeDescription(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function normalizePassageTitle(
  value: string | null | undefined,
): string | null {
  return value?.trim() || null;
}

function normalizePrompt(value: string): string {
  const prompt = value.trim();
  if (!prompt) {
    throw new ServiceError(400, "연습 문장을 입력해주세요.");
  }
  return prompt;
}

function languageMatches(
  deckLanguage: TypingDeckLanguageTag,
  filter: TypingDeckLanguageTag | undefined,
): boolean {
  if (!filter) {
    return true;
  }
  if (deckLanguage === filter) {
    return true;
  }
  return (
    deckLanguage === TYPING_DECK_LANGUAGE_TAGS.mixed &&
    (filter === TYPING_DECK_LANGUAGE_TAGS.ko ||
      filter === TYPING_DECK_LANGUAGE_TAGS.en)
  );
}

function languageWhere(languageTag: TypingDeckLanguageTag | undefined) {
  if (!languageTag) {
    return undefined;
  }
  if (
    languageTag === TYPING_DECK_LANGUAGE_TAGS.ko ||
    languageTag === TYPING_DECK_LANGUAGE_TAGS.en
  ) {
    return or(
      eq(typingDecks.languageTag, languageTag),
      eq(typingDecks.languageTag, TYPING_DECK_LANGUAGE_TAGS.mixed),
    );
  }
  return eq(typingDecks.languageTag, languageTag);
}

function filterDefaultDecks(
  languageTag: TypingDeckLanguageTag | undefined,
): TypingDeckDto[] {
  return DEFAULT_TYPING_DECKS.filter((deck) =>
    languageMatches(deck.languageTag, languageTag),
  ).map(toDefaultDeckDto);
}

function findDefaultDeck(deckPublicId: string): DefaultTypingDeck | null {
  return DEFAULT_TYPING_DECKS.find((deck) => deck.id === deckPublicId) ?? null;
}

async function findDbDeckRow(
  deckPublicId: string,
): Promise<TypingDeckRow | null> {
  const [row] = await getDb()
    .select()
    .from(typingDecks)
    .where(eq(typingDecks.publicId, deckPublicId))
    .limit(1);
  return row ?? null;
}

async function findReadableDbDeckRow(
  currentUserId: string | null,
  deckPublicId: string,
): Promise<TypingDeckRow> {
  const row = await findDbDeckRow(deckPublicId);
  if (!row) {
    throw new ServiceError(404, "타자 덱을 찾지 못했습니다.");
  }

  const isOwner = Boolean(
    currentUserId && row.ownerUserId && currentUserId === row.ownerUserId,
  );
  if (row.visibility === TYPING_DECK_VISIBILITY.public || isOwner) {
    return row;
  }

  throw new ServiceError(404, "타자 덱을 찾지 못했습니다.");
}

async function findOwnedDbDeckRow(
  currentUserId: string | null,
  deckPublicId: string,
): Promise<TypingDeckRow> {
  if (!currentUserId) {
    throw new ServiceError(401, "로그인이 필요합니다.");
  }

  const row = await findDbDeckRow(deckPublicId);
  if (!row || row.ownerUserId !== currentUserId) {
    throw new ServiceError(404, "타자 덱을 찾지 못했습니다.");
  }
  return row;
}

async function findOwnedPassageRow(
  currentUserId: string | null,
  deckPublicId: string,
  passagePublicId: string,
): Promise<{ deck: TypingDeckRow; passage: TypingDeckPassageRow }> {
  const deck = await findOwnedDbDeckRow(currentUserId, deckPublicId);
  const [passage] = await getDb()
    .select()
    .from(typingDeckPassages)
    .where(
      and(
        eq(typingDeckPassages.publicId, passagePublicId),
        eq(typingDeckPassages.deckId, deck.id),
      ),
    )
    .limit(1);

  if (!passage) {
    throw new ServiceError(404, "연습 문장을 찾지 못했습니다.");
  }

  return { deck, passage };
}

export async function listTypingDecks(
  currentUserId: string | null,
  query: TypingDeckListQuery,
): Promise<TypingDeckDto[]> {
  if (query.scope === "mine" && !currentUserId) {
    throw new ServiceError(401, "로그인이 필요합니다.");
  }

  const whereParts = [];
  const languageFilter = languageWhere(query.languageTag);
  if (languageFilter) {
    whereParts.push(languageFilter);
  }

  if (query.scope === "mine") {
    whereParts.push(eq(typingDecks.ownerUserId, currentUserId!));
  } else if (query.scope === "public") {
    whereParts.push(eq(typingDecks.visibility, TYPING_DECK_VISIBILITY.public));
  } else if (query.scope === "all") {
    const readableDbDecks = currentUserId
      ? or(
          eq(typingDecks.visibility, TYPING_DECK_VISIBILITY.public),
          eq(typingDecks.ownerUserId, currentUserId),
        )
      : eq(typingDecks.visibility, TYPING_DECK_VISIBILITY.public);
    whereParts.push(readableDbDecks);
  }

  const includeDefaults =
    query.scope === "default" ||
    query.scope === "all" ||
    (query.scope === "public" && query.includeDefaults);

  if (query.scope === "default") {
    return filterDefaultDecks(query.languageTag);
  }

  const rows = await getDb()
    .select({
      id: typingDecks.id,
      publicId: typingDecks.publicId,
      ownerUserId: typingDecks.ownerUserId,
      title: typingDecks.title,
      description: typingDecks.description,
      languageTag: typingDecks.languageTag,
      visibility: typingDecks.visibility,
      source: typingDecks.source,
      createdAt: typingDecks.createdAt,
      updatedAt: typingDecks.updatedAt,
      passageCount: sql<number>`count(${typingDeckPassages.id})::int`.mapWith(
        Number,
      ),
    })
    .from(typingDecks)
    .leftJoin(typingDeckPassages, eq(typingDeckPassages.deckId, typingDecks.id))
    .where(and(...whereParts))
    .groupBy(typingDecks.id)
    .orderBy(desc(typingDecks.createdAt));

  const dbDecks = rows.map((row) =>
    toDeckDto(
      {
        id: row.id,
        publicId: row.publicId,
        ownerUserId: row.ownerUserId,
        title: row.title,
        description: row.description,
        languageTag: row.languageTag,
        visibility: row.visibility,
        source: row.source,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      row.passageCount,
      currentUserId,
    ),
  );

  return includeDefaults
    ? [...filterDefaultDecks(query.languageTag), ...dbDecks]
    : dbDecks;
}

export async function createTypingDeck(
  currentUserId: string | null,
  body: CreateTypingDeckBody,
): Promise<TypingDeckDto> {
  if (!currentUserId) {
    throw new ServiceError(401, "로그인이 필요합니다.");
  }

  const now = new Date();
  const [row] = await getDb()
    .insert(typingDecks)
    .values({
      publicId: generateTypingDeckId(),
      ownerUserId: currentUserId,
      title: normalizeTitle(body.title),
      description: normalizeDescription(body.description),
      languageTag: body.languageTag,
      visibility: body.visibility,
      source: TYPING_DECK_SOURCE.user,
      updatedAt: now,
    })
    .returning();

  if (!row) {
    throw new ServiceError(500, "타자 덱을 생성하지 못했습니다.");
  }

  return toDeckDto(row, 0, currentUserId);
}

export async function getTypingDeckDetail(
  currentUserId: string | null,
  deckPublicId: string,
): Promise<{ deck: TypingDeckDto; passages: TypingDeckPassageDto[] }> {
  const defaultDeck = findDefaultDeck(deckPublicId);
  if (defaultDeck) {
    return {
      deck: toDefaultDeckDto(defaultDeck),
      passages: defaultDeck.passages,
    };
  }

  const deckRow = await findReadableDbDeckRow(currentUserId, deckPublicId);
  const passages = await getDb()
    .select()
    .from(typingDeckPassages)
    .where(eq(typingDeckPassages.deckId, deckRow.id))
    .orderBy(
      asc(typingDeckPassages.sortOrder),
      asc(typingDeckPassages.createdAt),
    );

  return {
    deck: toDeckDto(deckRow, passages.length, currentUserId),
    passages: passages.map(toPassageDto),
  };
}

export async function updateTypingDeck(
  currentUserId: string | null,
  deckPublicId: string,
  body: UpdateTypingDeckBody,
): Promise<TypingDeckDto> {
  const existingDeck = await findOwnedDbDeckRow(currentUserId, deckPublicId);
  const updateFields: Partial<typeof typingDecks.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) {
    updateFields.title = normalizeTitle(body.title);
  }
  if (body.description !== undefined) {
    updateFields.description = normalizeDescription(body.description);
  }
  if (body.languageTag !== undefined) {
    updateFields.languageTag = body.languageTag;
  }
  if (body.visibility !== undefined) {
    updateFields.visibility = body.visibility;
  }

  const [updated] = await getDb()
    .update(typingDecks)
    .set(updateFields)
    .where(eq(typingDecks.id, existingDeck.id))
    .returning();

  if (!updated) {
    throw new ServiceError(500, "타자 덱을 수정하지 못했습니다.");
  }

  const [{ count }] = await getDb()
    .select({
      count: sql<number>`count(${typingDeckPassages.id})::int`.mapWith(Number),
    })
    .from(typingDeckPassages)
    .where(eq(typingDeckPassages.deckId, updated.id));

  return toDeckDto(updated, count, currentUserId);
}

export async function deleteTypingDeck(
  currentUserId: string | null,
  deckPublicId: string,
): Promise<void> {
  const existingDeck = await findOwnedDbDeckRow(currentUserId, deckPublicId);
  await getDb().delete(typingDecks).where(eq(typingDecks.id, existingDeck.id));
}

function normalizePassageInsert(
  deckId: bigint,
  body: CreateTypingDeckPassageBody,
  fallbackSortOrder: number,
  now: Date,
): typeof typingDeckPassages.$inferInsert {
  return {
    publicId: generateTypingPassageId(),
    deckId,
    title: normalizePassageTitle(body.title),
    prompt: normalizePrompt(body.prompt),
    textType: body.textType,
    difficulty: body.difficulty,
    sortOrder: body.sortOrder ?? fallbackSortOrder,
    updatedAt: now,
  };
}

export async function createTypingDeckPassage(
  currentUserId: string | null,
  deckPublicId: string,
  body: CreateTypingDeckPassageBody,
): Promise<TypingDeckPassageDto> {
  const deckRow = await findOwnedDbDeckRow(currentUserId, deckPublicId);
  const [{ count }] = await getDb()
    .select({
      count: sql<number>`count(${typingDeckPassages.id})::int`.mapWith(Number),
    })
    .from(typingDeckPassages)
    .where(eq(typingDeckPassages.deckId, deckRow.id));
  const now = new Date();
  const [row] = await getDb()
    .insert(typingDeckPassages)
    .values(normalizePassageInsert(deckRow.id, body, count, now))
    .returning();

  if (!row) {
    throw new ServiceError(500, "연습 문장을 추가하지 못했습니다.");
  }

  await getDb()
    .update(typingDecks)
    .set({ updatedAt: now })
    .where(eq(typingDecks.id, deckRow.id));

  return toPassageDto(row);
}

export async function createTypingDeckPassages(
  currentUserId: string | null,
  deckPublicId: string,
  body: CreateTypingDeckPassagesBody,
): Promise<TypingDeckPassageDto[]> {
  const deckRow = await findOwnedDbDeckRow(currentUserId, deckPublicId);
  const [{ count }] = await getDb()
    .select({
      count: sql<number>`count(${typingDeckPassages.id})::int`.mapWith(Number),
    })
    .from(typingDeckPassages)
    .where(eq(typingDeckPassages.deckId, deckRow.id));
  const now = new Date();
  const values = body.passages.map((passage, index) =>
    normalizePassageInsert(deckRow.id, passage, count + index, now),
  );

  return getDb().transaction(async (tx) => {
    const rows = await tx.insert(typingDeckPassages).values(values).returning();
    await tx
      .update(typingDecks)
      .set({ updatedAt: now })
      .where(eq(typingDecks.id, deckRow.id));
    return rows.map(toPassageDto);
  });
}

export async function updateTypingDeckPassage(
  currentUserId: string | null,
  deckPublicId: string,
  passagePublicId: string,
  body: UpdateTypingDeckPassageBody,
): Promise<TypingDeckPassageDto> {
  const { deck, passage } = await findOwnedPassageRow(
    currentUserId,
    deckPublicId,
    passagePublicId,
  );
  const now = new Date();
  const updateFields: Partial<typeof typingDeckPassages.$inferInsert> = {
    updatedAt: now,
  };

  if (body.title !== undefined) {
    updateFields.title = normalizePassageTitle(body.title);
  }
  if (body.prompt !== undefined) {
    updateFields.prompt = normalizePrompt(body.prompt);
  }
  if (body.textType !== undefined) {
    updateFields.textType = body.textType;
  }
  if (body.difficulty !== undefined) {
    updateFields.difficulty = body.difficulty;
  }
  if (body.sortOrder !== undefined) {
    updateFields.sortOrder = body.sortOrder;
  }

  const [updated] = await getDb()
    .update(typingDeckPassages)
    .set(updateFields)
    .where(eq(typingDeckPassages.id, passage.id))
    .returning();

  if (!updated) {
    throw new ServiceError(500, "연습 문장을 수정하지 못했습니다.");
  }

  await getDb()
    .update(typingDecks)
    .set({ updatedAt: now })
    .where(eq(typingDecks.id, deck.id));

  return toPassageDto(updated);
}

export async function deleteTypingDeckPassage(
  currentUserId: string | null,
  deckPublicId: string,
  passagePublicId: string,
): Promise<void> {
  const { deck, passage } = await findOwnedPassageRow(
    currentUserId,
    deckPublicId,
    passagePublicId,
  );
  await getDb().transaction(async (tx) => {
    await tx
      .delete(typingDeckPassages)
      .where(eq(typingDeckPassages.id, passage.id));
    await tx
      .update(typingDecks)
      .set({ updatedAt: new Date() })
      .where(eq(typingDecks.id, deck.id));
  });
}

function pickPassage(
  passages: TypingDeckPassageDto[],
  requestedPassageId: string | undefined,
): TypingDeckPassageDto {
  if (requestedPassageId) {
    const requested = passages.find(
      (passage) => passage.id === requestedPassageId,
    );
    if (!requested) {
      throw new ServiceError(404, "연습 문장을 찾지 못했습니다.");
    }
    return requested;
  }

  if (passages.length === 0) {
    throw new ServiceError(400, "덱에 연습 문장이 없습니다.");
  }

  return passages[randomInt(passages.length)]!;
}

function toRaceVisibility(deck: TypingDeckDto): TypingRaceSeedVisibility {
  return deck.source === TYPING_DECK_SOURCE.default
    ? TYPING_DECK_SOURCE.default
    : deck.visibility;
}

function toLobbyDeckTitle(deck: TypingDeckDto): string {
  return deck.visibility === TYPING_DECK_VISIBILITY.private
    ? PRIVATE_DECK_LOBBY_TITLE
    : deck.title;
}

export async function createTypingRaceSeed(
  currentUserId: string | null,
  deckPublicId: string,
  body: CreateTypingRaceSeedBody,
): Promise<TypingRaceSeedDto> {
  const detail = await getTypingDeckDetail(currentUserId, deckPublicId);
  const passage = pickPassage(detail.passages, body.passageId);

  return {
    passageId: passage.id,
    prompt: passage.prompt,
    roundLabel: passage.title ?? detail.deck.title,
    deckId: detail.deck.id,
    deckVisibility: toRaceVisibility(detail.deck),
    lobbyDeckTitle: toLobbyDeckTitle(detail.deck),
    participantDeckTitle: detail.deck.title,
    languageTag: detail.deck.languageTag,
  };
}
