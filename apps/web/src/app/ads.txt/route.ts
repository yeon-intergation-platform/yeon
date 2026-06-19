// Authorized Digital Sellers(ads.txt). GameMonetize 퍼블리셔 광고 수익 보호를 위해
// yeon.world / game.yeon.world 등 모든 호스트의 /ads.txt에서 동일하게 서빙한다.
// (subdomain rewrite는 경로에 "."이 있으면 제외되므로 각 호스트 루트에서 접근된다.)
const ADS_TXT_BODY = `#GameMonetize.com
google.com, pub-5519830896693885, DIRECT, f08c47fec0942fa0
google.com, pub-4764333688337558, DIRECT, f08c47fec0942fa0
`;

export function GET() {
  return new Response(ADS_TXT_BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
