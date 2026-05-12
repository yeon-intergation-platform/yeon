import { PUBLIC_MP3_ASSET_URLS } from "@/lib/public-mp3-assets";

const TYPING_ROOM_BGM_SRC = PUBLIC_MP3_ASSET_URLS.typingRoomBgm;
const TYPING_ROOM_BGM_VOLUME = 0.22;

type TypingBgmListener = () => void;

export type TypingBgmSnapshot = {
  playing: boolean;
  blocked: boolean;
};

const STOPPED_SNAPSHOT: TypingBgmSnapshot = {
  playing: false,
  blocked: false,
};

class TypingBgmController {
  private audio: HTMLAudioElement | null = null;
  private blocked = false;
  private snapshot = STOPPED_SNAPSHOT;
  private readonly listeners = new Set<TypingBgmListener>();

  getSnapshot(): TypingBgmSnapshot {
    return this.snapshot;
  }

  getServerSnapshot(): TypingBgmSnapshot {
    return STOPPED_SNAPSHOT;
  }

  subscribe(listener: TypingBgmListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async toggle() {
    const audio = this.getAudio();
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      this.blocked = false;
      this.emit();
      return;
    }

    try {
      await audio.play();
      this.blocked = false;
      this.emit();
    } catch {
      this.blocked = true;
      this.emit();
    }
  }

  private getAudio() {
    if (typeof window === "undefined") return null;

    if (!this.audio) {
      this.audio = new Audio(TYPING_ROOM_BGM_SRC);
      this.audio.loop = true;
      this.audio.volume = TYPING_ROOM_BGM_VOLUME;
      this.audio.preload = "auto";
      this.audio.addEventListener("play", this.handleAudioStateChange);
      this.audio.addEventListener("pause", this.handleAudioStateChange);
      this.audio.addEventListener("ended", this.handleAudioStateChange);
      this.updateSnapshot();
    }

    return this.audio;
  }

  private readonly handleAudioStateChange = () => {
    this.blocked = false;
    this.emit();
  };

  private emit() {
    this.updateSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private updateSnapshot() {
    const nextSnapshot = {
      playing: Boolean(this.audio && !this.audio.paused),
      blocked: this.blocked,
    };

    if (
      this.snapshot.playing === nextSnapshot.playing &&
      this.snapshot.blocked === nextSnapshot.blocked
    ) {
      return;
    }

    this.snapshot = nextSnapshot;
  }
}

declare global {
  var __yeonTypingBgmController: TypingBgmController | undefined;
}

function getTypingBgmController() {
  globalThis.__yeonTypingBgmController ??= new TypingBgmController();
  return globalThis.__yeonTypingBgmController;
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
