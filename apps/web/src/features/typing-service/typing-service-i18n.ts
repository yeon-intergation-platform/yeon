import type {
  YeonProductProfileMenuLabels,
  YeonServiceHelpDialogLabels,
} from "@yeon/ui";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_GAME_TYPE,
  TYPING_ROOM_LIFECYCLE,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomDifficulty,
  type TypingRoomGameType,
  type TypingRoomLifecycle,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomStatus,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import type { TypingLocale } from "./use-typing-settings";

export type TypingUiText = {
  header: {
    navAriaLabel: string;
    raceTitle: string;
    roomsTitle: string;
    settings: string;
    settingsDescription: string;
    profileMenu: Partial<YeonProductProfileMenuLabels>;
    helpDialog: Partial<YeonServiceHelpDialogLabels>;
    levelAriaLabel: (level: number) => string;
  };
  bgm: {
    turnOn: string;
    turnOff: string;
    on: string;
    off: string;
    credit: string;
    blocked: string;
  };
  home: {
    adminCharacters: string;
    heroTitle: string;
    heroDescription: string;
    profileTitle: string;
    startTitle: string;
    cards: {
      rooms: { label: string; description: string };
      decks: { label: string; description: string };
      territory: { label: string; description: string };
      race: { label: string; description: string };
    };
  };
  profile: {
    editNickname: string;
    entryCharacter: string;
    changeCharacter: string;
    characterSelect: string;
    collapse: string;
    showMore: (count: number) => string;
    loading: string;
  };
  settings: {
    localeLabel: string;
    defaultDeck: string;
    deckVisibility: Record<"default" | "public" | "private", string>;
    loadingDecks: string;
    deckHelp: string;
    apiFallback: string;
    deckLoadFallback: string;
    selectedPracticeDeck: string;
    privateDeck: string;
    seedError: string;
  };
  deck: {
    title: string;
    adminTitle: string;
    subtitle: string;
    adminSubtitle: string;
    eyebrow: string;
    adminEyebrow: string;
    adminEntry: string;
    roomsLink: string;
    listLink: string;
    loadingList: string;
    listError: string;
    newDeck: string;
    close: string;
    openCreateHelp: string;
    selectDeck: string;
    selectDeckHelp: string;
    adminSelectDeckHelp: string;
    createDeck: string;
    manageCharacters: string;
    emptyList: string;
    emptyListHelp: string;
    noDescription: string;
    passageCount: (count: number) => string;
    defaultScope: string;
    defaultScopeHelp: string;
    mineScope: string;
    mineScopeHelp: string;
    publicScope: string;
    publicScopeHelp: string;
    allScope: string;
    allScopeHelp: string;
    defaultBadge: string;
    visibility: Record<"private" | "public", string>;
    language: Record<"ko" | "en" | "mixed" | "code", string>;
    emptyFilteredList: string;
    emptyFilteredListHelp: string;
    detailAriaLabel: (title: string) => string;
    ownedDeck: string;
    noDescriptionPractice: string;
    practiceNow: string;
    createModalEyebrow: string;
    createModalHelp: string;
    libraryEyebrow: string;
    libraryTitle: string;
    libraryDescription: string;
    homeLink: string;
    practiceLink: string;
    searchLabel: string;
    searchPlaceholder: string;
    languageFilter: string;
    allLanguages: string;
    scopeAriaLabel: string;
    totalCount: (count: number) => string;
    filteredCount: (total: number, filtered: number) => string;
    loadingCount: string;
    listErrorLong: string;
    detailEyebrow: string;
    detailTitle: string;
    detailDescription: string;
    adminMode: string;
    loadingDeck: string;
    deckLoadError: string;
    deleting: string;
    deleteDeck: string;
    passageList: string;
    saving: string;
    saveCreate: string;
    saveEdit: string;
    formCreateTitle: string;
    formEditTitle: string;
    formHelp: string;
    readOnly: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    languageTag: string;
    visibilityLabel: string;
    noPassages: string;
    noPassagesHelp: string;
    passageNumber: (index: number) => string;
    noTitle: string;
    edit: string;
    delete: string;
    editPassage: string;
    addPassage: string;
    cancel: string;
    passageTitlePlaceholder: string;
    promptPlaceholder: string;
    shortText: string;
    longText: string;
    codeText: string;
    easy: string;
    normal: string;
    hard: string;
    bulkPromptTitle: string;
    bulkMarkerHelp: string;
    bulkPasteLabel: string;
    recognizedPassages: string;
    countUnit: string;
    maxCount: string;
    preview: string;
    hiddenPreview: (count: number) => string;
    adding: string;
    addCount: (count: number) => string;
  };
  race: {
    opponent: string;
    fallbackPassageTitle: string;
    fallbackPassagePrompt: string;
    selectedPracticeDeck: string;
    loadingPracticeDeck: string;
    speedLabel: string;
    accuracy: string;
    progress: string;
    time: string;
    mistakes: string;
    score: string;
    liveProgress: string;
    currentRank: (rank: number) => string;
    participantProgressLabel: (label: string) => string;
    meSuffix: string;
    resultTitle: string;
    rank: (rank: number) => string;
    collectingResults: string;
    typingUnits: string;
  };
  room: {
    filters: Record<"all" | "public" | "available", string>;
    standardDescription: string;
    territoryDescription: string;
    full: string;
    seatsLeft: (count: number) => string;
    standardCreateShort: string;
    standardCreate: string;
    territoryCreateShort: string;
    territoryCreate: string;
    generatedStandardTitle: (language: string, textType: string) => string;
    generatedTerritoryTitle: (language: string, textType: string) => string;
    createError: string;
    playerPreparing: string;
    heroTitle: string;
    heroDescription: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    loadingRooms: string;
    noSearchResults: string;
    noRooms: string;
    searchEmptyHelp: string;
    emptyHelp: string;
    resetSearch: string;
    enterRoomAria: (title: string, seatLabel: string) => string;
    roomRounds: (count: number) => string;
    hostRoom: (hostLabel: string) => string;
    hostCount: (count: number) => string;
    participantCount: (count: number) => string;
    enterRoom: string;
    createTitle: (gameType: string) => string;
    closeCreate: string;
    roomTitle: string;
    roomTitlePlaceholder: string;
    gameTypeLocked: string;
    visibility: string;
    detailsAfterEntry: string;
    creatingRoom: string;
    createAndEnter: (gameType: string) => string;
    privateDeck: string;
    infoTitle: string;
    gameTime: string;
    difficulty: string;
    currentParticipants: string;
    maxParticipants: string;
    language: string;
    textLength: string;
    rounds: string;
    deck: string;
    flow: string;
    participantUnit: string;
    maxParticipantsValue: (count: number) => string;
    roundCountValue: (count: number) => string;
    timeLimitOneMinute: string;
    teamMatch: string;
    soloRace: string;
    leaving: string;
    leaveRoom: string;
    leaveRoomLong: string;
    openSettings: string;
    closeSettings: string;
    teamWaitingRoom: string;
    participantWaitingRoom: string;
    redTeam: string;
    blueTeam: string;
    moveToRedTeam: string;
    moveToBlueTeam: string;
    switchTeam: string;
    ready: string;
    cancelReady: string;
    chat: string;
    system: string;
    participant: string;
    meSuffix: string;
    roomCreated: string;
    participantJoined: (label: string) => string;
    participantDisconnected: (label: string) => string;
    participantLeft: (label: string) => string;
    territoryEntered: string;
    standardEntered: string;
    chooseTeamReady: string;
    readyToStart: string;
    messagePlaceholder: string;
    sendChat: string;
    emptySlot: string;
    host: string;
    readyDone: string;
    readyShort: string;
    waitingShort: string;
    waiting: string;
    inviteAvailable: string;
    invite: string;
    inviteCopied: string;
    enterTerritory: string;
    start: string;
    cancelReadyShort: string;
    selectedDeckLoading: string;
    createLoading: string;
    joinLoading: string;
    alreadyStarted: string;
    seedErrorTitle: string;
    retry: string;
    useDefaultDeck: string;
    backToLobby: string;
    connectionErrorTitle: string;
    waitingState: string;
    copyUnsupported: string;
    copyError: string;
    chatTooLong: (limit: number) => string;
  };
};

const TYPING_UI_TEXT: Record<TypingLocale, TypingUiText> = {
  ko: {
    header: {
      navAriaLabel: "YEON 공통 서비스 이동",
      raceTitle: "YEON 레이스",
      roomsTitle: "타자방",
      settings: "설정",
      settingsDescription: "BGM은 헤더에서 바로 조절할 수 있습니다.",
      profileMenu: {
        button: "내정보 메뉴",
        profile: "내정보보기",
        loggingOut: "로그아웃 중...",
        logout: "로그아웃",
      },
      helpDialog: {
        trigger: "도움말",
        eyebrow: "도움말",
        close: "도움말 닫기",
        features: "주요 기능",
        faqs: "자주 묻는 질문",
      },
      levelAriaLabel: (level) => `레벨 ${level} 경험치 보기`,
    },
    bgm: {
      turnOn: "BGM 켜기",
      turnOff: "BGM 끄기",
      on: "BGM ON",
      off: "BGM",
      credit: "배경음",
      blocked: "다시 눌러 재생해 주세요",
    },
    home: {
      adminCharacters: "캐릭터 프레임 설정",
      heroTitle: "바로 시작하는 타자 연습",
      heroDescription:
        "원하는 방식으로 연습하거나, 친구들과 함께 타자방에 입장하세요.",
      profileTitle: "내 프로필",
      startTitle: "오늘의 시작",
      cards: {
        rooms: {
          label: "타자방 입장",
          description: "친구들과 실시간으로 함께 연습합니다.",
        },
        decks: {
          label: "연습 덱 관리",
          description: "연습할 문장을 직접 추가하고 관리합니다.",
        },
        territory: {
          label: "점령전 방 찾기",
          description: "점령전 방에 참가하거나 새로 만듭니다.",
        },
        race: {
          label: "레이스 입장",
          description: "다른 사용자와 타자 속도를 겨룹니다.",
        },
      },
    },
    profile: {
      editNickname: "닉네임 편집",
      entryCharacter: "입장 캐릭터",
      changeCharacter: "캐릭터 바꾸기",
      characterSelect: "캐릭터 선택",
      collapse: "접기 ↑",
      showMore: (count) => `더 보기 (${count}개) ↓`,
      loading: "프로필을 불러오는 중",
    },
    settings: {
      localeLabel: "속도 단위",
      defaultDeck: "기본 연습 덱",
      deckVisibility: {
        default: "기본",
        public: "공개",
        private: "비공개",
      },
      loadingDecks: "덱을 불러오는 중...",
      deckHelp: "언어별로 솔로/방 생성 기본 덱을 저장합니다.",
      apiFallback: "덱 API를 사용할 수 없어 기본 문장으로 대체합니다.",
      deckLoadFallback: "선택한 덱을 불러오지 못해 기본 문장으로 대체합니다.",
      selectedPracticeDeck: "선택한 연습 덱",
      privateDeck: "비공개 덱",
      seedError: "선택한 덱의 레이스 문장을 준비하지 못했어요.",
    },
    deck: {
      title: "타자 덱 관리",
      adminTitle: "타자 덱 운영",
      subtitle:
        "기본 덱을 둘러보고, 내 덱을 만들고, AI가 생성한 문단을 붙여넣어 타자 연습 문장을 빠르게 저장하세요.",
      adminSubtitle:
        "기본/공개/사용자 덱을 확인하고, 운영자가 필요한 연습 덱과 문장을 추가합니다.",
      eyebrow: "Typing decks",
      adminEyebrow: "typing deck operations",
      adminEntry: "관리자",
      roomsLink: "타자방으로",
      listLink: "덱 목록",
      loadingList: "목록을 불러오는 중...",
      listError: "덱 목록을 불러오지 못했습니다.",
      newDeck: "새 덱",
      close: "닫기",
      openCreateHelp: "필요할 때만 폼을 열어 덱을 추가합니다.",
      selectDeck: "덱을 선택하세요.",
      selectDeckHelp:
        "왼쪽 목록에서 기본/내/공개 덱을 선택하면 문단 목록, 직접 추가, AI 붙여넣기 패널을 사용할 수 있습니다.",
      adminSelectDeckHelp:
        "왼쪽 목록에서 덱을 선택하면 문장 목록과 운영 편집 패널을 확인할 수 있습니다.",
      createDeck: "새 덱 만들기",
      manageCharacters: "캐릭터 관리",
      emptyList: "표시할 덱이 없습니다.",
      emptyListHelp: "내 덱 탭에서 새 덱을 만들거나 공개 덱을 둘러보세요.",
      noDescription: "설명이 없습니다.",
      passageCount: (count) => `문단 ${count}개`,
      defaultScope: "기본 덱",
      defaultScopeHelp: "YEON이 제공하는 읽기 전용 문단",
      mineScope: "내 덱",
      mineScopeHelp: "직접 만든 비공개/공개 덱",
      publicScope: "공개 덱",
      publicScopeHelp: "다른 사용자가 공개한 덱",
      allScope: "전체",
      allScopeHelp: "관리자 전용: 비공개 포함 모든 DB 덱",
      defaultBadge: "기본",
      visibility: { private: "비공개", public: "공개" },
      language: { ko: "한국어", en: "영어", mixed: "혼합", code: "코드" },
      emptyFilteredList: "조건에 맞는 덱이 없습니다.",
      emptyFilteredListHelp:
        "검색어나 필터를 줄이면 더 많은 연습 덱을 볼 수 있습니다.",
      detailAriaLabel: (title) => `${title} 자세히 보기`,
      ownedDeck: "내 덱",
      noDescriptionPractice:
        "설명이 없는 덱입니다. 문단 구성을 확인하고 바로 연습해보세요.",
      practiceNow: "연습하기",
      createModalEyebrow: "내 덱",
      createModalHelp:
        "제목과 언어만 정하면 시작할 수 있어요. 문단은 만든 뒤 이어서 채웁니다.",
      libraryEyebrow: "덱 라이브러리",
      libraryTitle: "연습할 덱을 고르세요",
      libraryDescription:
        "기본 덱, 내 덱, 공개 덱을 한 곳에서 찾아 바로 연습하세요.",
      homeLink: "타자연습 홈으로",
      practiceLink: "자유 연습으로 이동",
      searchLabel: "덱 검색",
      searchPlaceholder: "덱 제목, 설명, 언어로 검색",
      languageFilter: "언어 필터",
      allLanguages: "모든 언어",
      scopeAriaLabel: "덱 범위",
      totalCount: (count) => `총 ${count}개`,
      filteredCount: (total, filtered) =>
        `전체 ${total}개 중 ${filtered}개 표시`,
      loadingCount: "덱 목록을 불러오는 중",
      listErrorLong:
        "덱 목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해주세요.",
      detailEyebrow: "Typing deck detail",
      detailTitle: "타자 덱 상세 관리",
      detailDescription:
        "덱 정보, 문단 목록, 직접 추가, AI 붙여넣기 관리 기능을 한 화면에서 이어서 사용할 수 있습니다.",
      adminMode: "관리자 모드",
      loadingDeck: "덱을 불러오는 중...",
      deckLoadError: "덱을 불러오지 못했습니다.",
      deleting: "삭제 중...",
      deleteDeck: "덱 삭제",
      passageList: "문단 목록",
      saving: "저장 중...",
      saveCreate: "덱 만들기",
      saveEdit: "덱 저장",
      formCreateTitle: "새 타자 덱",
      formEditTitle: "덱 정보",
      formHelp: "제목, 언어 태그, 공개 범위를 정한 뒤 문단을 추가하세요.",
      readOnly: "읽기 전용",
      titleLabel: "덱 제목",
      titlePlaceholder: "예: 아침 워밍업 문장",
      descriptionLabel: "설명",
      descriptionPlaceholder: "어떤 연습에 쓰는 덱인지 적어주세요.",
      languageTag: "언어 태그",
      visibilityLabel: "공개 범위",
      noPassages: "아직 문단이 없습니다.",
      noPassagesHelp: "직접 추가하거나 AI 붙여넣기로 여러 문단을 넣어보세요.",
      passageNumber: (index) => `문단 ${index}`,
      noTitle: "제목 없음",
      edit: "수정",
      delete: "삭제",
      editPassage: "문단 수정",
      addPassage: "문단 직접 추가",
      cancel: "취소",
      passageTitlePlaceholder: "문단 제목 (선택)",
      promptPlaceholder: "타이핑할 문장을 입력하세요.",
      shortText: "짧은 글",
      longText: "긴 글",
      codeText: "코드",
      easy: "쉬움",
      normal: "보통",
      hard: "어려움",
      bulkPromptTitle: "AI에게 이렇게 만들어달라고 요청하세요.",
      bulkMarkerHelp:
        "마커는 한 줄 전체가 [[PASSAGE]], [[TITLE]], [[TEXT]]일 때 인식합니다. 마커가 없으면 빈 줄 기준으로 문단을 나눕니다.",
      bulkPasteLabel: "AI 형식 붙여넣기",
      recognizedPassages: "인식된 문단:",
      countUnit: "개",
      maxCount: "최대",
      preview: "미리보기",
      hiddenPreview: (count) => `외 ${count}개 문단은 추가 시 함께 저장됩니다.`,
      adding: "추가 중...",
      addCount: (count) => `${count}개 추가`,
    },
    race: {
      opponent: "상대",
      fallbackPassageTitle: "기본 문장",
      fallbackPassagePrompt:
        "오늘도 한 문장씩 정확하게 입력하면 손끝의 리듬이 조금씩 살아납니다.",
      selectedPracticeDeck: "선택한 연습 덱",
      loadingPracticeDeck: "선택한 연습 덱을 불러오는 중...",
      speedLabel: "타수",
      accuracy: "정확도",
      progress: "진행도",
      time: "시간",
      mistakes: "오타",
      score: "점수",
      liveProgress: "실시간 진행률",
      currentRank: (rank) => `현재 ${rank}위`,
      participantProgressLabel: (label) => `${label} 진행률`,
      meSuffix: " (나)",
      resultTitle: "타자 대결 결과",
      rank: (rank) => `${rank}위`,
      collectingResults: "결과를 집계하는 중입니다.",
      typingUnits: "타수",
    },
    room: {
      filters: {
        all: "전체",
        public: "공개방",
        available: "입장 가능",
      },
      standardDescription: "같은 문장을 치고 순위로 겨룹니다.",
      territoryDescription: "팀을 나눠 점령전 화면으로 들어갑니다.",
      full: "만석",
      seatsLeft: (count) => `${count}자리 남음`,
      standardCreateShort: "일반 방",
      standardCreate: "일반 타자방 만들기",
      territoryCreateShort: "점령전",
      territoryCreate: "점령전 방 만들기",
      generatedStandardTitle: (language, textType) =>
        `${language} ${textType} 같이 치기`,
      generatedTerritoryTitle: (language, textType) =>
        `${language} ${textType} 점령전`,
      createError: "타자방을 만들 수 없습니다. 잠시 후 다시 시도해주세요.",
      playerPreparing:
        "플레이어 정보를 준비하는 중입니다. 잠시 후 다시 시도해주세요.",
      heroTitle: "타자방",
      heroDescription: "실시간으로 함께 타자를 치고 실력을 겨루는 공간입니다.",
      searchPlaceholder: "방 검색",
      searchAriaLabel: "방 검색",
      loadingRooms: "열린 타자방을 불러오는 중입니다.",
      noSearchResults: "검색 결과가 없어요",
      noRooms: "아직 열린 타자방이 없어요",
      searchEmptyHelp:
        "다른 키워드로 검색해 보세요. 원하는 방이 없다면 직접 만들 수 있어요.",
      emptyHelp:
        "공개방은 누구나 입장할 수 있고, 비공개방은 방 코드를 받은 사람만 들어와요.",
      resetSearch: "검색 초기화",
      enterRoomAria: (title, seatLabel) => `${title} 입장, ${seatLabel}`,
      roomRounds: (count) => `${count}판`,
      hostRoom: (hostLabel) => `${hostLabel}님의 방`,
      hostCount: (count) => `방장 ${count}명`,
      participantCount: (count) => `참가자 ${count}명`,
      enterRoom: "입장하기",
      createTitle: (gameType) => `${gameType} 만들기`,
      closeCreate: "방 만들기 닫기",
      roomTitle: "방 제목",
      roomTitlePlaceholder: "예: 오늘의 타자 연습",
      gameTypeLocked: "생성 후 방 종류는 바뀌지 않아요.",
      visibility: "공개 설정",
      detailsAfterEntry: "세부 설정은 방에 들어간 뒤 시작 전에 바꿀 수 있어요.",
      creatingRoom: "타자방 만드는 중...",
      createAndEnter: (gameType) => `${gameType} 만들고 입장하기`,
      privateDeck: "비공개 덱",
      infoTitle: "방 정보",
      gameTime: "게임 시간",
      difficulty: "난이도",
      currentParticipants: "현재 인원",
      maxParticipants: "최대 인원",
      language: "언어",
      textLength: "문장 길이",
      rounds: "판 수",
      deck: "덱",
      flow: "진행 방식",
      participantUnit: "명",
      maxParticipantsValue: (count) => `최대 ${count}명`,
      roundCountValue: (count) => `${count}판`,
      timeLimitOneMinute: "1분",
      teamMatch: "팀 대전",
      soloRace: "개인 레이스",
      leaving: "나가는 중",
      leaveRoom: "방 나가기",
      leaveRoomLong: "타자방 나가기",
      openSettings: "방 설정 변경",
      closeSettings: "방 설정 닫기",
      teamWaitingRoom: "팀 대기실",
      participantWaitingRoom: "참가자 대기실",
      redTeam: "1팀",
      blueTeam: "파랑팀",
      moveToRedTeam: "1팀으로 이동",
      moveToBlueTeam: "파랑팀으로 이동",
      switchTeam: "팀 이동",
      ready: "준비하기",
      cancelReady: "준비 해제",
      chat: "채팅",
      system: "시스템",
      participant: "참가자",
      meSuffix: " (나)",
      roomCreated: "방이 생성되었습니다.",
      participantJoined: (label) => `${label}님이 입장했습니다.`,
      participantDisconnected: (label) =>
        `${label}님과의 연결이 잠시 끊겼습니다.`,
      participantLeft: (label) => `${label}님이 퇴장했습니다.`,
      territoryEntered: "점령전 대기방에 입장했습니다.",
      standardEntered: "일반 타자방에 입장했습니다.",
      chooseTeamReady: "팀을 정하고 준비를 눌러 주세요.",
      readyToStart: "참가자가 준비되면 시작할 수 있어요.",
      messagePlaceholder: "메시지 입력...",
      sendChat: "채팅 보내기",
      emptySlot: "빈 자리",
      host: "방장",
      readyDone: "준비 완료",
      readyShort: "준비",
      waitingShort: "대기",
      waiting: "대기 중",
      inviteAvailable: "초대 가능",
      invite: "초대",
      inviteCopied: "초대 링크 복사됨",
      enterTerritory: "점령전 입장",
      start: "시작하기",
      cancelReadyShort: "준비 취소",
      selectedDeckLoading: "선택한 덱에서 레이스 문장을 준비하는 중...",
      createLoading: "타자방을 만드는 중...",
      joinLoading: "타자방에 입장하는 중...",
      alreadyStarted: "방이 이미 시작되었거나 서버 연결이 끊겼을 수 있어요.",
      seedErrorTitle: "덱 문장을 준비하지 못했어요",
      retry: "다시 시도",
      useDefaultDeck: "기본 덱으로 시작",
      backToLobby: "로비로 돌아가기",
      connectionErrorTitle: "타자방에 연결할 수 없어요",
      waitingState: "대기중",
      copyUnsupported: "클립보드 복사를 지원하지 않습니다.",
      copyError: "링크를 복사할 수 없습니다.",
      chatTooLong: (limit) => `채팅은 최대 ${limit}자까지 보낼 수 있어요.`,
    },
  },
  en: {
    header: {
      navAriaLabel: "YEON service navigation",
      raceTitle: "YEON Race",
      roomsTitle: "Typing Room",
      settings: "Settings",
      settingsDescription: "You can control BGM directly from the header.",
      profileMenu: {
        button: "Profile menu",
        profile: "View profile",
        loggingOut: "Logging out...",
        logout: "Log out",
      },
      helpDialog: {
        trigger: "Help",
        eyebrow: "Help",
        close: "Close help",
        features: "Key Features",
        faqs: "FAQ",
      },
      levelAriaLabel: (level) => `View level ${level} experience`,
    },
    bgm: {
      turnOn: "Turn BGM on",
      turnOff: "Turn BGM off",
      on: "BGM ON",
      off: "BGM",
      credit: "Background music",
      blocked: "Press again to play",
    },
    home: {
      adminCharacters: "Character frame settings",
      heroTitle: "Start Typing Practice",
      heroDescription:
        "Practice your way, join a room with friends, or jump into a race.",
      profileTitle: "My Profile",
      startTitle: "Start Here",
      cards: {
        rooms: {
          label: "Enter Typing Rooms",
          description: "Practice live with friends in real time.",
        },
        decks: {
          label: "Manage Practice Decks",
          description: "Add and manage the prompts you want to practice.",
        },
        territory: {
          label: "Find Territory Rooms",
          description: "Join or create a team territory room.",
        },
        race: {
          label: "Enter Race",
          description: "Compete against other players on typing speed.",
        },
      },
    },
    profile: {
      editNickname: "Edit nickname",
      entryCharacter: "Entry Character",
      changeCharacter: "Change Character",
      characterSelect: "Select Character",
      collapse: "Collapse ↑",
      showMore: (count) => `Show more (${count}) ↓`,
      loading: "Loading profile",
    },
    settings: {
      localeLabel: "Speed Unit",
      defaultDeck: "Default Practice Deck",
      deckVisibility: {
        default: "Default",
        public: "Public",
        private: "Private",
      },
      loadingDecks: "Loading decks...",
      deckHelp: "Stores the default solo and room deck for each language.",
      apiFallback: "Deck API is unavailable. Using default passages instead.",
      deckLoadFallback:
        "Could not load the selected deck. Using default passages instead.",
      selectedPracticeDeck: "Selected practice deck",
      privateDeck: "Private deck",
      seedError: "Could not prepare a race prompt from the selected deck.",
    },
    deck: {
      title: "Typing Decks",
      adminTitle: "Typing Deck Operations",
      subtitle:
        "Browse default decks, create your own decks, and paste AI-generated prompts quickly.",
      adminSubtitle:
        "Review default, public, and user decks, then add the practice prompts you need.",
      eyebrow: "Typing decks",
      adminEyebrow: "typing deck operations",
      adminEntry: "Admin",
      roomsLink: "To Rooms",
      listLink: "Deck List",
      loadingList: "Loading list...",
      listError: "Could not load deck list.",
      newDeck: "New Deck",
      close: "Close",
      openCreateHelp: "Open the form only when you need to add a deck.",
      selectDeck: "Select a deck.",
      selectDeckHelp:
        "Select a default, personal, or public deck on the left to manage passages and imports.",
      adminSelectDeckHelp:
        "Select a deck on the left to review passages and operations controls.",
      createDeck: "Create New Deck",
      manageCharacters: "Manage Characters",
      emptyList: "No decks to display.",
      emptyListHelp: "Create a deck in My Decks or browse public decks.",
      noDescription: "No description.",
      passageCount: (count) => `${count} passages`,
      defaultScope: "Default",
      defaultScopeHelp: "Read-only passages provided by YEON",
      mineScope: "My Decks",
      mineScopeHelp: "Private and public decks you created",
      publicScope: "Public",
      publicScopeHelp: "Decks shared by other users",
      allScope: "All",
      allScopeHelp: "Admin only: every DB deck, including private decks",
      defaultBadge: "Default",
      visibility: { private: "Private", public: "Public" },
      language: { ko: "Korean", en: "English", mixed: "Mixed", code: "Code" },
      emptyFilteredList: "No decks match these filters.",
      emptyFilteredListHelp:
        "Reduce the search or filters to see more practice decks.",
      detailAriaLabel: (title) => `View details for ${title}`,
      ownedDeck: "My Deck",
      noDescriptionPractice:
        "No description yet. Review the passages and start practicing.",
      practiceNow: "Practice",
      createModalEyebrow: "My Deck",
      createModalHelp:
        "Set the title and language first. Add passages after creating the deck.",
      libraryEyebrow: "Deck Library",
      libraryTitle: "Choose a Practice Deck",
      libraryDescription:
        "Find default, personal, and public decks in one place and start practicing.",
      homeLink: "Typing Home",
      practiceLink: "Free Practice",
      searchLabel: "Search decks",
      searchPlaceholder: "Search by title, description, or language",
      languageFilter: "Language filter",
      allLanguages: "All Languages",
      scopeAriaLabel: "Deck scope",
      totalCount: (count) => `${count} total`,
      filteredCount: (total, filtered) => `${filtered} of ${total} shown`,
      loadingCount: "Loading deck list",
      listErrorLong: "Could not load deck list. Please try again soon.",
      detailEyebrow: "Typing deck detail",
      detailTitle: "Typing Deck Details",
      detailDescription:
        "Manage deck information, passages, manual additions, and AI batch imports in one place.",
      adminMode: "Admin Mode",
      loadingDeck: "Loading deck...",
      deckLoadError: "Could not load deck.",
      deleting: "Deleting...",
      deleteDeck: "Delete Deck",
      passageList: "Passage List",
      saving: "Saving...",
      saveCreate: "Create Deck",
      saveEdit: "Save Deck",
      formCreateTitle: "New Typing Deck",
      formEditTitle: "Deck Info",
      formHelp:
        "Set the title, language tag, and visibility, then add passages.",
      readOnly: "Read Only",
      titleLabel: "Deck Title",
      titlePlaceholder: "Example: Morning warmup prompts",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe what this deck is for.",
      languageTag: "Language Tag",
      visibilityLabel: "Visibility",
      noPassages: "No passages yet.",
      noPassagesHelp: "Add passages manually or paste an AI-formatted batch.",
      passageNumber: (index) => `Passage ${index}`,
      noTitle: "Untitled",
      edit: "Edit",
      delete: "Delete",
      editPassage: "Edit Passage",
      addPassage: "Add Passage Manually",
      cancel: "Cancel",
      passageTitlePlaceholder: "Passage title (optional)",
      promptPlaceholder: "Enter the text to type.",
      shortText: "Short",
      longText: "Long",
      codeText: "Code",
      easy: "Easy",
      normal: "Normal",
      hard: "Hard",
      bulkPromptTitle: "Ask AI to generate content in this format.",
      bulkMarkerHelp:
        "Markers are recognized when [[PASSAGE]], [[TITLE]], and [[TEXT]] each occupy a full line. Without markers, blank lines split passages.",
      bulkPasteLabel: "Paste AI Format",
      recognizedPassages: "Recognized passages:",
      countUnit: "",
      maxCount: "max",
      preview: "Preview",
      hiddenPreview: (count) =>
        `${count} more passages will be saved together when added.`,
      adding: "Adding...",
      addCount: (count) => `Add ${count}`,
    },
    race: {
      opponent: "Opponent",
      fallbackPassageTitle: "Default Passage",
      fallbackPassagePrompt:
        "Start with one clear sentence and keep a steady rhythm from the first key.",
      selectedPracticeDeck: "Selected practice deck",
      loadingPracticeDeck: "Loading selected practice deck...",
      speedLabel: "Speed",
      accuracy: "Accuracy",
      progress: "Progress",
      time: "Time",
      mistakes: "Mistakes",
      score: "Score",
      liveProgress: "Live Progress",
      currentRank: (rank) => `Current rank ${rank}`,
      participantProgressLabel: (label) => `${label} progress`,
      meSuffix: " (me)",
      resultTitle: "Typing Match Results",
      rank: (rank) => `#${rank}`,
      collectingResults: "Collecting results.",
      typingUnits: "Speed",
    },
    room: {
      filters: {
        all: "All",
        public: "Public",
        available: "Open Seats",
      },
      standardDescription: "Type the same prompt and compete by rank.",
      territoryDescription: "Split into teams and enter territory mode.",
      full: "Full",
      seatsLeft: (count) => `${count} seats left`,
      standardCreateShort: "Standard",
      standardCreate: "Create Standard Room",
      territoryCreateShort: "Territory",
      territoryCreate: "Create Territory Room",
      generatedStandardTitle: (language, textType) =>
        `${language} ${textType} Practice`,
      generatedTerritoryTitle: (language, textType) =>
        `${language} ${textType} Territory`,
      createError: "Could not create a typing room. Please try again soon.",
      playerPreparing: "Preparing player information. Please try again soon.",
      heroTitle: "Typing Rooms",
      heroDescription:
        "Practice together in real time and compete on typing skill.",
      searchPlaceholder: "Search rooms",
      searchAriaLabel: "Search rooms",
      loadingRooms: "Loading open typing rooms.",
      noSearchResults: "No matching rooms",
      noRooms: "No open typing rooms yet",
      searchEmptyHelp:
        "Try another keyword. You can create a room if nothing matches.",
      emptyHelp:
        "Public rooms are open to everyone. Private rooms require a room code.",
      resetSearch: "Clear Search",
      enterRoomAria: (title, seatLabel) => `Enter ${title}, ${seatLabel}`,
      roomRounds: (count) => `${count} rounds`,
      hostRoom: (hostLabel) => `${hostLabel}'s room`,
      hostCount: (count) => `${count} hosts`,
      participantCount: (count) => `${count} participants`,
      enterRoom: "Enter",
      createTitle: (gameType) => `Create ${gameType}`,
      closeCreate: "Close room creation",
      roomTitle: "Room Title",
      roomTitlePlaceholder: "Example: Today's typing practice",
      gameTypeLocked: "The room type cannot be changed after creation.",
      visibility: "Visibility",
      detailsAfterEntry:
        "Detailed settings can be changed before starting after entry.",
      creatingRoom: "Creating typing room...",
      createAndEnter: (gameType) => `Create ${gameType} and Enter`,
      privateDeck: "Private deck",
      infoTitle: "Room Info",
      gameTime: "Game Time",
      difficulty: "Difficulty",
      currentParticipants: "Participants",
      maxParticipants: "Max Players",
      language: "Language",
      textLength: "Prompt Length",
      rounds: "Rounds",
      deck: "Deck",
      flow: "Flow",
      participantUnit: "players",
      maxParticipantsValue: (count) => `Max ${count} players`,
      roundCountValue: (count) => `${count} rounds`,
      timeLimitOneMinute: "1 minute",
      teamMatch: "Team Match",
      soloRace: "Solo Race",
      leaving: "Leaving",
      leaveRoom: "Leave Room",
      leaveRoomLong: "Leave Typing Room",
      openSettings: "Change Room Settings",
      closeSettings: "Close Room Settings",
      teamWaitingRoom: "Team Waiting Room",
      participantWaitingRoom: "Participant Waiting Room",
      redTeam: "Team 1",
      blueTeam: "Blue Team",
      moveToRedTeam: "Move to Team 1",
      moveToBlueTeam: "Move to Blue Team",
      switchTeam: "Switch Team",
      ready: "Ready",
      cancelReady: "Cancel Ready",
      chat: "Chat",
      system: "System",
      participant: "Participant",
      meSuffix: " (me)",
      roomCreated: "The room was created.",
      participantJoined: (label) => `${label} joined.`,
      participantDisconnected: (label) => `${label} briefly disconnected.`,
      participantLeft: (label) => `${label} left.`,
      territoryEntered: "You entered the territory waiting room.",
      standardEntered: "You entered the standard typing room.",
      chooseTeamReady: "Choose a team and press Ready.",
      readyToStart: "The host can start when participants are ready.",
      messagePlaceholder: "Type a message...",
      sendChat: "Send chat",
      emptySlot: "Empty slot",
      host: "Host",
      readyDone: "Ready",
      readyShort: "Ready",
      waitingShort: "Waiting",
      waiting: "Waiting",
      inviteAvailable: "Invite available",
      invite: "Invite",
      inviteCopied: "Invite link copied",
      enterTerritory: "Enter Territory",
      start: "Start",
      cancelReadyShort: "Cancel Ready",
      selectedDeckLoading: "Preparing race prompts from the selected deck...",
      createLoading: "Creating typing room...",
      joinLoading: "Entering typing room...",
      alreadyStarted:
        "The room may have already started, or the server connection dropped.",
      seedErrorTitle: "Could not prepare deck prompts",
      retry: "Try Again",
      useDefaultDeck: "Start with Default Deck",
      backToLobby: "Back to Lobby",
      connectionErrorTitle: "Could not connect to the typing room",
      waitingState: "Waiting",
      copyUnsupported: "Clipboard copy is not supported.",
      copyError: "Could not copy the link.",
      chatTooLong: (limit) => `Chat can be up to ${limit} characters.`,
    },
  },
};

export function getTypingUiText(locale: TypingLocale): TypingUiText {
  return TYPING_UI_TEXT[locale];
}

export const TYPING_ROOM_TEXT_TYPE_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomTextType, string>
> = {
  ko: {
    [TYPING_ROOM_TEXT_TYPE.SHORT]: "짧은 문장",
    [TYPING_ROOM_TEXT_TYPE.LONG]: "긴 글",
    [TYPING_ROOM_TEXT_TYPE.CODE]: "코드",
  },
  en: {
    [TYPING_ROOM_TEXT_TYPE.SHORT]: "Short Prompt",
    [TYPING_ROOM_TEXT_TYPE.LONG]: "Long Text",
    [TYPING_ROOM_TEXT_TYPE.CODE]: "Code",
  },
};

export const TYPING_ROOM_LANGUAGE_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomLanguage, string>
> = {
  ko: {
    [TYPING_ROOM_LANGUAGE.KO]: "한글",
    [TYPING_ROOM_LANGUAGE.EN]: "영어",
    [TYPING_ROOM_LANGUAGE.CODE]: "코드",
  },
  en: {
    [TYPING_ROOM_LANGUAGE.KO]: "Korean",
    [TYPING_ROOM_LANGUAGE.EN]: "English",
    [TYPING_ROOM_LANGUAGE.CODE]: "Code",
  },
};

export const TYPING_ROOM_DIFFICULTY_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomDifficulty, string>
> = {
  ko: {
    [TYPING_ROOM_DIFFICULTY.EASY]: "쉬움",
    [TYPING_ROOM_DIFFICULTY.NORMAL]: "보통",
    [TYPING_ROOM_DIFFICULTY.HARD]: "어려움",
  },
  en: {
    [TYPING_ROOM_DIFFICULTY.EASY]: "Easy",
    [TYPING_ROOM_DIFFICULTY.NORMAL]: "Normal",
    [TYPING_ROOM_DIFFICULTY.HARD]: "Hard",
  },
};

export const TYPING_ROOM_MODE_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomMode, string>
> = {
  ko: {
    [TYPING_ROOM_MODE.FINISH]: "완주 모드",
    [TYPING_ROOM_MODE.TIME_LIMIT]: "시간 제한",
  },
  en: {
    [TYPING_ROOM_MODE.FINISH]: "Finish Mode",
    [TYPING_ROOM_MODE.TIME_LIMIT]: "Time Limit",
  },
};

export const TYPING_ROOM_GAME_TYPE_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomGameType, string>
> = {
  ko: {
    [TYPING_ROOM_GAME_TYPE.STANDARD]: "일반 타자방",
    [TYPING_ROOM_GAME_TYPE.TERRITORY]: "점령전 방",
  },
  en: {
    [TYPING_ROOM_GAME_TYPE.STANDARD]: "Standard Room",
    [TYPING_ROOM_GAME_TYPE.TERRITORY]: "Territory Room",
  },
};

export const TYPING_ROOM_VISIBILITY_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomVisibility, string>
> = {
  ko: {
    [TYPING_ROOM_VISIBILITY.PUBLIC]: "공개",
    [TYPING_ROOM_VISIBILITY.PRIVATE]: "비공개",
  },
  en: {
    [TYPING_ROOM_VISIBILITY.PUBLIC]: "Public",
    [TYPING_ROOM_VISIBILITY.PRIVATE]: "Private",
  },
};

export const TYPING_ROOM_STATUS_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomStatus, string>
> = {
  ko: {
    [TYPING_ROOM_STATUS.WAITING]: "대기중",
    [TYPING_ROOM_STATUS.COUNTDOWN]: "카운트다운",
    [TYPING_ROOM_STATUS.LIVE]: "진행중",
    [TYPING_ROOM_STATUS.FINISHED]: "종료",
    [TYPING_ROOM_STATUS.CLOSED]: "닫힘",
  },
  en: {
    [TYPING_ROOM_STATUS.WAITING]: "Waiting",
    [TYPING_ROOM_STATUS.COUNTDOWN]: "Countdown",
    [TYPING_ROOM_STATUS.LIVE]: "Live",
    [TYPING_ROOM_STATUS.FINISHED]: "Finished",
    [TYPING_ROOM_STATUS.CLOSED]: "Closed",
  },
};

export const TYPING_ROOM_LIFECYCLE_LABELS_BY_LOCALE: Record<
  TypingLocale,
  Record<TypingRoomLifecycle, string>
> = {
  ko: {
    [TYPING_ROOM_LIFECYCLE.ACTIVE]: "활성",
    [TYPING_ROOM_LIFECYCLE.EMPTY_GRACE]: "재접속 대기",
    [TYPING_ROOM_LIFECYCLE.CLOSED]: "닫힘",
  },
  en: {
    [TYPING_ROOM_LIFECYCLE.ACTIVE]: "Active",
    [TYPING_ROOM_LIFECYCLE.EMPTY_GRACE]: "Reconnect Grace",
    [TYPING_ROOM_LIFECYCLE.CLOSED]: "Closed",
  },
};
