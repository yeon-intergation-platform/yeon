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

const PG_LICENSE_NOTES =
  "Project Gutenberg source used only for the public-domain work text; PG headers, footers, license, trademark language, editor introductions, and boilerplate are excluded from passages.";

const SUNZI_SOURCE_URL = "https://www.gutenberg.org/ebooks/23864";
const SUNZI_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/23864/23864-0.txt";
const SHAKESPEARE_SOURCE_URL = "https://www.gutenberg.org/ebooks/1041";
const SHAKESPEARE_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/1041/1041-0.txt";
const LINCOLN_SOURCE_URL = "https://www.gutenberg.org/ebooks/14721";
const LINCOLN_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/14721/14721-0.txt";
const AESOP_SOURCE_URL = "https://www.gutenberg.org/ebooks/21";
const AESOP_SOURCE_PERMALINK =
  "https://www.gutenberg.org/files/21/21-0.txt";

const sunziCleanupNotes =
  "PG header/license omitted; original Classical Chinese source paragraph used as-is; no Korean or English translation embedded.";

const sonnetCleanupNotes =
  "PG header/license and collection headings omitted; sonnet text only, preserving original spelling and punctuation except whitespace normalization for typing.";

const lincolnCleanupNotes =
  "PG header/license, collection headings, ellipses, and editorial matter omitted; Lincoln address text only, with whitespace normalized for typing.";

const aesopCleanupNotes =
  "PG header/license, table of contents, preface, and surrounding headings omitted; fable body and moral only, with whitespace normalized for typing.";

export const REJECTED_DEFAULT_TYPING_DECK_SOURCES: readonly RejectedDefaultTypingDeckSource[] = [
  {
    preferredDeckTitle: "하늘과 바람과 별과 시",
    rejectedSourceBasis:
      "Korean Wikisource/source-library editions remain Yellow because the plan records a U.S. copyright caveat for 1931-1977 Korean publications and no explicit product/legal acceptance exists.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.rejected,
    rejectionRationale:
      "Yellow is Red under the approved plan; executor cannot approve the unresolved cross-jurisdiction publication caveat.",
    replacementDeckId: "default-en-aesop-fables-townsend",
  },
  {
    preferredDeckTitle: "손자병법 Korean translation",
    rejectedSourceBasis:
      "Korean translation sources have unresolved translator authorship/license and potential CC BY-SA obligations.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.rejected,
    rejectionRationale:
      "No unverified translations are allowed. The included deck uses the ancient original Classical Chinese text instead of a translation.",
    replacementDeckId: "default-mixed-sunzi-bingfa",
  },
];

export const DEFAULT_TYPING_DECK_SOURCES: readonly DefaultTypingDeckSource[] = [
  {
    deckId: "default-mixed-sunzi-bingfa",
    deckTitle: "손자병법 (孫子兵法)",
    sourceWorkTitle: "孫子兵法",
    sourceAuthor: "Sunzi",
    sourceEdition:
      "Project Gutenberg eBook #23864, Classical Chinese original, produced by Wen Yen, released 2007-12-15.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: SUNZI_SOURCE_URL,
    sourcePermalink: SUNZI_SOURCE_PERMALINK,
    crossCheckUrls: ["https://zh.wikisource.org/zh-hans/孫子兵法"],
    licenseNotes:
      "Ancient Classical Chinese work; no modern translation text is embedded. " +
      PG_LICENSE_NOTES,
    passages: [
      {
        passageId: "default-mixed-sunzi-bingfa-001",
        sourceLocator: "始計第一, opening paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-002",
        sourceLocator: "始計第一, five factors paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-003",
        sourceLocator: "始計第一, definitions of 道/天/地/將/法",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-004",
        sourceLocator: "始計第一, seven comparisons paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-005",
        sourceLocator: "始計第一, counsel accepted/rejected paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-006",
        sourceLocator: "始計第一, 勢者 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-007",
        sourceLocator: "始計第一, 兵者詭道也 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-008",
        sourceLocator: "始計第一, 廟算勝負 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-009",
        sourceLocator: "作戰第二, opening paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-010",
        sourceLocator: "作戰第二, 貴勝 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-011",
        sourceLocator: "作戰第二, 善用兵者 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-012",
        sourceLocator: "作戰第二, 務食於敵 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-013",
        sourceLocator: "作戰第二, 兵貴勝 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-014",
        sourceLocator: "謀攻第三, 全國為上 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-015",
        sourceLocator: "謀攻第三, 上兵伐謀 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-016",
        sourceLocator: "謀攻第三, 善用兵者 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-017",
        sourceLocator: "謀攻第三, 十則圍之 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-018",
        sourceLocator: "謀攻第三, 夫將者 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-019",
        sourceLocator: "謀攻第三, 知勝有五 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
      {
        passageId: "default-mixed-sunzi-bingfa-020",
        sourceLocator: "謀攻第三, 知己知彼 paragraph",
        sourceUrl: SUNZI_SOURCE_URL,
        sourcePermalink: SUNZI_SOURCE_PERMALINK,
        cleanupNotes: sunziCleanupNotes,
      },
    ],
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
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
    ].map((sonnetNumber, index) => ({
      passageId: `default-en-shakespeare-sonnets-${String(index + 1).padStart(
        3,
        "0",
      )}`,
      sourceLocator: `Sonnet ${sonnetNumber}`,
      sourceUrl: SHAKESPEARE_SOURCE_URL,
      sourcePermalink: SHAKESPEARE_SOURCE_PERMALINK,
      cleanupNotes: sonnetCleanupNotes,
    })),
  },
  {
    deckId: "default-en-lincoln-addresses",
    deckTitle: "Lincoln’s Addresses",
    sourceWorkTitle: "Speeches and Letters of Abraham Lincoln, 1832-1865",
    sourceAuthor: "Abraham Lincoln",
    sourceEdition:
      "Project Gutenberg eBook #14721, edited collection released 2005-01-18; selected passages use Lincoln address text only.",
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
      "Letter to Thurlow Weed, March 15, 1865, inaugural address note paragraph",
      "Address to the 166th Ohio Regiment, August 22, 1864, closing paragraph",
    ].map((sourceLocator, index) => ({
      passageId: `default-en-lincoln-addresses-${String(index + 1).padStart(
        3,
        "0",
      )}`,
      sourceLocator,
      sourceUrl: LINCOLN_SOURCE_URL,
      sourcePermalink: LINCOLN_SOURCE_PERMALINK,
      cleanupNotes: lincolnCleanupNotes,
    })),
  },
  {
    deckId: "default-en-aesop-fables-townsend",
    deckTitle: "Aesop’s Fables (Townsend)",
    sourceWorkTitle: "Three Hundred Aesop's Fables",
    sourceAuthor: "Aesop; translated by George Fyler Townsend",
    sourceEdition:
      "Project Gutenberg eBook #21, George Fyler Townsend translation, released 2006-12-01.",
    rightsStatus: DEFAULT_TYPING_DECK_SOURCE_RIGHTS_STATUSES.green,
    sourceUrl: AESOP_SOURCE_URL,
    sourcePermalink: AESOP_SOURCE_PERMALINK,
    crossCheckUrls: ["https://onlinebooks.library.upenn.edu/webbin/gutbook/lookup?num=21"],
    licenseNotes:
      "Ancient fables with Townsend translation; Townsend died in 1900, satisfying life-plus-70 jurisdictions. " +
      PG_LICENSE_NOTES,
    replacementForPreferredDeckTitle: "하늘과 바람과 별과 시",
    replacementRationale:
      "윤동주 source status remains Yellow under the approved plan; Aesop/Townsend is a source-work-named public-domain replacement with clear translator provenance.",
    passages: [
      "The Wolf And The Lamb",
      "The Wolf and the Crane",
      "The Father And His Sons",
      "The Bat And The Weasels",
      "The Cock and the Jewel",
      "The Swallow and the Crow",
      "The Kingdom of the Lion",
      "The Traveler and His Dog",
      "The Ants and the Grasshopper",
      "The Hare and the Tortoise",
      "The Charcoal-Burner And The Fuller",
      "The Boy Hunting Locusts",
      "The Fisherman Piping",
      "The Dog and the Shadow",
      "Hercules and the Wagoner",
      "The Mole and His Mother",
      "The Herdsman and the Lost Bull",
      "The Ass, the Fox, and the Lion",
      "The Flies and the Honey-Pot",
      "The Farmer and the Snake",
    ].map((sourceLocator, index) => ({
      passageId: `default-en-aesop-fables-townsend-${String(
        index + 1,
      ).padStart(3, "0")}`,
      sourceLocator,
      sourceUrl: AESOP_SOURCE_URL,
      sourcePermalink: AESOP_SOURCE_PERMALINK,
      cleanupNotes: aesopCleanupNotes,
    })),
  },
];
