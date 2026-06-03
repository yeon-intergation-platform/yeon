// @colyseus/core(race-server)와 @colyseus/ws-transport가 서로 다른 @colyseus/core
// 인스턴스를 로드하면 matchMaker 좌석 예약 상태가 분리돼 모든 실시간 join이
// "seat reservation expired"(웹에서 4002)로 닫힌다. 원인: @colyseus/schema의
// optional typescript peer가 설치 경로별로 5.9.3/6.0.2로 갈려(@colyseus 트리에서
// apps/mobile은 Expo 요구로 ts ~5.9를 쓴다) schema/core 가상 디렉터리가 둘로 쪼개진다.
// schema의 typescript는 타입 생성용 optional peer일 뿐 런타임에 무관하므로,
// peer 목록에서 제거해 schema(따라서 core) 인스턴스를 하나로 합친다.
function readPackage(pkg) {
  if (pkg.name === "@colyseus/schema") {
    if (pkg.peerDependencies && pkg.peerDependencies.typescript) {
      delete pkg.peerDependencies.typescript;
    }
    if (pkg.peerDependenciesMeta && pkg.peerDependenciesMeta.typescript) {
      delete pkg.peerDependenciesMeta.typescript;
    }
  }
  return pkg;
}
module.exports = { hooks: { readPackage } };
