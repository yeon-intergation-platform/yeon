import {
  createYeonLoopingAudioController,
  getYeonRuntimeSingleton,
  type YeonLoopingAudioSnapshot,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { PUBLIC_MP3_ASSET_URLS } from "@/lib/public-mp3-assets";

const TYPING_ROOM_BGM_SRC = PUBLIC_MP3_ASSET_URLS.typingRoomBgm;
const TYPING_ROOM_BGM_VOLUME = 0.22;

type TypingBgmListener = () => void;

export type TypingBgmSnapshot = YeonLoopingAudioSnapshot;

function getTypingBgmController() {
  return getYeonRuntimeSingleton("typing-room-bgm-controller", () =>
    createYeonLoopingAudioController({
      src: TYPING_ROOM_BGM_SRC,
      volume: TYPING_ROOM_BGM_VOLUME,
    })
  );
}

export function subscribeTypingBgm(listener: TypingBgmListener) {
  return getTypingBgmController().subscribe(listener);
}

export function getTypingBgmSnapshot() {
  return getTypingBgmController().getSnapshot();
}

export function getTypingBgmServerSnapshot() {
  return getTypingBgmController().getServerSnapshot();
}

export function toggleTypingBgm() {
  return getTypingBgmController().toggle();
}
