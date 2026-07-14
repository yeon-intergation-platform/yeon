"use client";

import { useEffect } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";

export function BaekjiServiceHeader({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | YEON`;
  }, [title]);

  return <CommonProductHeader activeService="recall" />;
}
