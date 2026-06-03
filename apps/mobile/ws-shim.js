// React Native에는 전역 WebSocket이 있으므로 colyseus가 Node 'ws'(stream 의존)를
// 번들하지 않도록 전역 WebSocket으로 대체한다. Metro resolveRequest에서 'ws' → 이 파일로 매핑.
//
// global.WebSocket를 모듈 평가 시점에 캡처하면 RN 폴리필 설치 전 undefined가 될 수 있다.
// 호출 시점에 global.WebSocket를 참조하도록 함수 래퍼로 감싼다.
function RNWebSocketWrapper(...args) {
  return new global.WebSocket(...args);
}

module.exports = RNWebSocketWrapper;
module.exports.WebSocket = RNWebSocketWrapper;
module.exports.default = RNWebSocketWrapper;
