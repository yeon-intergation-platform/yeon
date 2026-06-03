import "../../node_modules/@colyseus/sdk/dist/colyseus.js";

type ColyseusClientConstructor = new (endpoint: string) => unknown;

type ColyseusBrowserGlobal = typeof globalThis & {
  Colyseus?: {
    Client?: ColyseusClientConstructor;
  };
};

const colyseusClient = (globalThis as ColyseusBrowserGlobal).Colyseus?.Client;

if (!colyseusClient) {
  throw new Error("Colyseus 브라우저 클라이언트를 불러오지 못했습니다.");
}

export const Client = colyseusClient;
