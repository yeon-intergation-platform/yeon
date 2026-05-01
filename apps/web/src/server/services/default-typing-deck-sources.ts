export const DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES = {
  green: "green",
  productLegalAcceptedYellow: "product-legal-accepted-yellow",
  rejected: "rejected",
} as const;

type IncludedRightsStatus =
  (typeof DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES)["green"];

type RejectedRightsStatus =
  (typeof DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES)["rejected"];

export type DefaultTypingDeckSourcePassage = {
  passageId: string;
  sourceLocator: string;
  sourceUrl: string;
  sourcePermalink: string;
  cleanupNotes: string;
};

export type DefaultTypingDeckSource = {
  deckId: string;
  deckTitle: string;
  sourceWorkTitle: string;
  sourceAuthor: string;
  sourceEdition: string;
  rightsStatus: IncludedRightsStatus;
  sourceUrl: string;
  sourcePermalink: string;
  crossCheckUrls: readonly string[];
  licenseNotes: string;
  replacementForPreferredDeckTitle?: string;
  replacementRationale?: string;
  passages: readonly DefaultTypingDeckSourcePassage[];
};

export type RejectedDefaultTypingDeckSource = {
  preferredDeckTitle: string;
  rejectedSourceBasis: string;
  rightsStatus: RejectedRightsStatus;
  rejectionRationale: string;
  replacementDeckId: string;
};

export const FINAL_DEFAULT_TYPING_DECK_IDS = [
  "default-ko-jindallaekkot",
  "default-en-art-of-war-giles",
  "default-en-shakespeare-sonnets",
  "default-en-lincoln-addresses",
] as const;

const JINDALLAE_SOURCE_URL =
  "https://ko.wikisource.org/wiki/진달래꽃_(시집)";
const JINDALLAE_SOURCE_PERMALINK =
  "https://ko.wikisource.org/w/index.php?title=진달래꽃_(시집)&oldid=401458";
const ART_OF_WAR_SOURCE_URL = "https://www.gutenberg.org/ebooks/132";
const ART_OF_WAR_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/132/132-0.txt";
const SHAKESPEARE_SOURCE_URL = "https://www.gutenberg.org/ebooks/1041";
const SHAKESPEARE_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/1041/1041-0.txt";
const LINCOLN_SOURCE_URL = "https://www.gutenberg.org/ebooks/3253";
const LINCOLN_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/3253/3253-0.txt";

const PG_LICENSE_NOTES =
  "Project Gutenberg source used only for the public-domain work text; PG headers, footers, license, trademark language, editor introductions, and boilerplate are excluded from passages.";

const jindallaeCleanupNotes =
  "Wikisource navigation, section headings, notes, and license text omitted; poem text only, preserving source spelling except whitespace normalization for typing.";

const artOfWarCleanupNotes =
  "PG header/license, front matter, footnotes, and editor commentary omitted; Lionel Giles translation text only, with paragraph whitespace normalized for typing.";

const sonnetCleanupNotes =
  "PG header/license and collection headings omitted; sonnet text only, preserving original spelling and punctuation except whitespace normalization for typing.";

const lincolnCleanupNotes =
  "PG header/license, collection/editor headings, and editorial matter omitted; Lincoln address text only, with whitespace normalized for typing.";

export const REJECTED_DEFAULT_TYPING_DECK_SOURCES: readonly RejectedDefaultTypingDeckSource[] = [
  {
    preferredDeckTitle: "하늘과 바람과 별과 시",
    rejectedSourceBasis:
      "The approved plan records an unresolved U.S. copyright caveat for 1931-1977 Korean publications and no explicit product/legal acceptance note exists for this deck.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.rejected,
    rejectionRationale:
      "Yellow is Red under the approved plan; executor cannot approve the unresolved cross-jurisdiction publication caveat.",
    replacementDeckId: "default-ko-jindallaekkot",
  },
  {
    preferredDeckTitle: "손자병법 Korean translation",
    rejectedSourceBasis:
      "Korean translation sources have unresolved translator authorship/license and potential CC BY-SA obligations.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.rejected,
    rejectionRationale:
      "No unverified translations are allowed. The included deck uses the verified public-domain Lionel Giles English translation instead.",
    replacementDeckId: "default-en-art-of-war-giles",
  },
];

export const DEFAULT_TYPING_DECK_SOURCES: readonly DefaultTypingDeckSource[] = [
  {
    deckId: "default-ko-jindallaekkot",
    deckTitle: "진달래꽃 (시집)",
    sourceWorkTitle: "진달래꽃",
    sourceAuthor: "김소월",
    sourceEdition:
      "Korean Wikisource transcription of the 1925-12-26 MaeMunSa edition; author 김소월 lived 1902-1934.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: JINDALLAE_SOURCE_URL,
    sourcePermalink: JINDALLAE_SOURCE_PERMALINK,
    crossCheckUrls: [
      "https://ko.wikisource.org/wiki/저자:김소월",
      "https://encykorea.aks.ac.kr/Article/E0054622",
      "https://www.seoul.co.kr/news/society/2011/02/25/20110225029022",
    ],
    licenseNotes:
      "The Wikisource work page identifies publication by 매문사 on 1925-12-26 and marks the work PD-old-70. Because the edition was published before 1931 and the author died in 1934, this deck is treated as Green for the approved MVP source gate.",
    replacementForPreferredDeckTitle: "하늘과 바람과 별과 시",
    replacementRationale:
      "Keeps a Korean-language source/work-named default while replacing the 윤동주 deck that lacks explicit product/legal acceptance for its U.S. caveat.",
    passages: [
      "먼 후일",
      "풀따기",
      "바다",
      "산 위에",
      "옛이야기",
      "님의 노래",
      "실제 1",
      "님의 말씀",
      "님에게",
      "마른강 두덕에서",
      "봄 밤",
      "밤",
      "꿈꾼 그 옛날",
      "꿈으로 오는 한 사람",
      "눈 오는 저녁",
      "자주 구름",
      "두 사람",
      "닭소리",
      "못잊어",
      "예전엔 미처 몰랐어요",
    ].map((sourceLocator, index) => ({
      passageId: `default-ko-jindallaekkot-${String(index + 1).padStart(3, "0")}`,
      sourceLocator,
      sourceUrl: JINDALLAE_SOURCE_URL,
      sourcePermalink: JINDALLAE_SOURCE_PERMALINK,
      cleanupNotes: jindallaeCleanupNotes,
    })),
  },
  {
    deckId: "default-en-art-of-war-giles",
    deckTitle: "손자병법 / The Art of War (Giles)",
    sourceWorkTitle: "The Art of War",
    sourceAuthor: "Sunzi; translated by Lionel Giles",
    sourceEdition:
      "Project Gutenberg eBook #132, Lionel Giles English translation, originally published 1910.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: ART_OF_WAR_SOURCE_URL,
    sourcePermalink: ART_OF_WAR_SOURCE_PERMALINK,
    crossCheckUrls: ["https://en.wikisource.org/wiki/The_Art_of_War_(Sun)"],
    licenseNotes:
      "Sunzi is ancient and Lionel Giles died in 1958; the 1910 English translation is public-domain in the United States. " +
      PG_LICENSE_NOTES,
    passages: [
      "Chapter I, Laying Plans, paragraphs 1-2",
      "Chapter I, Laying Plans, paragraph 3",
      "Chapter I, Laying Plans, paragraph 4",
      "Chapter I, Laying Plans, paragraphs 5-6",
      "Chapter I, Laying Plans, paragraph 7",
      "Chapter I, Laying Plans, paragraphs 8-9",
      "Chapter I, Laying Plans, paragraph 10",
      "Chapter I, Laying Plans, paragraph 11",
      "Chapter I, Laying Plans, paragraph 12",
      "Chapter I, Laying Plans, paragraph 13",
      "Chapter I, Laying Plans, paragraph 14",
      "Chapter I, Laying Plans, paragraph 15",
      "Chapter I, Laying Plans, paragraphs 16-17",
      "Chapter I, Laying Plans, paragraph 18",
      "Chapter I, Laying Plans, paragraph 19",
      "Chapter I, Laying Plans, paragraph 20",
      "Chapter I, Laying Plans, paragraph 21",
      "Chapter I, Laying Plans, paragraph 22",
      "Chapter I, Laying Plans, paragraph 23",
      "Chapter I, Laying Plans, paragraphs 24-25",
    ].map((sourceLocator, index) => ({
      passageId: `default-en-art-of-war-giles-${String(index + 1).padStart(3, "0")}`,
      sourceLocator,
      sourceUrl: ART_OF_WAR_SOURCE_URL,
      sourcePermalink: ART_OF_WAR_SOURCE_PERMALINK,
      cleanupNotes: artOfWarCleanupNotes,
    })),
  },
  {
    deckId: "default-en-shakespeare-sonnets",
    deckTitle: "Shakespeare’s Sonnets",
    sourceWorkTitle: "Shakespeare's Sonnets",
    sourceAuthor: "William Shakespeare",
    sourceEdition:
      "Project Gutenberg eBook #1041, Shakespeare’s sonnet text, released 1997-09-01.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: SHAKESPEARE_SOURCE_URL,
    sourcePermalink: SHAKESPEARE_SOURCE_PERMALINK,
    crossCheckUrls: ["https://www.gutenberg.org/help/shakespeare.html"],
    licenseNotes:
      "Author died in 1616 and original sonnets were first published in 1609. " +
      PG_LICENSE_NOTES,
    passages: [
      "Sonnet 18",
      "Sonnet 19",
      "Sonnet 20",
      "Sonnet 21",
      "Sonnet 22",
      "Sonnet 23",
      "Sonnet 24",
      "Sonnet 25",
      "Sonnet 26",
      "Sonnet 27",
      "Sonnet 28",
      "Sonnet 29",
      "Sonnet 30",
      "Sonnet 31",
      "Sonnet 32",
      "Sonnet 33",
      "Sonnet 34",
      "Sonnet 35",
      "Sonnet 36",
      "Sonnet 37",
    ].map((sourceLocator, index) => ({
      passageId: `default-en-shakespeare-sonnets-${String(index + 1).padStart(3, "0")}`,
      sourceLocator,
      sourceUrl: SHAKESPEARE_SOURCE_URL,
      sourcePermalink: SHAKESPEARE_SOURCE_PERMALINK,
      cleanupNotes: sonnetCleanupNotes,
    })),
  },
  {
    deckId: "default-en-lincoln-addresses",
    deckTitle: "Lincoln’s Addresses",
    sourceWorkTitle: "The Papers and Writings of Abraham Lincoln, Complete",
    sourceAuthor: "Abraham Lincoln",
    sourceEdition:
      "Project Gutenberg eBook #3253, complete papers and writings collection; selected passages use Lincoln address text only.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: LINCOLN_SOURCE_URL,
    sourcePermalink: LINCOLN_SOURCE_PERMALINK,
    crossCheckUrls: [
      "https://www.loc.gov/item/2024697384/",
      "https://www.nps.gov/linc/learn/historyculture/gettysburgaddress.htm",
      "https://www.nps.gov/linc/learn/historyculture/lincoln-second-inaugural.htm",
    ],
    licenseNotes:
      "Lincoln died in 1865; selected address text is public-domain historical speech text. " +
      PG_LICENSE_NOTES,
    passages: [
      "First Inaugural Address, March 4, 1861, opening oath paragraph",
      "First Inaugural Address, March 4, 1861, no special anxiety paragraph",
      "First Inaugural Address, March 4, 1861, Southern States apprehension paragraph",
      "First Inaugural Address, March 4, 1861, protection of States paragraph",
      "First Inaugural Address, March 4, 1861, official oath paragraph",
      "First Inaugural Address, March 4, 1861, Union is perpetual paragraph",
      "First Inaugural Address, March 4, 1861, no State can lawfully leave paragraph",
      "First Inaugural Address, March 4, 1861, mystic chords closing paragraph",
      "Gettysburg Address, November 19, 1863, opening paragraph",
      "Gettysburg Address, November 19, 1863, civil war and dedication paragraph",
      "Gettysburg Address, November 19, 1863, larger sense paragraph",
      "Gettysburg Address, November 19, 1863, unfinished work closing paragraph",
      "Second Inaugural Address, March 4, 1865, opening paragraph",
      "Second Inaugural Address, March 4, 1865, war came paragraph",
      "Second Inaugural Address, March 4, 1865, slavery cause paragraph",
      "Second Inaugural Address, March 4, 1865, both read same Bible paragraph",
      "Second Inaugural Address, March 4, 1865, judgments of the Lord paragraph",
      "Second Inaugural Address, March 4, 1865, malice toward none paragraph",
      "Cooper Union Address, February 27, 1860, opening paragraph",
      "Address to the 166th Ohio Regiment, August 22, 1864, closing paragraph",
    ].map((sourceLocator, index) => ({
      passageId: `default-en-lincoln-addresses-${String(index + 1).padStart(3, "0")}`,
      sourceLocator,
      sourceUrl: LINCOLN_SOURCE_URL,
      sourcePermalink: LINCOLN_SOURCE_PERMALINK,
      cleanupNotes: lincolnCleanupNotes,
    })),
  },
];
