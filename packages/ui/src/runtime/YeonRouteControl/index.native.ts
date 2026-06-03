export function showYeonNotFound(): never {
  throw new Error("요청한 화면을 찾을 수 없습니다.");
}

export function redirectYeon(path: string): never {
  throw new Error(`요청한 화면으로 이동할 수 없습니다: ${path}`);
}

export function permanentRedirectYeon(path: string): never {
  throw new Error(`요청한 화면으로 이동할 수 없습니다: ${path}`);
}
