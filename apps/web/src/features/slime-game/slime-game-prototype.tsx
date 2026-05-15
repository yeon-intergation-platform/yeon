"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearPressedControls,
  createSlimeInputState,
  isSlimeControlCode,
  pressControlOnce,
  pressInputCode,
  releaseInputCode,
  snapshotSlimeInputState,
} from "./slime-game-domain";
import type { SlimeControlId } from "./slime-game-domain";
import { INITIAL_STATE, nextState } from "./slime-game-state";
import { SlimeGameStage } from "./slime-game-stage";

export function SlimeGamePrototype() {
  const [state, setState] = useState(INITIAL_STATE);
  const inputRef = useRef(createSlimeInputState());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSlimeControlCode(event.code)) return;
      event.preventDefault();
      pressInputCode(inputRef.current, event.code);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isSlimeControlCode(event.code)) return;
      event.preventDefault();
      releaseInputCode(inputRef.current, event.code);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => nextState(prev, inputRef.current));
      clearPressedControls(inputRef.current);
    }, 1000 / 30);
    return () => window.clearInterval(timer);
  }, []);

  const reset = useCallback(() => {
    inputRef.current = createSlimeInputState();
    setState(INITIAL_STATE);
  }, []);

  const triggerControl = useCallback((controlId: SlimeControlId) => {
    pressControlOnce(inputRef.current, controlId);
    const inputSnapshot = snapshotSlimeInputState(inputRef.current);
    clearPressedControls(inputRef.current);
    setState((prev) => nextState(prev, inputSnapshot));
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <SlimeGameStage
        state={state}
        onReset={reset}
        onTriggerControl={triggerControl}
      />
    </main>
  );
}
