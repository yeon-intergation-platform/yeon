"use client";

import { useEffect } from "react";

type YeonBrowserEventUnsubscribe = () => void;

type YeonBrowserBodyStyleProperty = "overflow";

interface YeonBrowserBodyPort {
  getStyleProperty(property: YeonBrowserBodyStyleProperty): string;
  setStyleProperty(property: YeonBrowserBodyStyleProperty, value: string): void;
  addClass(className: string): void;
  removeClass(className: string): void;
}

interface YeonBrowserEventPort {
  subscribeDocument(
    type: string,
    listener: (event: Event) => void
  ): YeonBrowserEventUnsubscribe;
  subscribeWindow(
    type: string,
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): YeonBrowserEventUnsubscribe;
}

interface YeonBrowserHooksPort {
  body: YeonBrowserBodyPort;
  events: YeonBrowserEventPort;
}

const emptyYeonBrowserUnsubscribe: YeonBrowserEventUnsubscribe = () =>
  undefined;

const YEON_BROWSER_HOOKS_PORT: YeonBrowserHooksPort = {
  body: {
    getStyleProperty(property) {
      return globalThis.document?.body.style[property] ?? "";
    },
    setStyleProperty(property, value) {
      const body = globalThis.document?.body;
      if (!body) return;
      body.style[property] = value;
    },
    addClass(className) {
      globalThis.document?.body.classList.add(className);
    },
    removeClass(className) {
      globalThis.document?.body.classList.remove(className);
    },
  },
  events: {
    subscribeDocument(type, listener) {
      const browserDocument = globalThis.document;
      if (!browserDocument) return emptyYeonBrowserUnsubscribe;

      browserDocument.addEventListener(type, listener);
      return () => browserDocument.removeEventListener(type, listener);
    },
    subscribeWindow(type, listener, options) {
      const browserWindow = globalThis.window;
      if (!browserWindow) return emptyYeonBrowserUnsubscribe;

      browserWindow.addEventListener(type, listener, options);
      return () => browserWindow.removeEventListener(type, listener, options);
    },
  },
};

export function useYeonBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const previousOverflow =
      YEON_BROWSER_HOOKS_PORT.body.getStyleProperty("overflow");
    YEON_BROWSER_HOOKS_PORT.body.setStyleProperty("overflow", "hidden");

    return () => {
      YEON_BROWSER_HOOKS_PORT.body.setStyleProperty(
        "overflow",
        previousOverflow
      );
    };
  }, [enabled]);
}

export function useYeonBodyClass(className: string, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    YEON_BROWSER_HOOKS_PORT.body.addClass(className);

    return () => {
      YEON_BROWSER_HOOKS_PORT.body.removeClass(className);
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
  return YEON_BROWSER_HOOKS_PORT.events.subscribeDocument(type, listener);
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
    if (!enabled) return;

    return YEON_BROWSER_HOOKS_PORT.events.subscribeDocument(type, listener);
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
    if (!enabled) return;

    return YEON_BROWSER_HOOKS_PORT.events.subscribeWindow(
      type,
      listener,
      options
    );
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
