export type YeonRequestCookie = {
  name: string;
  value: string;
};

export type YeonReadonlyRequestCookies = {
  getAll: (_name?: string) => YeonRequestCookie[];
};

export type YeonReadonlyHeaders = {
  get: (_name: string) => string | null;
};

export async function getYeonRequestCookies(): Promise<YeonReadonlyRequestCookies> {
  return {
    getAll: () => [],
  };
}

export async function getYeonRequestHeaders(): Promise<YeonReadonlyHeaders> {
  return {
    get: () => null,
  };
}
