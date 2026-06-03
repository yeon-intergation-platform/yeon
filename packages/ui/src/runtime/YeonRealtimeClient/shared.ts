import { Client, type Room } from "@colyseus/sdk";

export type YeonRealtimeRoom<TState = unknown> = Room<unknown, TState>;

export type YeonRealtimeLegacySeatReservation = {
  name?: string;
  roomId?: string;
  processId?: string;
  publicAddress?: string;
  room?: {
    name?: string;
    roomId?: string;
    processId?: string;
    publicAddress?: string;
  };
};

type YeonRealtimeClientPrototypeWithCompat = {
  __yeonSeatReservationCompat?: boolean;
  consumeSeatReservation?: (
    response: YeonRealtimeLegacySeatReservation,
    ...args: unknown[]
  ) => unknown;
};

export function createYeonRealtimeClient(endpoint: string) {
  return new Client(endpoint);
}

export function ensureYeonRealtimeSeatReservationCompat() {
  const prototype =
    Client.prototype as unknown as YeonRealtimeClientPrototypeWithCompat;
  if (
    prototype.__yeonSeatReservationCompat ||
    !prototype.consumeSeatReservation
  ) {
    return;
  }

  const original = prototype.consumeSeatReservation;
  prototype.consumeSeatReservation = function consumeSeatReservationCompat(
    response: YeonRealtimeLegacySeatReservation,
    ...args: unknown[]
  ) {
    if (!response.room && response.name && response.roomId) {
      response.room = {
        name: response.name,
        roomId: response.roomId,
        processId: response.processId,
        publicAddress: response.publicAddress,
      };
    }
    return original.call(this, response, ...args);
  };
  prototype.__yeonSeatReservationCompat = true;
}
