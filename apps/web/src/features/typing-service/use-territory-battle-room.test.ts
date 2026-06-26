import { describe, expect, it } from "vitest";
import { TERRITORY_BATTLE_PHASE } from "@yeon/race-shared";
import { getTerritoryPhaseLabel } from "./use-territory-battle-room";

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
});
