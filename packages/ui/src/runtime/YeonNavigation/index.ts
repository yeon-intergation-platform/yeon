"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useYeonRouter() {
  return useRouter();
}

export function useYeonPathname() {
  return usePathname();
}

export function useYeonSearchParams() {
  return useSearchParams();
}
