// 카드방 실시간(colyseus race-server) 엔드포인트.
// 시뮬레이터는 ws://localhost:2567(웹 NEXT_PUBLIC_RACE_SERVER_URL 기본과 동일).
// 실물 기기는 EXPO_PUBLIC_RACE_SERVER_URL을 Mac LAN IP(ws://192.168.x.x:2567)로 설정.
const DEFAULT_RACE_SERVER_URL = "ws://localhost:2567";

export function resolveMobileRaceServerUrl() {
  const url = process.env.EXPO_PUBLIC_RACE_SERVER_URL;
  return url && url.length > 0 ? url : DEFAULT_RACE_SERVER_URL;
}
