"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearSpritePressedControls,
  createSpriteInputState,
  isSpriteControlCode,
  pressSpriteControlOnce,
  pressSpriteInputCode,
  releaseSpriteInputCode,
  snapshotSpriteInputState,
} from "./sprite-action-tool";
import type {
  SpriteControlDefinition,
  SpriteInputState,
} from "./sprite-action-tool";

type SpriteControlMap<ControlId extends string> = Record<
  ControlId,
  SpriteControlDefinition<ControlId>
>;

export function useSpriteValidationRuntime<State, ControlId extends string>({
  controls,
  fps = 30,
  initialState,
  reduce,
}: {
  controls: SpriteControlMap<ControlId>;
  fps?: number;
  initialState: State;
  reduce: (prev: State, input: SpriteInputState) => State;
}) {
  const [state, setState] = useState(initialState);
  const inputRef = useRef(createSpriteInputState());

  const advanceWithSnapshot = useCallback(
    (inputSnapshot: SpriteInputState) => {
      setState((prev) => reduce(prev, inputSnapshot));
    },
    [reduce]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSpriteControlCode(controls, event.code)) return;
      event.preventDefault();
      pressSpriteInputCode(inputRef.current, event.code);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isSpriteControlCode(controls, event.code)) return;
      event.preventDefault();
      releaseSpriteInputCode(inputRef.current, event.code);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controls]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const inputSnapshot = snapshotSpriteInputState(inputRef.current);
      clearSpritePressedControls(inputRef.current);
      advanceWithSnapshot(inputSnapshot);
    }, 1000 / fps);
    return () => window.clearInterval(timer);
  }, [advanceWithSnapshot, fps]);

  const reset = useCallback(() => {
    inputRef.current = createSpriteInputState();
    setState(initialState);
  }, [initialState]);

  const triggerControl = useCallback(
    (controlId: ControlId) => {
      pressSpriteControlOnce(controls, inputRef.current, controlId);
      const inputSnapshot = snapshotSpriteInputState(inputRef.current);
      clearSpritePressedControls(inputRef.current);
      advanceWithSnapshot(inputSnapshot);
    },
    [advanceWithSnapshot, controls]
  );

  return { state, reset, triggerControl } as const;
}
