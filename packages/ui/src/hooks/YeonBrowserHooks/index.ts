"use client";

import { useEffect } from "react";

export function useYeonBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}

export function useYeonBodyClass(className: string, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    document.body.classList.add(className);

    return () => {
      document.body.classList.remove(className);
    };
  }, [className, enabled]);
}

export function addYeonDocumentEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void
): () => void;
export function addYeonDocumentEventListener(
  type: string,
  listener: (event: Event) => void
): () => void;
export function addYeonDocumentEventListener(
  type: string,
  listener: (event: Event) => void
) {
  if (typeof document === "undefined") return () => undefined;

  document.addEventListener(type, listener);
  return () => document.removeEventListener(type, listener);
}

export function useYeonDocumentEvent<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  enabled?: boolean
): void;
export function useYeonDocumentEvent(
  type: string,
  listener: (event: Event) => void,
  enabled?: boolean
): void;
export function useYeonDocumentEvent(
  type: string,
  listener: (event: Event) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  }, [enabled, listener, type]);
}

export function useYeonWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  enabled?: boolean,
  options?: boolean | AddEventListenerOptions
): void;
export function useYeonWindowEvent(
  type: string,
  listener: (event: Event) => void,
  enabled?: boolean,
  options?: boolean | AddEventListenerOptions
): void;
export function useYeonWindowEvent(
  type: string,
  listener: (event: Event) => void,
  enabled = true,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    window.addEventListener(type, listener, options);
    return () => window.removeEventListener(type, listener, options);
  }, [enabled, listener, options, type]);
}

export function useYeonEscapeKey(onEscape: () => void, enabled = true) {
  useYeonWindowEvent(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onEscape();
    },
    enabled
  );
}
