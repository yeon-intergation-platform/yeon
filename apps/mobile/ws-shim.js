// React Native에는 전역 WebSocket이 있으므로 colyseus가 Node 'ws'(stream 의존)를
// 번들하지 않도록 전역 WebSocket으로 대체한다. Metro resolveRequest에서 'ws' → 이 파일로 매핑.
const RNWebSocket = global.WebSocket;

module.exports = RNWebSocket;
module.exports.WebSocket = RNWebSocket;
module.exports.default = RNWebSocket;
