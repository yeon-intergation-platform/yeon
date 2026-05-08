# spring public-check-location-search API contract

- `GET /spaces/{spaceId}/public-check-locations?query=...`
  - header: `X-Yeon-User-Id`
  - response: `PublicCheckLocationSearchResponse`

에러:
- 401/403/404 ownership 실패
- 500 Kakao env/권한 설정 오류
- 502 Kakao upstream 오류
