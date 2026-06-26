import { describe, expect, it } from "vitest";
import { TERRITORY_BATTLE_PHASE } from "@yeon/race-shared";
import {
  canShowTerritoryBattleResult,
  getTerritoryPhaseLabel,
} from "./use-territory-battle-room";

describe("getTerritoryPhaseLabel", () => {
  it("territory battle phase label을 mapping으로 고정한다", () => {
    expect(getTerritoryPhaseLabel(null)).toBe("연결 전");
    expect(getTerritoryPhaseLabel(TERRITORY_BATTLE_PHASE.WAITING)).toBe("대기");
    expect(getTerritoryPhaseLabel(TERRITORY_BATTLE_PHASE.COUNTDOWN)).toBe(
      "카운트다운"
    );
    expect(getTerritoryPhaseLabel(TERRITORY_BATTLE_PHASE.PLAYING)).toBe(
      "진행 중"
    );
    expect(getTerritoryPhaseLabel(TERRITORY_BATTLE_PHASE.FINISHED)).toBe(
      "종료"
    );
  });

  it("territory battle result는 finished snapshot 또는 서버 result 수신 시에만 표시한다", () => {
    expect(
      canShowTerritoryBattleResult({
        result: null,
        snapshot: { phase: TERRITORY_BATTLE_PHASE.PLAYING },
      })
    ).toBe(false);
    expect(
      canShowTerritoryBattleResult({
        result: null,
        snapshot: { phase: TERRITORY_BATTLE_PHASE.FINISHED },
      })
    ).toBe(true);
    expect(
      canShowTerritoryBattleResult({
        result: {
          blueScore: 10,
          redScore: 5,
          winner: "blue",
        },
        snapshot: { phase: TERRITORY_BATTLE_PHASE.PLAYING },
      })
    ).toBe(true);
  });
});
