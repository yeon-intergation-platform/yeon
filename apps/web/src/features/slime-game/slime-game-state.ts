export type Keys = Record<string, boolean>;
export type Action =
  | "idle"
  | "walk"
  | "jump"
  | "fall"
  | "melee"
  | "cast"
  | "hurt"
  | "dead"
  | "victory"
  | "climb";
export type EffectBurst = {
  kind: "slash" | "spark" | "projectile";
  x: number;
  y: number;
  ttl: number;
};

export type GameState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  coins: number;
  enemyHp: number;
  enemyX: number;
  enemyDirection: 1 | -1;
  tick: number;
  attackCooldown: number;
  castCooldown: number;
  hurtCooldown: number;
  portalCleared: boolean;
  effects: EffectBurst[];
};

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 900;
export const FLOOR_Y = 540;
export const PLAYER_WIDTH = 120;
export const PLAYER_HEIGHT = 104;
export const ENEMY_WIDTH = 92;
export const ENEMY_HEIGHT = 86;
export const LADDER = { x: 1290, y: 438, width: 64, height: 170 };
export const PORTAL = { x: 1444, y: 410, width: 112, height: 178 };
export const COIN = { x: 1108, y: 478, width: 34, height: 34 };

export const INITIAL_STATE: GameState = {
  x: 610,
  y: FLOOR_Y - PLAYER_HEIGHT,
  vx: 0,
  vy: 0,
  facing: 1,
  hp: 3,
  coins: 0,
  enemyHp: 2,
  enemyX: 900,
  enemyDirection: -1,
  tick: 0,
  attackCooldown: 0,
  castCooldown: 0,
  hurtCooldown: 0,
  portalCleared: false,
  effects: [],
};

export function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function chooseAction(state: GameState, onLadder: boolean): Action {
  if (state.hp <= 0) return "dead";
  if (state.portalCleared) return "victory";
  if (state.hurtCooldown > 0) return "hurt";
  if (state.attackCooldown > 10) return "melee";
  if (state.castCooldown > 10) return "cast";
  if (onLadder) return "climb";
  if (state.y < FLOOR_Y - PLAYER_HEIGHT && state.vy > 0.8) return "fall";
  if (state.y < FLOOR_Y - PLAYER_HEIGHT) return "jump";
  if (Math.abs(state.vx) > 0.1) return "walk";
  return "idle";
}

export function slimeFrame(action: Action, tick: number) {
  const cycle = Math.floor(tick / 8);
  switch (action) {
    case "idle":
      return [0, 1, 0, 2][cycle % 4] ?? 0;
    case "walk":
      return 3 + (cycle % 4);
    case "jump":
      return tick % 16 < 8 ? 7 : 8;
    case "fall":
      return 9;
    case "melee":
      return (
        [10, 11, 12][Math.min(2, Math.floor((24 - (tick % 24)) / 8))] ?? 11
      );
    case "cast":
      return [13, 14, 15][cycle % 3] ?? 14;
    case "hurt":
      return 16;
    case "dead":
      return tick % 24 < 12 ? 17 : 18;
    case "victory":
      return tick % 18 < 9 ? 19 : 20;
    case "climb":
      return tick % 18 < 9 ? 21 : 22;
  }
}

export function nextState(prev: GameState, keys: Keys): GameState {
  if (prev.hp <= 0 || prev.portalCleared) {
    return { ...prev, tick: prev.tick + 1, effects: ageEffects(prev.effects) };
  }

  const onLadder = overlaps(
    { x: prev.x, y: prev.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
    LADDER
  );
  const wantsLeft = keys.ArrowLeft || keys.KeyA;
  const wantsRight = keys.ArrowRight || keys.KeyD;
  const wantsUp = keys.ArrowUp || keys.KeyW;
  const wantsDown = keys.ArrowDown || keys.KeyS;
  const wantsJump = keys.Space;
  const wantsAttack = keys.KeyJ;
  const wantsCast = keys.KeyK;

  let vx = (wantsRight ? 6.4 : 0) - (wantsLeft ? 6.4 : 0);
  let vy = prev.vy + 0.82;
  let y = prev.y;
  let x = prev.x;
  let facing = prev.facing;
  let hp: number = prev.hp;
  let coins: number = prev.coins;
  let enemyHp: number = prev.enemyHp;
  let enemyX: number = prev.enemyX;
  let enemyDirection: 1 | -1 = prev.enemyDirection;
  let attackCooldown: number = Math.max(0, prev.attackCooldown - 1);
  let castCooldown: number = Math.max(0, prev.castCooldown - 1);
  let hurtCooldown: number = Math.max(0, prev.hurtCooldown - 1);
  let portalCleared: boolean = prev.portalCleared;
  const effects = ageEffects(prev.effects);

  if (vx > 0) facing = 1;
  if (vx < 0) facing = -1;

  if (onLadder && (wantsUp || wantsDown)) {
    vy = (wantsDown ? 4 : 0) - (wantsUp ? 4 : 0);
    vx *= 0.35;
  } else if (wantsJump && y >= FLOOR_Y - PLAYER_HEIGHT - 1) {
    vy = -16.8;
  }

  x = Math.max(64, Math.min(WORLD_WIDTH - PLAYER_WIDTH - 72, x + vx));
  y += vy;
  if (y > FLOOR_Y - PLAYER_HEIGHT) {
    y = FLOOR_Y - PLAYER_HEIGHT;
    vy = 0;
  }
  if (y < 210) {
    y = 210;
    vy = 0;
  }

  const playerBox = { x, y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
  const enemyBox = {
    x: enemyX,
    y: FLOOR_Y - ENEMY_HEIGHT,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
  };

  if (enemyHp > 0) {
    enemyX += enemyDirection * 2.15;
    if (enemyX < 830 || enemyX > 1048) {
      enemyDirection = enemyDirection === 1 ? -1 : 1;
    }
    if (overlaps(playerBox, enemyBox) && hurtCooldown === 0) {
      hp = Math.max(0, hp - 1);
      hurtCooldown = 34;
      effects.push({ kind: "spark", x: x + 68, y: y + 22, ttl: 22 });
    }
  }

  if (wantsAttack && attackCooldown === 0) {
    attackCooldown = 24;
    const hitBox = {
      x: facing === 1 ? x + PLAYER_WIDTH - 12 : x - 84,
      y: y + 18,
      width: 106,
      height: 72,
    };
    effects.push({ kind: "slash", x: hitBox.x, y: hitBox.y - 48, ttl: 18 });
    if (enemyHp > 0 && overlaps(hitBox, enemyBox)) {
      enemyHp = Math.max(0, enemyHp - 1);
      effects.push({
        kind: "spark",
        x: enemyBox.x + 34,
        y: enemyBox.y + 18,
        ttl: 18,
      });
    }
  }

  if (wantsCast && castCooldown === 0) {
    castCooldown = 28;
    const projectileX = facing === 1 ? x + PLAYER_WIDTH : x - 54;
    effects.push({ kind: "projectile", x: projectileX, y: y + 34, ttl: 28 });
    const projectileBox = { x: projectileX, y: y + 34, width: 74, height: 38 };
    if (enemyHp > 0 && overlaps(projectileBox, enemyBox)) {
      enemyHp = Math.max(0, enemyHp - 1);
      effects.push({
        kind: "spark",
        x: enemyBox.x + 38,
        y: enemyBox.y + 28,
        ttl: 18,
      });
    }
  }

  if (coins === 0 && overlaps(playerBox, COIN)) coins = 1;
  if (overlaps(playerBox, PORTAL)) portalCleared = true;

  return {
    x,
    y,
    vx,
    vy,
    facing,
    hp,
    coins,
    enemyHp,
    enemyX,
    enemyDirection,
    tick: prev.tick + 1,
    attackCooldown,
    castCooldown,
    hurtCooldown,
    portalCleared,
    effects,
  };
}

function ageEffects(effects: EffectBurst[]) {
  return effects
    .map((effect) => ({ ...effect, ttl: effect.ttl - 1 }))
    .filter((effect) => effect.ttl > 0);
}
