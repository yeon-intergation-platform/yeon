function fn() {
  // baseUrl / internalToken / userId 는 실행 하니스(run-karate-flows.sh)가 systemProperty 로 주입한다.
  var baseUrl = karate.properties["baseUrl"] || "http://localhost:8081";
  var internalToken = karate.properties["internalToken"] || "";
  var userId =
    karate.properties["userId"] || "11111111-1111-1111-1111-111111111111";

  karate.configure("connectTimeout", 10000);
  karate.configure("readTimeout", 30000);
  karate.configure("lowerCaseResponseHeaders", true);

  var internalHeaders = internalToken
    ? { "X-Yeon-Internal-Token": internalToken }
    : {};
  var userHeaders = {};
  for (var k in internalHeaders) userHeaders[k] = internalHeaders[k];
  if (userId) userHeaders["X-Yeon-User-Id"] = userId;

  return {
    baseUrl: baseUrl,
    internalToken: internalToken,
    userId: userId,
    internalHeaders: internalHeaders,
    userHeaders: userHeaders,
  };
}
