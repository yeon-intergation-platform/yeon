"use client";
import { useEffect, useRef } from "react";
import { addYeonDocumentEventListener } from "@yeon/ui/hooks/YeonBrowserHooks";

export function useClickOutside<T extends HTMLElement>(
  onClickOutside: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    }

    return addYeonDocumentEventListener("click", handleClick);
  }, [enabled, onClickOutside]);

  return ref;
}
