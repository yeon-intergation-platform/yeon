"use client";

import { useInsertionEffect } from "react";

import { mountYeonGlobalStyle } from "../../runtime/YeonBrowserRuntime";

export interface YeonGlobalStyleProps {
  id: string;
  css: string;
}

export function YeonGlobalStyle({ id, css }: YeonGlobalStyleProps) {
  useInsertionEffect(() => {
    return mountYeonGlobalStyle(id, css);
  }, [css, id]);

  return null;
}
