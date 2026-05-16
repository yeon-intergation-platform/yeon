import { describe, expect, it } from "vitest";

import {
  INITIAL_COLLISION_STATE,
  SLIME_COLLISION_STAGE,
  nextCollisionState,
} from "./slime-collision-domain";
import {
  INITIAL_COMBAT_STATE,
  SLIME_COMBAT_STAGE,
  nextCombatState,
} from "./slime-combat-domain";
import { INITIAL_STATE, nextState } from "./slime-game-state";
import type { SlimeInputState } from "./slime-game-domain";

const EMPTY_INPUT: SlimeInputState = { held: {}, pressed: {} };

describe("slime collision validation domain", () => {
  it("starts a jump from held space input", () => {
    const next = nextCollisionState(INITIAL_COLLISION_STATE, {
      held: { Space: true },
      pressed: {},
    });

    expect(next.grounded).toBe(false);
    expect(next.velocityY).toBeLessThan(0);
    expect(next.y).toBeLessThan(INITIAL_COLLISION_STATE.y);
  });

  it("clamps the player against the right wall", () => {
    const nearRightWall = {
      ...INITIAL_COLLISION_STATE,
      x: SLIME_COLLISION_STAGE.width - SLIME_COLLISION_STAGE.playerWidth - 28,
    };

    const next = nextCollisionState(nearRightWall, {
      held: { ArrowRight: true },
      pressed: {},
    });

    expect(next.contacts.right).toBe(true);
    expect(next.velocityX).toBe(0);
    expect(next.x).toBe(
      SLIME_COLLISION_STAGE.width - 24 - SLIME_COLLISION_STAGE.playerWidth
    );
  });

  it("lands on the middle platform and records the surface id", () => {
    const abovePlatform = {
      ...INITIAL_COLLISION_STATE,
      x: 300,
      y: 250 - SLIME_COLLISION_STAGE.playerHeight - 5,
      velocityY: 6,
      grounded: false,
      jumpsUsed: 1,
      lastSurfaceId: null,
    };

    const next = nextCollisionState(abovePlatform, EMPTY_INPUT);

    expect(next.grounded).toBe(true);
    expect(next.lastSurfaceId).toBe("low-platform");
    expect(next.y).toBe(250 - SLIME_COLLISION_STAGE.playerHeight);
  });

  it("switches facing to the latest pressed direction key when both keys are held", () => {
    const state = {
      ...INITIAL_COLLISION_STATE,
      facing: -1 as const,
      x: 500,
    };

    const next = nextCollisionState(state, {
      held: { ArrowLeft: true, ArrowRight: true },
      pressed: { ArrowRight: true },
    });

    expect(next.facing).toBe(1);
    expect(next.x).toBeGreaterThan(state.x);
  });
});

describe("slime action validation domain", () => {
  it("allows hold-space jump chaining with 1단/2단 pattern", () => {
    const firstJump = nextState(INITIAL_STATE, {
      held: { Space: true },
      pressed: {},
    });
    expect(firstJump.groundOffset).toBeGreaterThan(0);
    expect(firstJump.jumpsUsed).toBe(1);

    const fallingForDoubleJump = {
      ...firstJump,
      groundOffset: 40,
      velocityY: -1,
      jumpsUsed: 1,
    };
    const secondJump = nextState(fallingForDoubleJump, {
      held: { Space: true },
      pressed: {},
    });
    expect(secondJump.velocityY).toBeGreaterThan(0);
    expect(secondJump.jumpsUsed).toBe(2);

    const landedAndHoldJump = {
      ...secondJump,
      groundOffset: 0,
      velocityY: 0,
      jumpsUsed: 2,
    };
    const thirdJump = nextState(landedAndHoldJump, {
      held: { Space: true },
      pressed: {},
    });

    expect(thirdJump.jumpsUsed).toBe(1);
    expect(thirdJump.groundOffset).toBeGreaterThan(0);
  });
});

describe("slime combat validation domain", () => {
  it("applies damage once per attack serial while hitboxes overlap", () => {
    const activeReady = {
      ...INITIAL_COMBAT_STATE,
      action: "attack" as const,
      actionTick: 1,
      attackSerial: 1,
      resolvedAttackSerial: 0,
    };

    const hit = nextCombatState(activeReady, EMPTY_INPUT);
    const stillOverlapping = nextCombatState(hit, EMPTY_INPUT);

    expect(hit.enemy.hp).toBe(
      INITIAL_COMBAT_STATE.enemy.hp - SLIME_COMBAT_STAGE.attackDamage
    );
    expect(hit.resolvedAttackSerial).toBe(1);
    expect(stillOverlapping.enemy.hp).toBe(hit.enemy.hp);
  });

  it("sustains attack action while attack key is held", () => {
    let state = {
      ...INITIAL_COMBAT_STATE,
    };

    for (let i = 0; i < 3; i += 1) {
      state = nextCombatState(state, {
        held: { KeyJ: true },
        pressed: {},
      });
    }

    expect(state.action).toBe("attack");
    expect(state.actionTick).toBe(2);
  });

  it("marks an unresolved attack as miss after the active window", () => {
    const awayFromEnemy = {
      ...INITIAL_COMBAT_STATE,
      x: 96,
      facing: -1 as const,
      action: "attack" as const,
      actionTick: SLIME_COMBAT_STAGE.attackActiveEndTick,
      attackSerial: 1,
      resolvedAttackSerial: 0,
    };

    const next = nextCombatState(awayFromEnemy, EMPTY_INPUT);

    expect(next.enemy.hp).toBe(INITIAL_COMBAT_STATE.enemy.hp);
    expect(next.resolvedAttackSerial).toBe(1);
    expect(next.lastResult).toContain("MISS");
  });
});
