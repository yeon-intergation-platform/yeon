import { cookies, headers } from "next/headers";

export type YeonReadonlyRequestCookies = Awaited<ReturnType<typeof cookies>>;
export type YeonReadonlyHeaders = Awaited<ReturnType<typeof headers>>;

export function getYeonRequestCookies() {
  return cookies();
}

export function getYeonRequestHeaders() {
  return headers();
}
