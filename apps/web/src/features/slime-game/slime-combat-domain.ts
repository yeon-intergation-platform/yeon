import { rectsOverlap } from "./slime-collision-domain";
import {
  SLIME_ACTIONS,
  getSlimeActionFrame,
  nextAttackCooldown,
  resolveSlimeAttackTransition,
  resolveSlimeMoveDirectionAndFacing,
  isControlHeld,
  wasControlPressed,
} from "./slime-game-domain";
import type { Aabb } from "./slime-collision-domain";
import type { SlimeActionId, SlimeInputState } from "./slime-game-domain";

export type CombatEnemyState = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hurtTick: number;
};

export type CombatState = {
  x: number;
  y: number;
  facing: 1 | -1;
  action: Extract<SlimeActionId, "idle" | "walk" | "attack">;
  actionTick: number;
  attackSerial: number;
  resolvedAttackSerial: number;
  attackCooldown: number;
  enemy: CombatEnemyState;
  lastResult: string;
  tick: number;
};

export const SLIME_COMBAT_STAGE = {
  width: 760,
  height: 360,
  groundY: 286,
  playerWidth: 66,
  playerHeight: 58,
  playerSpeed: 7.2,
  enemyWidth: 74,
  enemyHeight: 50,
  attackDamage: 25,
  attackActiveStartTick: 2,
  attackActiveEndTick: 6,
  attackHitboxWidth: 124,
  attackHitboxHeight: 50,
  attackHitboxYOffset: 16,
} as const;

export const GREEN_SLIME_COMBAT_SPRITE = {
  cols: 7,
  rows: 2,
  width: 132,
  height: 108,
  idleFrame: 0,
  hurtFrame: 11,
  deadFrame: 12,
} as const;

export const INITIAL_COMBAT_STATE: CombatState = {
  x: 318,
  y: SLIME_COMBAT_STAGE.groundY - SLIME_COMBAT_STAGE.playerHeight,
  facing: 1,
  action: "idle",
  actionTick: 0,
  attackSerial: 0,
  resolvedAttackSerial: 0,
  attackCooldown: 0,
  enemy: {
    id: "green-slime-1",
    x: 488,
    y: SLIME_COMBAT_STAGE.groundY - SLIME_COMBAT_STAGE.enemyHeight,
    hp: 100,
    maxHp: 100,
    hurtTick: 0,
  },
  lastResult: "J 공격으로 active frame hitbox를 확인하세요.",
  tick: 0,
};

export function nextCombatState(
  prev: CombatState,
  input: SlimeInputState
): CombatState {
  const { direction, facing } = resolveSlimeMoveDirectionAndFacing(
    prev.facing,
    {
      moveLeftPressed: wasControlPressed(input, "moveLeft"),
      moveRightPressed: wasControlPressed(input, "moveRight"),
      moveLeftHeld: isControlHeld(input, "moveLeft"),
      moveRightHeld: isControlHeld(input, "moveRight"),
    }
  );
  const minX = 32;
  const maxX = SLIME_COMBAT_STAGE.width - SLIME_COMBAT_STAGE.playerWidth - 32;
  const x = clamp(
    prev.x + direction * SLIME_COMBAT_STAGE.playerSpeed,
    minX,
    maxX
  );

  const wantsAttack =
    isControlHeld(input, "attack") || wasControlPressed(input, "attack");
  const attackDuration = SLIME_ACTIONS.attack.durationTicks ?? 1;
  const { isContinuingAttack, startsAttack } = resolveSlimeAttackTransition({
    prevAction: prev.action,
    prevActionTick: prev.actionTick,
    wantsAttack,
    attackDurationTicks: attackDuration,
    attackCooldownRemaining: prev.attackCooldown,
  });
  const action = startsAttack
    ? "attack"
    : isContinuingAttack
      ? "attack"
      : direction !== 0
        ? "walk"
        : "idle";
  const attackSerial = startsAttack ? prev.attackSerial + 1 : prev.attackSerial;
  const attackCooldown = nextAttackCooldown({
    prevAction: prev.action,
    prevAttackCooldown: prev.attackCooldown,
    startsAttack,
  });
  const actionTick =
    action === prev.action && !startsAttack ? prev.actionTick + 1 : 0;
  const enemy = {
    ...prev.enemy,
    hurtTick: Math.max(0, prev.enemy.hurtTick - 1),
  };
  let resolvedAttackSerial = prev.resolvedAttackSerial;
  let lastResult = prev.lastResult;

  const draft: CombatState = {
    x,
    y: prev.y,
    facing,
    action,
    actionTick,
    attackCooldown,
    attackSerial,
    resolvedAttackSerial,
    enemy,
    lastResult,
    tick: prev.tick + 1,
  };

  const attackHitbox = getCombatAttackHitbox(draft);
  const enemyHurtbox = getCombatEnemyHurtbox(draft.enemy);
  const enemyAlive = enemy.hp > 0;
  const canResolveAttack =
    attackHitbox !== null &&
    resolvedAttackSerial !== attackSerial &&
    enemyAlive;

  if (canResolveAttack && rectsOverlap(attackHitbox, enemyHurtbox)) {
    const nextHp = Math.max(0, enemy.hp - SLIME_COMBAT_STAGE.attackDamage);
    draft.enemy = {
      ...enemy,
      hp: nextHp,
      hurtTick: 8,
    };
    resolvedAttackSerial = attackSerial;
    lastResult =
      nextHp === 0
        ? "HIT: 초록 슬라임 처치"
        : `HIT: ${SLIME_COMBAT_STAGE.attackDamage} 피해`;
  } else if (
    action === "attack" &&
    actionTick > SLIME_COMBAT_STAGE.attackActiveEndTick &&
    resolvedAttackSerial !== attackSerial
  ) {
    resolvedAttackSerial = attackSerial;
    lastResult = "MISS: active frame 동안 hurtbox와 겹치지 않음";
  } else if (startsAttack) {
    lastResult = "공격 시작: active frame 대기";
  }

  return {
    ...draft,
    resolvedAttackSerial,
    lastResult,
  };
}

export function combatFrame(state: CombatState) {
  return getSlimeActionFrame({
    action: state.action,
    actionTick: state.actionTick,
    velocityY: 0,
  });
}

export function getCombatPlayerBody(state: CombatState): Aabb {
  return {
    id: "combat-player-body",
    label: "플레이어 body",
    x: state.x,
    y: state.y,
    width: SLIME_COMBAT_STAGE.playerWidth,
    height: SLIME_COMBAT_STAGE.playerHeight,
    kind: "platform",
  };
}

export function getCombatEnemyHurtbox(enemy: CombatEnemyState): Aabb {
  return {
    id: `${enemy.id}-hurtbox`,
    label: "초록 슬라임 hurtbox",
    x: enemy.x,
    y: enemy.y,
    width: SLIME_COMBAT_STAGE.enemyWidth,
    height: SLIME_COMBAT_STAGE.enemyHeight,
    kind: "platform",
  };
}

export function getCombatAttackHitbox(state: CombatState): Aabb | null {
  if (!isCombatAttackActive(state)) return null;

  const x =
    state.facing === 1
      ? state.x + SLIME_COMBAT_STAGE.playerWidth - 4
      : state.x - SLIME_COMBAT_STAGE.attackHitboxWidth + 4;

  return {
    id: `attack-${state.attackSerial}`,
    label: "attack active hitbox",
    x,
    y: state.y + SLIME_COMBAT_STAGE.attackHitboxYOffset,
    width: SLIME_COMBAT_STAGE.attackHitboxWidth,
    height: SLIME_COMBAT_STAGE.attackHitboxHeight,
    kind: "platform",
  };
}

export function isCombatAttackActive(state: CombatState) {
  return (
    state.action === "attack" &&
    state.actionTick >= SLIME_COMBAT_STAGE.attackActiveStartTick &&
    state.actionTick <= SLIME_COMBAT_STAGE.attackActiveEndTick
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
