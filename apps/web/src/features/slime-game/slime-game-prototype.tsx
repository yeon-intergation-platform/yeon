"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Keys } from "./slime-game-state";
import { INITIAL_STATE, nextState } from "./slime-game-state";
import { SlimeGameStage } from "./slime-game-stage";

const GAME_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "KeyJ",
  "KeyK",
];

export function SlimeGamePrototype() {
  const [state, setState] = useState(INITIAL_STATE);
  const keysRef = useRef<Keys>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (GAME_KEYS.includes(event.code)) event.preventDefault();
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
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
      setState((prev) => nextState(prev, keysRef.current));
    }, 1000 / 30);
    return () => window.clearInterval(timer);
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06162a] text-white">
      <SlimeGameStage state={state} onReset={reset} />
    </main>
  );
}
