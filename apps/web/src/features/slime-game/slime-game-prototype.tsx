"use client";
import { useState } from "react";
import { SlimeActionValidationRuntime } from "./slime-action-validation-runtime";
import { SlimeCollisionValidationRuntime } from "./slime-collision-validation-runtime";
import { SlimeCombatValidationRuntime } from "./slime-combat-validation-runtime";
import { SlimeGameShell } from "./slime-game-shell";
import type { SlimeValidationPageId } from "./slime-game-pages";

export function SlimeGamePrototype() {
  const [activePageId, setActivePageId] =
    useState<SlimeValidationPageId>("actions");

  return (
    <SlimeGameShell activePageId={activePageId} onChangePage={setActivePageId}>
      {activePageId === "actions" ? <SlimeActionValidationRuntime /> : null}
      {activePageId === "collision" ? (
        <SlimeCollisionValidationRuntime />
      ) : null}
      {activePageId === "combat" ? <SlimeCombatValidationRuntime /> : null}
    </SlimeGameShell>
  );
}
