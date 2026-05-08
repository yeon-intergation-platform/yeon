import {
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_STAGE,
  clampRaceProgress,
  type TypingRaceLaneSnapshot,
  type TypingRaceSnapshot,
} from "@yeon/race-shared";

type PhaserModule = typeof import("phaser");

export type TypingRacePlayerCharacter = {
  id: string;
  spritePath: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
};

export type TypingRaceEngineMountOptions = {
  container: HTMLElement;
  snapshot?: TypingRaceSnapshot;
  playerCharacter?: TypingRacePlayerCharacter;
};

export type TypingRaceEngineController = {
  destroy: () => void;
  setSnapshot: (snapshot: TypingRaceSnapshot) => void;
};

const SNAPSHOT_EVENT = "typing-race:snapshot";

// 벤치마크(NPC) 레인은 항상 카멜로 고정.
const BENCHMARK_CHARACTER: TypingRacePlayerCharacter = {
  id: "camel",
  spritePath: "/sprites/camel-run.png",
  frameWidth: 96,
  frameHeight: 96,
  frameCount: 6,
  fps: 10,
};

// 캐릭터 height가 다르더라도 트랙 위에서 같은 시각적 크기로 보이도록 표시 높이 통일.
const LANE_DISPLAY_HEIGHT = 46;

// frameHeight를 정수 분수(1, 1/2, 1/3, ...)로 나눈 값 중 target에 가장 가까운 scale.
// 비정수 setScale은 sub-pixel 잔여 떨림을 만들기 때문에 정수 분수로 강제한다.
function snapLaneScale(frameHeight: number, target: number): number {
  let bestScale = 1;
  let bestDist = Math.abs(frameHeight - target);
  for (let divisor = 2; divisor <= 16; divisor++) {
    const candidate = 1 / divisor;
    const dist = Math.abs(frameHeight * candidate - target);
    if (dist < bestDist) {
      bestDist = dist;
      bestScale = candidate;
    }
  }
  return bestScale;
}

const animationKeyFor = (id: string) => `character-run:${id}`;
const textureKeyFor = (id: string) => `character-sprite:${id}`;

export async function mountTypingRaceEngine(
  options: TypingRaceEngineMountOptions
): Promise<TypingRaceEngineController> {
  const Phaser = await import("phaser");
  const snapshotBus = new EventTarget();
  let currentSnapshot = options.snapshot ?? createFallbackSnapshot();
  const playerCharacter = options.playerCharacter ?? BENCHMARK_CHARACTER;
  const scene = createStartLineScene(
    Phaser,
    snapshotBus,
    currentSnapshot,
    playerCharacter
  );

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.container,
    backgroundColor: "#a8d8f0",
    width: Math.max(options.container.clientWidth, 960),
    height: 520,
    // 모든 캐릭터가 픽셀아트 시트라 sub-pixel scale에서 antialiasing이 들어가면 프레임 사이 떨림이 보인다.
    // pixelArt 모드는 nearest-neighbor 샘플링 + roundPixels 자동 적용 → 흔들림 제거 + 선명도 유지.
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: 520,
    },
    scene: [scene],
  });

  const handleResize = () => {
    const nextWidth = Math.max(options.container.clientWidth, 960);
    game.scale.resize(nextWidth, 520);
  };

  window.addEventListener("resize", handleResize);

  return {
    destroy() {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
    },
    setSnapshot(snapshot) {
      currentSnapshot = snapshot;
      snapshotBus.dispatchEvent(
        new CustomEvent<TypingRaceSnapshot>(SNAPSHOT_EVENT, {
          detail: snapshot,
        })
      );
    },
  };
}

// 배경 이미지 레인 Y 비율 (캔버스 height=520 기준)
// 새 배경: 하늘 28% + 4개 흙길 레인 균등 배치, 좌측 컬러 깃발·우측 체크무늬 결승선 내장
const LANE_Y_RATIOS = [0.325, 0.475, 0.625, 0.775] as const;
const TRACK_START_X_RATIO = 0.08; // 좌측 깃발 오른쪽
const TRACK_END_X_RATIO = 0.99; // 우측 체크무늬 왼쪽

function createStartLineScene(
  Phaser: PhaserModule,
  snapshotBus: EventTarget,
  initialSnapshot: TypingRaceSnapshot,
  playerCharacter: TypingRacePlayerCharacter
) {
  return class TypingRaceStartLineScene extends Phaser.Scene {
    private readonly laneVisuals = new Map<
      string,
      {
        car: Phaser.GameObjects.Sprite;
        label: Phaser.GameObjects.Text;
        speed: Phaser.GameObjects.Text;
        trackWidth: number;
        startX: number;
      }
    >();

    private countdownLabel?: Phaser.GameObjects.Text;
    private currentSnapshot = initialSnapshot;
    private detachSnapshot?: () => void;
    private previousStage?: string;

    constructor() {
      super("typing-race-start-line");
    }

    preload() {
      this.load.image("race-bg", "/sprites/race-bg.png");
      // 벤치마크 + 플레이어 캐릭터 두 시트를 모두 로드. 동일 캐릭터면 중복 로드 OK(Phaser가 무시).
      this.load.spritesheet(
        textureKeyFor(BENCHMARK_CHARACTER.id),
        BENCHMARK_CHARACTER.spritePath,
        {
          frameWidth: BENCHMARK_CHARACTER.frameWidth,
          frameHeight: BENCHMARK_CHARACTER.frameHeight,
        }
      );
      if (playerCharacter.id !== BENCHMARK_CHARACTER.id) {
        this.load.spritesheet(
          textureKeyFor(playerCharacter.id),
          playerCharacter.spritePath,
          {
            frameWidth: playerCharacter.frameWidth,
            frameHeight: playerCharacter.frameHeight,
          }
        );
      }
    }

    create() {
      const width = this.scale.width;
      const height = this.scale.height;

      // 배경
      const bg = this.add.image(0, 0, "race-bg");
      bg.setOrigin(0, 0);
      bg.setDisplaySize(width, height);

      // 애니메이션 (중복 등록 방지)
      this.ensureAnimation(BENCHMARK_CHARACTER);
      if (playerCharacter.id !== BENCHMARK_CHARACTER.id) {
        this.ensureAnimation(playerCharacter);
      }

      // 카운트다운 (캔버스 중앙)
      this.countdownLabel = this.add.text(width / 2, height / 2, "", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "96px",
        fontStyle: "900",
        stroke: "#000000",
        strokeThickness: 10,
      });
      this.countdownLabel.setOrigin(0.5, 0.5);
      this.countdownLabel.setDepth(10);

      this.renderSnapshot(this.currentSnapshot);

      const handleSnapshot = (event: Event) => {
        const customEvent = event as CustomEvent<TypingRaceSnapshot>;
        this.currentSnapshot = customEvent.detail;
        this.renderSnapshot(customEvent.detail);
      };

      snapshotBus.addEventListener(SNAPSHOT_EVENT, handleSnapshot);
      this.detachSnapshot = () =>
        snapshotBus.removeEventListener(SNAPSHOT_EVENT, handleSnapshot);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.detachSnapshot?.();
      });
    }

    private ensureAnimation(character: TypingRacePlayerCharacter) {
      const animKey = animationKeyFor(character.id);
      if (this.anims.exists(animKey)) return;
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(textureKeyFor(character.id), {
          start: 0,
          end: character.frameCount - 1,
        }),
        frameRate: character.fps ?? 10,
        repeat: -1,
      });
    }

    private characterForLane(lane: TypingRaceLaneSnapshot) {
      // 로컬 플레이어 레인만 선택된 캐릭터, 나머지는 벤치마크 카멜.
      return lane.role === "local" ? playerCharacter : BENCHMARK_CHARACTER;
    }

    private renderSnapshot(snapshot: TypingRaceSnapshot) {
      const wasCountdown = this.previousStage === TYPING_RACE_STAGE.COUNTDOWN;
      const isNowLive = snapshot.stage === TYPING_RACE_STAGE.LIVE;

      if (wasCountdown && isNowLive) {
        this.countdownLabel?.setText("START!");
        this.time.delayedCall(900, () => {
          if (this.countdownLabel?.text === "START!") {
            this.countdownLabel.setText("");
          }
        });
      } else if (snapshot.stage === TYPING_RACE_STAGE.COUNTDOWN) {
        this.countdownLabel?.setText(`${snapshot.countdownRemaining}`);
      } else if (snapshot.stage === TYPING_RACE_STAGE.FINISHED) {
        this.countdownLabel?.setText("FINISH");
      } else if (!wasCountdown) {
        this.countdownLabel?.setText("");
      }

      this.previousStage = snapshot.stage;
      this.syncLanes(snapshot.lanes, snapshot.speedUnit);

      // 레이스 시작 시 모든 캐릭터 애니메이션 보장.
      if (snapshot.stage !== TYPING_RACE_STAGE.COUNTDOWN) {
        for (const [id, visual] of this.laneVisuals.entries()) {
          if (visual.car.anims.isPlaying) continue;
          const lane = snapshot.lanes.find((l) => l.id === id);
          const character = lane
            ? this.characterForLane(lane)
            : BENCHMARK_CHARACTER;
          visual.car.play(animationKeyFor(character.id));
        }
      }
    }

    private syncLanes(
      lanes: readonly TypingRaceLaneSnapshot[],
      speedUnit?: string
    ) {
      const width = this.scale.width;
      const height = this.scale.height;
      const trackStartX = width * TRACK_START_X_RATIO;
      const trackEndX = width * TRACK_END_X_RATIO;
      const trackWidth = trackEndX - trackStartX;

      // 스냅샷에 없는 오래된 레인 정리 (rejoin/참여자 이탈 시 stale 누적 방지)
      const activeIds = new Set(lanes.map((lane) => lane.id));
      for (const [id, visual] of this.laneVisuals.entries()) {
        if (!activeIds.has(id)) {
          visual.car.destroy();
          visual.label.destroy();
          visual.speed.destroy();
          this.laneVisuals.delete(id);
        }
      }

      lanes.forEach((lane, index) => {
        const laneY = height * (LANE_Y_RATIOS[index] ?? 0.5);
        const character = this.characterForLane(lane);
        const textureKey = textureKeyFor(character.id);
        const animKey = animationKeyFor(character.id);
        const scale = snapLaneScale(character.frameHeight, LANE_DISPLAY_HEIGHT);
        const existing = this.laneVisuals.get(lane.id);

        if (!existing) {
          const label = this.add.text(trackStartX, laneY + 28, lane.label, {
            color: lane.role === "local" ? "#ffffff" : "#ffe97a",
            fontFamily: "monospace",
            fontSize: "13px",
            fontStyle: lane.role === "local" ? "700" : "400",
            stroke: "#000000",
            strokeThickness: 3,
          });
          label.setOrigin(0.5, 0);
          label.setDepth(5);

          const car = this.add.sprite(trackStartX, laneY, textureKey);
          car.setOrigin(0, 0.5);
          car.setScale(scale);
          car.setDepth(5);
          car.play(animKey);

          const speed = this.add.text(trackEndX - 50, laneY + 14, "", {
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "12px",
            stroke: "#000000",
            strokeThickness: 3,
          });
          speed.setOrigin(1, 0.5);
          speed.setDepth(5);

          this.laneVisuals.set(lane.id, {
            car,
            label,
            speed,
            trackWidth,
            startX: trackStartX,
          });
        }

        const visual = this.laneVisuals.get(lane.id);
        if (!visual) return;

        // 캐릭터가 바뀐 경우(예: 게임 도중 프로필 변경) 텍스처/스케일 갱신.
        if (visual.car.texture.key !== textureKey) {
          visual.car.setTexture(textureKey);
          visual.car.setScale(scale);
          visual.car.play(animKey);
        }

        // 참여자 이탈로 index가 바뀌면 Y 위치도 재배치 (기존 생성 시 Y가 고정되던 버그 수정)
        visual.car.y = laneY;
        visual.label.y = laneY + 28;
        visual.speed.y = laneY + 14;

        visual.label.setText(lane.label);
        visual.speed.setText(
          lane.progress >= 100
            ? `${lane.displaySpeed ?? lane.wpm}${speedUnit ?? "타"}`
            : ""
        );
        const spriteW = visual.car.displayWidth;
        visual.car.x =
          visual.startX +
          (visual.trackWidth - spriteW) *
            (clampRaceProgress(lane.progress) / 100);
        visual.label.x = visual.car.x + spriteW / 2 - 7;
      });
    }
  };
}

function createFallbackSnapshot(): TypingRaceSnapshot {
  return {
    stage: TYPING_RACE_STAGE.COUNTDOWN,
    countdownRemaining: TYPING_RACE_DEFAULTS.countdownSeconds,
    headline: "레이스 준비 중",
    subheadline: "엔진이 출발선을 구성하고 있습니다.",
    roundLabel: "Typing Race",
    lanes: [
      createFallbackLane("local-player", "You", "#f4b5ff", 0, 0),
      createFallbackLane("benchmark-1", "Guest", "#62c5ff", 0, 0),
      createFallbackLane("benchmark-2", "Guest", "#93d63f", 0, 0),
      createFallbackLane("benchmark-3", "Guest", "#ff925b", 0, 0),
    ],
  };
}

function createFallbackLane(
  id: string,
  label: string,
  accent: string,
  progress: number,
  wpm: number
): TypingRaceLaneSnapshot {
  return {
    id,
    label,
    accent,
    progress,
    wpm,
    role: id === "local" ? "local" : "benchmark",
  };
}
