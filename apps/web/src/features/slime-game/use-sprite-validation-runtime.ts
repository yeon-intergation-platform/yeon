"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearYeonInterval,
  scheduleYeonInterval,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonDocumentKeyboardEvent } from "@yeon/ui/types";
import { useYeonWindowEvent } from "@yeon/ui/hooks/YeonBrowserHooks";
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

  const handleKeyDown = useCallback(
    (event: YeonDocumentKeyboardEvent) => {
      if (!isSpriteControlCode(controls, event.code)) return;
      event.preventDefault();
      pressSpriteInputCode(inputRef.current, event.code);
    },
    [controls]
  );

  const handleKeyUp = useCallback(
    (event: YeonDocumentKeyboardEvent) => {
      if (!isSpriteControlCode(controls, event.code)) return;
      event.preventDefault();
      releaseSpriteInputCode(inputRef.current, event.code);
    },
    [controls]
  );

  useYeonWindowEvent("keydown", handleKeyDown);
  useYeonWindowEvent("keyup", handleKeyUp);

  useEffect(() => {
    const timer = scheduleYeonInterval(() => {
      const inputSnapshot = snapshotSpriteInputState(inputRef.current);
      clearSpritePressedControls(inputRef.current);
      advanceWithSnapshot(inputSnapshot);
    }, 1000 / fps);
    return () => clearYeonInterval(timer);
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
