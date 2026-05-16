"use client";

import { SLIME_CONTROLS } from "./slime-game-domain";
import { INITIAL_STATE, nextState } from "./slime-game-state";
import { SlimeGameStage } from "./slime-game-stage";
import { useSpriteValidationRuntime } from "./use-sprite-validation-runtime";

export function SlimeActionValidationRuntime() {
  const { reset, state, triggerControl } = useSpriteValidationRuntime({
    controls: SLIME_CONTROLS,
    initialState: INITIAL_STATE,
    reduce: nextState,
  });

  return (
    <SlimeGameStage
      state={state}
      onReset={reset}
      onTriggerControl={triggerControl}
    />
  );
}
