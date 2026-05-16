import {
  SLIME_SPRITE_SHEET,
  SLIME_SPRITE_VIEW_HEIGHT,
  resolveSlimeMoveDirectionAndFacing,
  canStartSlimeJump,
  isControlHeld,
  wasControlPressed,
} from "./slime-game-domain";
import type { SlimeInputState } from "./slime-game-domain";

export type Aabb = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "ground" | "wall" | "platform" | "ceiling";
};

export type CollisionContacts = {
  left: boolean;
  right: boolean;
  ground: boolean;
  ceiling: boolean;
};

export type CollisionState = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  jumpsUsed: number;
  facing: 1 | -1;
  grounded: boolean;
  lastSurfaceId: string | null;
  contacts: CollisionContacts;
  tick: number;
};

export const SLIME_COLLISION_STAGE = {
  width: 760,
  height: 380,
  playerWidth: 66,
  playerHeight: 70,
  moveSpeed: 6.4,
  jumpVelocity: -17,
  gravity: 1.1,
  maxFallSpeed: 18,
  spriteWidth: 126,
  debugGridSize: 40,
} as const;

export const SLIME_COLLISION_SOLIDS: readonly Aabb[] = [
  {
    id: "left-wall",
    label: "왼쪽 벽",
    x: 0,
    y: 0,
    width: 24,
    height: SLIME_COLLISION_STAGE.height,
    kind: "wall",
  },
  {
    id: "right-wall",
    label: "오른쪽 벽",
    x: SLIME_COLLISION_STAGE.width - 24,
    y: 0,
    width: 24,
    height: SLIME_COLLISION_STAGE.height,
    kind: "wall",
  },
  {
    id: "ground",
    label: "바닥",
    x: 0,
    y: 316,
    width: SLIME_COLLISION_STAGE.width,
    height: 64,
    kind: "ground",
  },
  {
    id: "low-platform",
    label: "중간 발판",
    x: 250,
    y: 250,
    width: 210,
    height: 18,
    kind: "platform",
  },
  {
    id: "ceiling-block",
    label: "천장 블록",
    x: 505,
    y: 158,
    width: 150,
    height: 22,
    kind: "ceiling",
  },
] as const;

export const INITIAL_COLLISION_STATE: CollisionState = {
  x: 96,
  y: 316 - SLIME_COLLISION_STAGE.playerHeight,
  velocityX: 0,
  velocityY: 0,
  jumpsUsed: 0,
  facing: 1,
  grounded: true,
  lastSurfaceId: "ground",
  contacts: createEmptyContacts({ ground: true }),
  tick: 0,
};

export function nextCollisionState(
  prev: CollisionState,
  input: SlimeInputState
): CollisionState {
  const { direction, facing } = resolveSlimeMoveDirectionAndFacing(
    prev.facing,
    {
      moveLeftPressed: wasControlPressed(input, "moveLeft"),
      moveRightPressed: wasControlPressed(input, "moveRight"),
      moveLeftHeld: isControlHeld(input, "moveLeft"),
      moveRightHeld: isControlHeld(input, "moveRight"),
    }
  );
  const velocityX = direction * SLIME_COLLISION_STAGE.moveSpeed;
  let velocityY = prev.velocityY;
  const wantsJump =
    isControlHeld(input, "jump") || wasControlPressed(input, "jump");

  let jumpsUsed = prev.grounded ? 0 : prev.jumpsUsed;
  if (
    wantsJump &&
    canStartSlimeJump({
      isGrounded: prev.grounded,
      velocityY,
      jumpsUsed,
      canStartCondition: (nextVelocityY) => nextVelocityY >= 0,
    })
  ) {
    velocityY = SLIME_COLLISION_STAGE.jumpVelocity;
    jumpsUsed = prev.grounded ? 1 : 2;
  }

  velocityY = Math.min(
    SLIME_COLLISION_STAGE.maxFallSpeed,
    velocityY + SLIME_COLLISION_STAGE.gravity
  );

  const horizontal = resolveHorizontal({
    x: prev.x,
    y: prev.y,
    velocityX,
  });
  const vertical = resolveVertical({
    x: horizontal.x,
    y: prev.y,
    velocityY,
  });

  return {
    x: horizontal.x,
    y: vertical.y,
    velocityX: horizontal.velocityX,
    velocityY: vertical.velocityY,
    facing,
    grounded: vertical.contacts.ground,
    lastSurfaceId: vertical.lastSurfaceId,
    jumpsUsed: vertical.contacts.ground ? 0 : jumpsUsed,
    contacts: {
      ...horizontal.contacts,
      ground: vertical.contacts.ground,
      ceiling: vertical.contacts.ceiling,
    },
    tick: prev.tick + 1,
  };
}

export function getCollisionPlayerRect(state: CollisionState): Aabb {
  return {
    id: "player-body",
    label: "플레이어 몸체",
    x: state.x,
    y: state.y,
    width: SLIME_COLLISION_STAGE.playerWidth,
    height: SLIME_COLLISION_STAGE.playerHeight,
    kind: "platform",
  };
}

export function getCollisionSpriteStyle(state: CollisionState) {
  const spriteHeight = Math.round(
    SLIME_COLLISION_STAGE.spriteWidth *
      (SLIME_SPRITE_VIEW_HEIGHT / SLIME_SPRITE_SHEET.viewWidth)
  );
  return {
    left:
      state.x +
      SLIME_COLLISION_STAGE.playerWidth / 2 -
      SLIME_COLLISION_STAGE.spriteWidth / 2,
    top: state.y + SLIME_COLLISION_STAGE.playerHeight - spriteHeight,
    width: SLIME_COLLISION_STAGE.spriteWidth,
    height: spriteHeight,
  } as const;
}

export function rectsOverlap(a: Aabb, b: Aabb) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resolveHorizontal({
  velocityX,
  x,
  y,
}: {
  x: number;
  y: number;
  velocityX: number;
}) {
  let nextX = x + velocityX;
  let nextVelocityX = velocityX;
  const contacts = createEmptyContacts();

  if (velocityX === 0) return { x: nextX, velocityX: nextVelocityX, contacts };

  for (const solid of SLIME_COLLISION_SOLIDS) {
    const playerRect = createPlayerRect(nextX, y);
    if (!rectsOverlap(playerRect, solid)) continue;

    if (velocityX > 0) {
      nextX = solid.x - SLIME_COLLISION_STAGE.playerWidth;
      contacts.right = true;
    } else {
      nextX = solid.x + solid.width;
      contacts.left = true;
    }
    nextVelocityX = 0;
  }

  return { x: nextX, velocityX: nextVelocityX, contacts };
}

function resolveVertical({
  velocityY,
  x,
  y,
}: {
  x: number;
  y: number;
  velocityY: number;
}) {
  let nextY = y + velocityY;
  let nextVelocityY = velocityY;
  const contacts = createEmptyContacts();
  let lastSurfaceId: string | null = null;

  for (const solid of SLIME_COLLISION_SOLIDS) {
    const playerRect = createPlayerRect(x, nextY);
    if (!rectsOverlap(playerRect, solid)) continue;

    if (velocityY > 0) {
      nextY = solid.y - SLIME_COLLISION_STAGE.playerHeight;
      contacts.ground = true;
      lastSurfaceId = solid.id;
    } else if (velocityY < 0) {
      nextY = solid.y + solid.height;
      contacts.ceiling = true;
    }
    nextVelocityY = 0;
  }

  return {
    y: nextY,
    velocityY: nextVelocityY,
    contacts,
    lastSurfaceId,
  };
}

function createPlayerRect(x: number, y: number): Aabb {
  return {
    id: "player-body",
    label: "플레이어 몸체",
    x,
    y,
    width: SLIME_COLLISION_STAGE.playerWidth,
    height: SLIME_COLLISION_STAGE.playerHeight,
    kind: "platform",
  };
}

function createEmptyContacts(
  overrides: Partial<CollisionContacts> = {}
): CollisionContacts {
  return {
    left: false,
    right: false,
    ground: false,
    ceiling: false,
    ...overrides,
  };
}
