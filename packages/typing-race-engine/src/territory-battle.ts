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
const MIN_CANVAS_WIDTH = 760;
const MIN_CANVAS_HEIGHT = 520;
const TEAM_COLORS = {
  red: {
    fill: 0x8f3a4a,
    fillAlpha: 0.74,
    stroke: 0xc75c5c,
    text: "#FDE2E5",
    glow: 0xf2a3ad,
  },
  blue: {
    fill: 0x334e8c,
    fillAlpha: 0.76,
    stroke: 0x4f6fad,
    text: "#E0E7FF",
    glow: 0xa5b4fc,
  },
  neutral: {
    fill: 0xf8fafc,
    fillAlpha: 0.1,
    stroke: 0x64748b,
    text: "#F8FAFC",
    glow: 0xf2c94c,
  },
} as const;

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
  const dimensions = resolveCanvasSize(container);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: "#0F172A",
    width: dimensions.width,
    height: dimensions.height,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: dimensions.width,
      height: dimensions.height,
    },
    scene: [scene],
  });

  const handleResize = () => {
    const nextDimensions = resolveCanvasSize(container);
    game.scale.resize(nextDimensions.width, nextDimensions.height);
    if (currentSnapshot) {
      snapshotBus.dispatchEvent(
        new CustomEvent<TerritoryBattleSnapshot>(TERRITORY_SNAPSHOT_EVENT, {
          detail: currentSnapshot,
        })
      );
    }
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

    constructor() {
      super("territory-battle-board");
    }

    create() {
      this.cameras.main.setBackgroundColor("#0F172A");
      this.renderScene(this.currentSnapshot);

      const handleSnapshot = (event: Event) => {
        const customEvent = event as CustomEvent<TerritoryBattleSnapshot>;
        this.currentSnapshot = customEvent.detail;
        this.renderScene(customEvent.detail);
      };

      snapshotBus.addEventListener(TERRITORY_SNAPSHOT_EVENT, handleSnapshot);
      this.detachSnapshot = () =>
        snapshotBus.removeEventListener(
          TERRITORY_SNAPSHOT_EVENT,
          handleSnapshot
        );

      this.scale.on("resize", () => this.renderScene(this.currentSnapshot));
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.detachSnapshot?.();
        this.scale.off("resize");
      });
    }

    update() {
      this.updateTimerText();
    }

    private renderScene(snapshot: TerritoryBattleSnapshot | null) {
      this.children.removeAll(true);
      this.drawBackdrop();
      this.drawBoardFrame(snapshot);

      if (!snapshot) {
        this.drawCenteredStatus("서버 점령전 snapshot을 기다리는 중");
        return;
      }

      this.drawBoard(snapshot);
      this.drawStatus(snapshot);
    }

    private drawBackdrop() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
      this.add.rectangle(
        width * 0.25,
        height / 2,
        width / 2,
        height,
        0x3b1822,
        0.32
      );
      this.add.rectangle(
        width * 0.75,
        height / 2,
        width / 2,
        height,
        0x172554,
        0.34
      );
      this.add.rectangle(width / 2, height / 2, 2, height - 48, 0xf8fafc, 0.12);
      this.add.rectangle(width / 2, 36, width - 48, 1, 0xf8fafc, 0.12);
      this.add.rectangle(width / 2, height - 36, width - 48, 1, 0xf8fafc, 0.12);
    }

    private drawBoardFrame(snapshot: TerritoryBattleSnapshot | null) {
      const { width } = this.scale;
      const redScore = snapshot
        ? getTeamScore(snapshot, TERRITORY_BATTLE_TEAM.RED)
        : 0;
      const blueScore = snapshot
        ? getTeamScore(snapshot, TERRITORY_BATTLE_TEAM.BLUE)
        : 0;
      const topY = 30;

      this.add.text(34, topY, `RED ${redScore}P`, {
        color: "#F6B7BE",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "900",
      });
      const blueLabel = this.add.text(width - 34, topY, `BLUE ${blueScore}P`, {
        color: "#C7D2FE",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "900",
      });
      blueLabel.setOrigin(1, 0);

      const timer = this.add.text(width / 2, 20, timerText(snapshot), {
        color: "#F8FAFC",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "900",
      });
      timer.setName("territory-timer");
      timer.setOrigin(0.5, 0);
    }

    private drawBoard(snapshot: TerritoryBattleSnapshot) {
      const { width, height } = this.scale;
      const boardSize = snapshot.boardSize;
      const gap = Math.max(8, Math.min(14, width * 0.008));
      const boardWidth = Math.min(width - 72, 1180);
      const boardHeight = Math.min(height - 96, boardWidth * 0.72);
      const cellSize = Math.min(
        (boardWidth - gap * (boardSize - 1)) / boardSize,
        (boardHeight - gap * (boardSize - 1)) / boardSize
      );
      const actualBoardWidth = cellSize * boardSize + gap * (boardSize - 1);
      const actualBoardHeight = cellSize * boardSize + gap * (boardSize - 1);
      const startX = (width - actualBoardWidth) / 2;
      const startY = Math.max(78, (height - actualBoardHeight) / 2);

      this.add
        .rectangle(
          width / 2,
          startY + actualBoardHeight / 2,
          actualBoardWidth + 34,
          actualBoardHeight + 34,
          0x020617,
          0.3
        )
        .setStrokeStyle(1, 0xf8fafc, 0.13);

      for (const cell of snapshot.board) {
        const x = startX + cell.col * (cellSize + gap) + cellSize / 2;
        const y = startY + cell.row * (cellSize + gap) + cellSize / 2;
        this.drawCell(cell, x, y, cellSize);
      }
    }

    private drawCell(
      cell: TerritoryCellSnapshot,
      x: number,
      y: number,
      cellSize: number
    ) {
      const colors = TEAM_COLORS[cell.owner];
      const card = this.add.rectangle(
        x,
        y,
        cellSize,
        cellSize,
        colors.fill,
        colors.fillAlpha
      );
      card.setStrokeStyle(
        2,
        colors.stroke,
        cell.owner === "neutral" ? 0.34 : 0.72
      );

      if (cell.owner !== "neutral") {
        this.add.rectangle(
          x,
          y - cellSize * 0.38,
          cellSize * 0.72,
          2,
          colors.glow,
          0.42
        );
      }

      const label = this.add.text(x, y, cell.word, {
        color: colors.text,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: `${Math.max(17, Math.floor(cellSize * 0.2))}px`,
        fontStyle: "900",
      });
      label.setOrigin(0.5, 0.5);
    }

    private drawStatus(snapshot: TerritoryBattleSnapshot) {
      const { width, height } = this.scale;
      const status = this.add.text(
        width / 2,
        height - 58,
        createStatusLabel(snapshot),
        {
          color: "#CBD5E1",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "14px",
          fontStyle: "700",
        }
      );
      status.setOrigin(0.5, 0.5);
    }

    private drawCenteredStatus(message: string) {
      const status = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        message,
        {
          color: "#CBD5E1",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "16px",
          fontStyle: "700",
        }
      );
      status.setOrigin(0.5, 0.5);
    }

    private updateTimerText() {
      const timer = this.children.getByName("territory-timer") as
        | Phaser.GameObjects.Text
        | undefined;
      timer?.setText(timerText(this.currentSnapshot));
    }
  };
}

function resolveCanvasSize(container: HTMLElement) {
  return {
    width: Math.max(container.clientWidth, MIN_CANVAS_WIDTH),
    height: Math.max(container.clientHeight, MIN_CANVAS_HEIGHT),
  };
}

function getTeamScore(
  snapshot: TerritoryBattleSnapshot,
  team: TerritoryBattleTeam
) {
  return snapshot.teams.find((score) => score.team === team)?.score ?? 0;
}

function timerText(snapshot: TerritoryBattleSnapshot | null) {
  if (!snapshot?.endsAt || snapshot.phase !== TERRITORY_BATTLE_PHASE.PLAYING) {
    return snapshot?.phase === TERRITORY_BATTLE_PHASE.FINISHED
      ? "FINISH"
      : "READY";
  }

  const remainingMs = Math.max(0, snapshot.endsAt - Date.now());
  const seconds = Math.ceil(remainingMs / 1000);
  return `00:${String(seconds).padStart(2, "0")}`;
}

function createStatusLabel(snapshot: TerritoryBattleSnapshot) {
  if (snapshot.phase === TERRITORY_BATTLE_PHASE.WAITING) {
    return `${snapshot.players.length}명 대기 중 · 서버 판 시작을 누르세요`;
  }
  if (snapshot.phase === TERRITORY_BATTLE_PHASE.FINISHED) return "경기 종료";
  return `${snapshot.players.length}명 플레이 중 · 서버 authoritative 판정`;
}
