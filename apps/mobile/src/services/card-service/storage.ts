import {
  CARD_STUDY_MODES,
  type CardDeckDetailResponse,
  type CardDeckDto,
  type CardDeckItemDto,
  type CardReviewDifficulty,
  type CardStudyMode,
  type CreateCardDeckBody,
  type CreateCardDeckItemBody,
  type CreateCardDeckItemsBody,
  type UpdateCardDeckBody,
  type UpdateCardDeckItemBody,
} from "@yeon/api-contract/card-decks";
import {
  createYeonRandomUUID,
  getYeonNow,
  getYeonOptionalLocalStorage,
  getYeonRandom,
  getYeonSecureStorage,
} from "@yeon/ui/native";

const GUEST_CARD_SERVICE_STORAGE_KEY = "yeon.mobile.guest.card-service";
const inMemoryStorage = new Map<string, string>();

type CardRecord = {
  readonly id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type CardItemRecord = {
  readonly id: string;
  deckId: string;
  frontText: string;
  backText: string;
  imageStorageKey: string | null;
  reviewDifficulty: CardReviewDifficulty | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type GuestCardServiceState = {
  studyMode: CardStudyMode;
  decks: CardRecord[];
  items: CardItemRecord[];
};

const DEFAULT_STUDY_MODE = CARD_STUDY_MODES.flashcard;
const REVIEW_INTERVAL_DAYS: Record<CardReviewDifficulty, number> = {
  hard: 1,
  good: 3,
  easy: 4,
};

type StorageProvider = {
  deleteItemAsync(key: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

function getStorageProvider(): StorageProvider {
  const secureStorage = getYeonSecureStorage();

  if (secureStorage) {
    return secureStorage;
  }

  const browserStorage = getYeonOptionalLocalStorage();
  if (browserStorage) {
    return {
      deleteItemAsync: (key) => Promise.resolve(browserStorage.removeItem(key)),
      getItemAsync: (key) => Promise.resolve(browserStorage.getItem(key)),
      setItemAsync: (key, value) =>
        Promise.resolve(browserStorage.setItem(key, value)),
    };
  }

  return {
    deleteItemAsync: async (key) => {
      inMemoryStorage.delete(key);
    },
    getItemAsync: async (key) => inMemoryStorage.get(key) ?? null,
    setItemAsync: async (key, value) => {
      inMemoryStorage.set(key, value);
    },
  };
}

function nowIso(): string {
  return new Date(getYeonNow()).toISOString();
}

function randomId(): string {
  const randomUUID = createYeonRandomUUID();

  if (randomUUID) {
    return randomUUID;
  }

  return `${getYeonNow().toString(36)}-${getYeonRandom().toString(36).slice(2, 10)}`;
}

function ensureDecksByCreatedAt(state: GuestCardServiceState): CardDeckDto[] {
  return state.decks
    .map((deck) => ({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      itemCount: state.items.filter((item) => item.deckId === deck.id).length,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function toGuestCardItemDto(item: CardItemRecord): CardDeckItemDto {
  return {
    id: item.id,
    frontText: item.frontText,
    backText: item.backText,
    imageStorageKey: item.imageStorageKey,
    imageUrl: item.imageStorageKey
      ? `/api/v1/card-decks/assets/${encodeURIComponent(item.imageStorageKey)}`
      : null,
    reviewDifficulty: item.reviewDifficulty,
    lastReviewedAt: item.lastReviewedAt,
    nextReviewAt: item.nextReviewAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toGuestDeckDetail(
  state: GuestCardServiceState,
  deckId: string
): CardDeckDetailResponse | null {
  const deck = state.decks.find((candidate) => candidate.id === deckId);
  if (!deck) {
    return null;
  }

  const items = state.items
    .filter((item) => item.deckId === deckId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map(toGuestCardItemDto);

  return {
    deck: {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      itemCount: items.length,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    },
    items,
    studyMode: state.studyMode,
  };
}

function addIsoDays(date: string, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

async function readState(): Promise<GuestCardServiceState> {
  const storage = getStorageProvider();
  const raw = await storage.getItemAsync(GUEST_CARD_SERVICE_STORAGE_KEY);
  if (!raw) {
    return { studyMode: DEFAULT_STUDY_MODE, decks: [], items: [] };
  }

  try {
    const parsed = JSON.parse(raw) as GuestCardServiceState;
    return {
      studyMode: parsed.studyMode ?? DEFAULT_STUDY_MODE,
      decks: parsed.decks ?? [],
      items: parsed.items ?? [],
    };
  } catch {
    return { studyMode: DEFAULT_STUDY_MODE, decks: [], items: [] };
  }
}

async function writeState(next: GuestCardServiceState): Promise<void> {
  const storage = getStorageProvider();
  await storage.setItemAsync(
    GUEST_CARD_SERVICE_STORAGE_KEY,
    JSON.stringify(next)
  );
}

export async function getGuestCardStudyMode(): Promise<CardStudyMode> {
  const state = await readState();
  return state.studyMode;
}

export async function setGuestCardStudyMode(
  studyMode: CardStudyMode
): Promise<void> {
  const state = await readState();
  await writeState({ ...state, studyMode });
}

export async function listGuestDecks(): Promise<CardDeckDto[]> {
  const state = await readState();
  return ensureDecksByCreatedAt(state);
}

export async function getGuestDeckDetail(
  deckId: string
): Promise<CardDeckDetailResponse | null> {
  const state = await readState();
  return toGuestDeckDetail(state, deckId);
}

export async function createGuestDeck(
  body: CreateCardDeckBody
): Promise<CardDeckDto> {
  const state = await readState();
  const createdAt = nowIso();
  const deck = {
    id: randomId(),
    title: body.title,
    description: body.description ?? null,
    createdAt,
    updatedAt: createdAt,
  };
  const nextDecks = [...state.decks, deck];
  await writeState({ ...state, decks: nextDecks });

  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    itemCount: 0,
    createdAt,
    updatedAt: createdAt,
  };
}

export async function updateGuestDeck(
  deckId: string,
  body: UpdateCardDeckBody
): Promise<CardDeckDto> {
  const state = await readState();
  const index = state.decks.findIndex((deck) => deck.id === deckId);
  if (index === -1) {
    throw new Error("덱을 찾을 수 없습니다.");
  }

  const deck = state.decks[index];
  if (!deck) {
    throw new Error("덱을 찾을 수 없습니다.");
  }

  const updatedDeck: CardRecord = {
    ...deck,
    title: body.title ?? deck.title,
    description:
      body.description === undefined
        ? deck.description
        : (body.description ?? null),
    updatedAt: nowIso(),
  };

  const nextDecks = [...state.decks];
  nextDecks[index] = updatedDeck;
  await writeState({ ...state, decks: nextDecks });
  return {
    id: updatedDeck.id,
    title: updatedDeck.title,
    description: updatedDeck.description,
    itemCount: state.items.filter((item) => item.deckId === deckId).length,
    createdAt: updatedDeck.createdAt,
    updatedAt: updatedDeck.updatedAt,
  };
}

export async function deleteGuestDeck(deckId: string): Promise<void> {
  const state = await readState();
  await writeState({
    ...state,
    decks: state.decks.filter((deck) => deck.id !== deckId),
    items: state.items.filter((item) => item.deckId !== deckId),
  });
}

export async function createGuestCard(
  deckId: string,
  body: CreateCardDeckItemBody
): Promise<CardDeckItemDto> {
  const state = await readState();
  const deck = state.decks.find((item) => item.id === deckId);
  if (!deck) {
    throw new Error("덱을 찾을 수 없습니다.");
  }
  const now = nowIso();
  const card = {
    id: randomId(),
    deckId,
    frontText: body.frontText,
    backText: body.backText,
    imageStorageKey: body.imageStorageKey ?? null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const nextItems = [...state.items, card];
  const nextDecks = state.decks.map((item) =>
    item.id === deckId ? { ...item, updatedAt: now } : item
  );

  await writeState({ ...state, decks: nextDecks, items: nextItems });

  return toGuestCardItemDto(card);
}

export async function createGuestCards(
  deckId: string,
  body: CreateCardDeckItemsBody
): Promise<CardDeckItemDto[]> {
  const state = await readState();
  const deck = state.decks.find((item) => item.id === deckId);
  if (!deck) {
    throw new Error("덱을 찾을 수 없습니다.");
  }

  const now = nowIso();
  const cards = body.items.map((item) => ({
    id: randomId(),
    deckId,
    frontText: item.frontText,
    backText: item.backText,
    imageStorageKey: item.imageStorageKey ?? null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const nextItems = [...state.items, ...cards];
  const nextDecks = state.decks.map((item) =>
    item.id === deckId ? { ...item, updatedAt: now } : item
  );
  await writeState({ ...state, decks: nextDecks, items: nextItems });
  return cards.map(toGuestCardItemDto);
}

export async function replaceGuestCards(
  deckId: string,
  body: CreateCardDeckItemsBody
): Promise<CardDeckItemDto[]> {
  const state = await readState();
  const deck = state.decks.find((item) => item.id === deckId);
  if (!deck) {
    throw new Error("덱을 찾을 수 없습니다.");
  }

  const now = nowIso();
  const cards = body.items.map((item) => ({
    id: randomId(),
    deckId,
    frontText: item.frontText,
    backText: item.backText,
    imageStorageKey: item.imageStorageKey ?? null,
    reviewDifficulty: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  await writeState({
    ...state,
    decks: state.decks.map((item) =>
      item.id === deckId ? { ...item, updatedAt: now } : item
    ),
    items: [...state.items.filter((item) => item.deckId !== deckId), ...cards],
  });

  return cards.map(toGuestCardItemDto);
}

export async function updateGuestCard(
  itemId: string,
  body: UpdateCardDeckItemBody
): Promise<CardDeckItemDto> {
  const state = await readState();
  const index = state.items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw new Error("카드를 찾을 수 없습니다.");
  }

  const current = state.items[index];
  if (!current) {
    throw new Error("카드를 찾을 수 없습니다.");
  }

  const now = nowIso();
  const updated: CardItemRecord = {
    ...current,
    frontText: body.frontText ?? current.frontText,
    backText: body.backText ?? current.backText,
    imageStorageKey:
      body.imageStorageKey === undefined
        ? current.imageStorageKey
        : body.imageStorageKey,
    updatedAt: now,
  };
  const nextItems = [...state.items];
  nextItems[index] = updated;

  const nextDecks = state.decks.map((deck) =>
    deck.id === current.deckId ? { ...deck, updatedAt: now } : deck
  );

  await writeState({ ...state, decks: nextDecks, items: nextItems });
  return toGuestCardItemDto(updated);
}

export async function deleteGuestCard(itemId: string): Promise<void> {
  const state = await readState();
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    return;
  }

  const now = nowIso();
  await writeState({
    ...state,
    items: state.items.filter((candidate) => candidate.id !== itemId),
    decks: state.decks.map((deck) =>
      deck.id === item.deckId ? { ...deck, updatedAt: now } : deck
    ),
  });
}

export async function reviewGuestCard(
  itemId: string,
  difficulty: CardReviewDifficulty
): Promise<CardDeckItemDto> {
  const state = await readState();
  const index = state.items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw new Error("카드를 찾을 수 없습니다.");
  }

  const current = state.items[index];
  if (!current) {
    throw new Error("카드를 찾을 수 없습니다.");
  }

  const now = nowIso();
  const nextReviewAt = addIsoDays(now, REVIEW_INTERVAL_DAYS[difficulty]);
  const updated: CardItemRecord = {
    ...current,
    reviewDifficulty: difficulty,
    lastReviewedAt: now,
    nextReviewAt,
    updatedAt: now,
  };

  const nextItems = [...state.items];
  nextItems[index] = updated;
  await writeState({ ...state, items: nextItems });
  return toGuestCardItemDto(updated);
}

export async function clearGuestCardDecks(): Promise<void> {
  const storage = getStorageProvider();
  await storage.deleteItemAsync(GUEST_CARD_SERVICE_STORAGE_KEY);
}

export async function countGuestDecks(): Promise<number> {
  const state = await readState();
  return state.decks.length;
}
