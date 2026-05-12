import type { CardRoomStudyCard, CardRoomSummary } from "./card-room-model";

export const CARD_ROOM_SAMPLE_ROOMS: CardRoomSummary[] = [
  {
    id: "demo-basic-words",
    title: "영단어 20개 서로 확인",
    deckTitle: "수능 기본 단어",
    hostLabel: "Guest",
    checkerCount: 1,
    memorizerCount: 1,
    cardCount: 20,
    status: "waiting",
    visibility: "public",
  },
  {
    id: "demo-bio-concepts",
    title: "생명과학 개념 말하기",
    deckTitle: "세포 호흡 핵심",
    hostLabel: "StudyMate",
    checkerCount: 1,
    memorizerCount: 2,
    cardCount: 12,
    status: "studying",
    visibility: "public",
  },
];

export const CARD_ROOM_SAMPLE_CARDS: CardRoomStudyCard[] = [
  {
    id: "card-1",
    front: "mitochondria",
    back: "미토콘드리아: 세포 호흡으로 ATP를 만드는 세포 소기관",
  },
  {
    id: "card-2",
    front: "photosynthesis",
    back: "광합성: 빛에너지를 이용해 이산화탄소와 물로 포도당을 합성하는 과정",
  },
  {
    id: "card-3",
    front: "active recall",
    back: "능동 회상: 답을 보기 전에 기억에서 직접 꺼내는 학습 방법",
  },
];
