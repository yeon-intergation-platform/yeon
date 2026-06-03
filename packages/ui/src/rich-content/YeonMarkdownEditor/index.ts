"use client";

import dynamic from "next/dynamic";

export const YeonLegacyMarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);
