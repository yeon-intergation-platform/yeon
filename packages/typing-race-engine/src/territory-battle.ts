import {
  TERRITORY_BATTLE_PHASE,
  TERRITORY_BATTLE_TEAM,
  type TerritoryBattleSnapshot,
  type TerritoryBattleTeam,
  type TerritoryCellSnapshot,
} from "@yeon/race-shared";

type PhaserModule = typeof import("phaser");

export type TerritoryBattleEngineMountOptions = {
  container: HTMLElement;
  snapshot?: TerritoryBattleSnapshot;
};

export type TerritoryBattleEngineController = {
  destroy: () => void;
  setSnapshot: (snapshot: TerritoryBattleSnapshot) => void;
};

const TERRITORY_SNAPSHOT_EVENT = "typing-territory:snapshot";
const CANVAS_HEIGHT = 540;
const TEAM_COLORS = {
  red: {
    fill: 0xfff1f1,
    stroke: 0xef4444,
    text: "#991b1b",
    glow: 0xff6b6b,
  },
  blue: {
    fill: 0xeff6ff,
    stroke: 0x2563eb,
    text: "#1e3a8a",
    glow: 0x60a5fa,
  },
  neutral: {
    fill: 0xffffff,
    stroke: 0xd4d4d4,
    text: "#333333",
    glow: 0xf5f5f5,
  },
} as const;

type CellVisual = {
  card: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  owner: TerritoryCellSnapshot["owner"];
  capturedAt?: number;
};

export async function mountTerritoryBattleEngine({
  container,
  snapshot,
}: TerritoryBattleEngineMountOptions): Promise<TerritoryBattleEngineController> {
  const Phaser = await import("phaser");
  const snapshotBus = new EventTarget();
  let currentSnapshot = snapshot ?? null;
  const scene = createTerritoryBattleScene(
    Phaser,
    snapshotBus,
    currentSnapshot
  );

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: "#ffffff",
    width: Math.max(container.clientWidth, 960),
    height: CANVAS_HEIGHT,
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: CANVAS_HEIGHT,
    },
    scene: [scene],
  });

  const handleResize = () => {
    game.scale.resize(Math.max(container.clientWidth, 960), CANVAS_HEIGHT);
  };
  window.addEventListener("resize", handleResize);

  return {
    destroy() {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
    },
    setSnapshot(nextSnapshot) {
      currentSnapshot = nextSnapshot;
      snapshotBus.dispatchEvent(
        new CustomEvent<TerritoryBattleSnapshot>(TERRITORY_SNAPSHOT_EVENT, {
          detail: nextSnapshot,
        })
      );
    },
  };
}

function createTerritoryBattleScene(
  Phaser: PhaserModule,
  snapshotBus: EventTarget,
  initialSnapshot: TerritoryBattleSnapshot | null
) {
  return class TerritoryBattleScene extends Phaser.Scene {
    private currentSnapshot = initialSnapshot;
    private detachSnapshot?: () => void;
    private readonly cellVisuals = new Map<string, CellVisual>();
    private titleLabel?: Phaser.GameObjects.Text;
    private timerLabel?: Phaser.GameObjects.Text;
    private redScoreLabel?: Phaser.GameObjects.Text;
    private blueScoreLabel?: Phaser.GameObjects.Text;
    private statusLabel?: Phaser.GameObjects.Text;

    constructor() {
      super("territory-battle-board");
    }

    create() {
      this.cameras.main.setBackgroundColor("#ffffff");
      this.drawShell();
      this.renderSnapshot(this.currentSnapshot);

      const handleSnapshot = (event: Event) => {
        const customEvent = event as CustomEvent<TerritoryBattleSnapshot>;
        this.currentSnapshot = customEvent.detail;
        this.renderSnapshot(customEvent.detail);
      };

      snapshotBus.addEventListener(TERRITORY_SNAPSHOT_EVENT, handleSnapshot);
      this.detachSnapshot = () =>
        snapshotBus.removeEventListener(
          TERRITORY_SNAPSHOT_EVENT,
          handleSnapshot
        );

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.detachSnapshot?.();
      });
    }

    update() {
      this.updateTimer(this.currentSnapshot);
    }

    private drawShell() {
      const width = this.scale.width;
      this.titleLabel = this.add.text(width / 2, 28, "타자 점령전", {
        color: "#111111",
        fontFamily: "monospace",
        fontSize: "28px",
        fontStyle: "900",
      });
      this.titleLabel.setOrigin(0.5, 0.5);

      this.redScoreLabel = this.add.text(44, 72, "RED 0P", {
        color: "#991b1b",
        fontFamily: "monospace",
        fontSize: "22px",
        fontStyle: "900",
      });
      this.blueScoreLabel = this.add.text(width - 44, 72, "BLUE 0P", {
        color: "#1e3a8a",
        fontFamily: "monospace",
        fontSize: "22px",
        fontStyle: "900",
      });
      this.blueScoreLabel.setOrigin(1, 0);

      this.timerLabel = this.add.text(width / 2, 76, "00:60", {
        color: "#111111",
        fontFamily: "monospace",
        fontSize: "24px",
        fontStyle: "900",
      });
      this.timerLabel.setOrigin(0.5, 0);

      this.statusLabel = this.add.text(width / 2, CANVAS_HEIGHT - 34, "", {
        color: "#666666",
        fontFamily: "monospace",
        fontSize: "14px",
      });
      this.statusLabel.setOrigin(0.5, 0.5);
    }

    private renderSnapshot(snapshot: TerritoryBattleSnapshot | null) {
      if (!snapshot) {
        this.statusLabel?.setText("서버 점령전 snapshot을 기다리는 중");
        return;
      }

      this.updateScores(snapshot);
      this.updateTimer(snapshot);
      this.statusLabel?.setText(createStatusLabel(snapshot));
      this.syncBoard(snapshot);
    }

    private updateScores(snapshot: TerritoryBattleSnapshot) {
      const redScore = getTeamScore(snapshot, TERRITORY_BATTLE_TEAM.RED);
      const blueScore = getTeamScore(snapshot, TERRITORY_BATTLE_TEAM.BLUE);
      this.redScoreLabel?.setText(`RED ${redScore}P`);
      this.blueScoreLabel?.setText(`BLUE ${blueScore}P`);
    }

    private updateTimer(snapshot: TerritoryBattleSnapshot | null) {
      if (
        !snapshot?.endsAt ||
        snapshot.phase !== TERRITORY_BATTLE_PHASE.PLAYING
      ) {
        this.timerLabel?.setText(
          snapshot?.phase === TERRITORY_BATTLE_PHASE.FINISHED
            ? "FINISH"
            : "READY"
        );
        return;
      }

      const remainingMs = Math.max(0, snapshot.endsAt - Date.now());
      const seconds = Math.ceil(remainingMs / 1000);
      this.timerLabel?.setText(`00:${String(seconds).padStart(2, "0")}`);
    }

    private syncBoard(snapshot: TerritoryBattleSnapshot) {
      const width = this.scale.width;
      const boardSize = snapshot.boardSize;
      const boardWidth = Math.min(width - 64, 820);
      const gap = 8;
      const cellSize = (boardWidth - gap * (boardSize - 1)) / boardSize;
      const startX = (width - boardWidth) / 2;
      const startY = 122;
      const activeIds = new Set(snapshot.board.map((cell) => cell.id));

      for (const [id, visual] of this.cellVisuals.entries()) {
        if (!activeIds.has(id)) {
          visual.card.destroy();
          visual.label.destroy();
          this.cellVisuals.delete(id);
        }
      }

      for (const cell of snapshot.board) {
        const x = startX + cell.col * (cellSize + gap) + cellSize / 2;
        const y = startY + cell.row * (cellSize + gap) + cellSize / 2;
        const colors = TEAM_COLORS[cell.owner];
        const existing = this.cellVisuals.get(cell.id);

        if (!existing) {
          const card = this.add.rectangle(
            x,
            y,
            cellSize,
            cellSize,
            colors.fill
          );
          card.setStrokeStyle(3, colors.stroke);
          const label = this.add.text(x, y, cell.word, {
            color: colors.text,
            fontFamily: "monospace",
            fontSize: `${Math.max(13, Math.floor(cellSize * 0.18))}px`,
            fontStyle: "900",
          });
          label.setOrigin(0.5, 0.5);
          this.cellVisuals.set(cell.id, {
            card,
            label,
            owner: cell.owner,
            capturedAt: cell.capturedAt,
          });
          continue;
        }

        existing.card.setPosition(x, y);
        existing.card.setSize(cellSize, cellSize);
        existing.label.setPosition(x, y);
        existing.label.setText(cell.word);
        existing.label.setStyle({
          color: colors.text,
          fontSize: `${Math.max(13, Math.floor(cellSize * 0.18))}px`,
        });
        existing.card.setFillStyle(colors.fill);
        existing.card.setStrokeStyle(3, colors.stroke);

        if (
          existing.owner !== cell.owner ||
          existing.capturedAt !== cell.capturedAt
        ) {
          this.pulseCapture(existing.card, colors.glow);
          existing.owner = cell.owner;
          existing.capturedAt = cell.capturedAt;
        }
      }
    }

    private pulseCapture(card: Phaser.GameObjects.Rectangle, color: number) {
      card.setScale(1.08);
      card.setStrokeStyle(5, color);
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: "Back.Out",
      });
    }
  };
}

function getTeamScore(
  snapshot: TerritoryBattleSnapshot,
  team: TerritoryBattleTeam
) {
  return snapshot.teams.find((score) => score.team === team)?.score ?? 0;
}

function createStatusLabel(snapshot: TerritoryBattleSnapshot) {
  if (snapshot.phase === TERRITORY_BATTLE_PHASE.WAITING) {
    return `${snapshot.players.length}명 대기 중 · 서버 판 시작을 누르세요`;
  }
  if (snapshot.phase === TERRITORY_BATTLE_PHASE.FINISHED) {
    return "경기 종료";
  }
  return `${snapshot.players.length}명 플레이 중 · 서버 authoritative 판정`;
}
