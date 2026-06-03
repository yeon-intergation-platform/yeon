import { notFound, permanentRedirect, redirect } from "next/navigation";

export function showYeonNotFound(): never {
  return notFound();
}

export function redirectYeon(path: string): never {
  return redirect(path);
}

export function permanentRedirectYeon(path: string): never {
  return permanentRedirect(path);
}
