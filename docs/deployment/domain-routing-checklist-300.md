# Domain Routing 300 Checklist

기준일: 2026-06-01

대상 URL:

- `https://yeon.world/typing-service` -> `https://typing.yeon.world`
- `https://yeon.world/card-service` -> `https://card.yeon.world`
- `https://yeon.world/community` -> `https://community.yeon.world`

이 문서는 실행 범위 체크리스트다. 실제 구현 전 현재 코드와 Cloudflare 설정을 확인한다.

## 1. 목표/범위 확정

- [ ] 1. 현재 URL `https://yeon.world/typing-service` 확인
- [ ] 2. 현재 URL `https://yeon.world/card-service` 확인
- [ ] 3. 현재 URL `https://yeon.world/community` 확인
- [ ] 4. 신규 URL `https://typing.yeon.world` 확정
- [ ] 5. 신규 URL `https://card.yeon.world` 확정
- [ ] 6. 신규 URL `https://community.yeon.world` 확정
- [ ] 7. 기존 path URL 미유지 정책 확정
- [ ] 8. 기존 path URL canonical redirect 확정
- [ ] 9. 308 redirect 정책 결정
- [ ] 10. SEO canonical 정책 결정
- [ ] 11. 모바일 앱 deep link 영향 확인
- [ ] 12. 공유 링크 영향 확인
- [ ] 13. 로그인 쿠키 영향 확인
- [ ] 14. OAuth callback 영향 확인
- [ ] 15. API base URL 영향 확인
- [ ] 16. Cloudflare Tunnel 사용 여부 확인
- [ ] 17. Cloudflare Access 사용 여부 확인
- [ ] 18. 프론트 라우팅 방식 확인
- [ ] 19. 백엔드 라우팅 방식 확인
- [ ] 20. 롤백 기준 정의

## 2. 저장소/문서 조사

- [ ] 21. `git status --short --branch` 확인
- [ ] 22. 관련 `README.md` 확인
- [ ] 23. `apps/web` 라우트 구조 확인
- [ ] 24. `apps/backend` 컨트롤러 경로 확인
- [ ] 25. `apps/mobile` URL 참조 확인
- [ ] 26. `packages/api-client` base URL 확인
- [ ] 27. `packages/api-contract` public URL 참조 확인
- [ ] 28. `next.config` rewrites 확인
- [ ] 29. `middleware` 확인
- [ ] 30. 환경변수 목록 확인
- [ ] 31. `NEXT_PUBLIC_*` URL 확인
- [ ] 32. Spring CORS 설정 확인
- [ ] 33. Spring cookie domain 설정 확인
- [ ] 34. auth redirect 설정 확인
- [ ] 35. sitemap 설정 확인
- [ ] 36. robots 설정 확인
- [ ] 37. metadata canonical 확인
- [ ] 38. 배포 workflow 확인
- [ ] 39. Cloudflare 관련 문서 확인
- [ ] 40. 기존 운영 URL 문서화

## 3. 백로그/작업 로그

- [ ] 41. `docs/product/backlog/`에 백로그 생성
- [ ] 42. 작업 차수 1 작성
- [ ] 43. 작업 차수 2 작성
- [ ] 44. 작업 차수 3 작성
- [ ] 45. `작업내용` 작성
- [ ] 46. `논의 필요` 작성
- [ ] 47. `선택지` 작성
- [ ] 48. `추천` 작성
- [ ] 49. `사용자 방향` 작성
- [ ] 50. `ai-log/hyeonjun/YYYY-MM-DD/` 작업 로그 생성
- [ ] 51. 현재 목표 기록
- [ ] 52. 영향 범위 기록
- [ ] 53. Cloudflare 변경 필요 기록
- [ ] 54. 앱 코드 변경 필요 기록
- [ ] 55. 배포 계획 기록
- [ ] 56. 검증 계획 기록
- [ ] 57. 롤백 계획 기록
- [ ] 58. 완료 조건 기록
- [ ] 59. 미결정 사항 기록
- [ ] 60. 담당 워크트리 기록

## 4. Cloudflare DNS 준비

- [ ] 61. `typing` DNS 존재 여부 확인
- [ ] 62. `card` DNS 존재 여부 확인
- [ ] 63. `community` DNS 존재 여부 확인
- [ ] 64. 기존 충돌 레코드 확인
- [ ] 65. CNAME 대상 확인
- [ ] 66. Tunnel UUID 확인
- [ ] 67. proxied 상태 확인
- [ ] 68. SSL/TLS 모드 확인
- [ ] 69. Universal SSL 상태 확인
- [ ] 70. Edge certificate 상태 확인
- [ ] 71. wildcard certificate 여부 확인
- [ ] 72. DNSSEC 상태 확인
- [ ] 73. TTL 정책 확인
- [ ] 74. CAA 레코드 영향 확인
- [ ] 75. 기존 `yeon.world` 레코드 확인
- [ ] 76. `www.yeon.world` 영향 확인
- [ ] 77. dev 도메인 필요 여부 확인
- [ ] 78. staging 도메인 필요 여부 확인
- [ ] 79. DNS 변경 권한 확인
- [ ] 80. DNS 롤백 방법 기록

## 5. Cloudflare Tunnel 라우트

- [ ] 81. Zero Trust 대시보드 접속
- [ ] 82. Networks/Connectors 위치 확인
- [ ] 83. 운영 Tunnel 선택
- [ ] 84. 기존 public hostname 목록 확인
- [ ] 85. `yeon.world` 라우트 확인
- [ ] 86. `/typing-service` 처리 방식 확인
- [ ] 87. `/card-service` 처리 방식 확인
- [ ] 88. `/community` 처리 방식 확인
- [ ] 89. `typing.yeon.world` public hostname 추가
- [ ] 90. `card.yeon.world` public hostname 추가
- [ ] 91. `community.yeon.world` public hostname 추가
- [ ] 92. 각 hostname의 service URL 확인
- [ ] 93. origin port 확인
- [ ] 94. HTTP/HTTPS origin scheme 확인
- [ ] 95. noTLSVerify 필요 여부 확인
- [ ] 96. Host header override 필요 여부 확인
- [ ] 97. path matching 사용 여부 확인
- [ ] 98. 라우트 우선순위 확인
- [ ] 99. 저장 후 Tunnel 상태 확인
- [ ] 100. cloudflared 로그 확인

## 6. Cloudflare Access/Zero Trust 앱

- [ ] 101. Access 사용 여부 확인
- [ ] 102. 기존 Access app 목록 확인
- [ ] 103. `yeon.world` 앱 보호 정책 확인
- [ ] 104. path 기반 정책 확인
- [ ] 105. 새 subdomain 보호 필요 여부 결정
- [ ] 106. public 서비스면 Access 제외 결정
- [ ] 107. 보호 서비스면 Access app 추가
- [ ] 108. `typing.yeon.world` app 등록
- [ ] 109. `card.yeon.world` app 등록
- [ ] 110. `community.yeon.world` app 등록
- [ ] 111. IdP 정책 확인
- [ ] 112. allow 정책 확인
- [ ] 113. bypass 정책 확인
- [ ] 114. service token 정책 확인
- [ ] 115. session duration 확인
- [ ] 116. CORS preflight 차단 여부 확인
- [ ] 117. WebSocket 영향 확인
- [ ] 118. Access login redirect 확인
- [ ] 119. 비로그인 사용자 접근 확인
- [ ] 120. 정책 롤백 방법 기록

## 7. 프론트 라우팅

- [ ] 121. `apps/web` path route 확인
- [ ] 122. `/typing-service` page 확인
- [ ] 123. `/card-service` page 확인
- [ ] 124. `/community` page 확인
- [ ] 125. subdomain host 감지 필요 여부 확인
- [ ] 126. middleware host 분기 확인
- [ ] 127. Next rewrite 필요 여부 결정
- [ ] 128. route group 재사용 가능 여부 확인
- [ ] 129. hardcoded path 링크 검색
- [ ] 130. navigation 링크 수정 계획
- [ ] 131. CTA 링크 수정 계획
- [ ] 132. footer 링크 수정 계획
- [ ] 133. header 링크 수정 계획
- [ ] 134. sitemap URL 수정 계획
- [ ] 135. canonical URL 수정 계획
- [ ] 136. OpenGraph URL 수정 계획
- [ ] 137. share URL 수정 계획
- [ ] 138. login redirect URL 수정 계획
- [ ] 139. error page URL 수정 계획
- [ ] 140. local dev host 전략 결정

## 8. 백엔드/API 설정

- [ ] 141. Spring CORS allowed origins 확인
- [ ] 142. `https://typing.yeon.world` 추가 필요 확인
- [ ] 143. `https://card.yeon.world` 추가 필요 확인
- [ ] 144. `https://community.yeon.world` 추가 필요 확인
- [ ] 145. allowed origin pattern 사용 여부 확인
- [ ] 146. credential CORS 영향 확인
- [ ] 147. cookie SameSite 확인
- [ ] 148. cookie Secure 확인
- [ ] 149. cookie Domain 확인
- [ ] 150. session 공유 범위 확인
- [ ] 151. CSRF origin 검증 확인
- [ ] 152. redirect URI 검증 확인
- [ ] 153. referer/origin 기반 권한 확인
- [ ] 154. public API URL 문서 확인
- [ ] 155. WebSocket origin 확인
- [ ] 156. race-server CORS 확인
- [ ] 157. card API client 영향 확인
- [ ] 158. community API 영향 확인
- [ ] 159. health endpoint 영향 확인
- [ ] 160. backend env 변경 필요 확인

## 9. 인증/쿠키/OAuth

- [ ] 161. 로그인 성공 redirect 확인
- [ ] 162. 로그아웃 redirect 확인
- [ ] 163. callback URL 확인
- [ ] 164. Kakao callback 영향 확인
- [ ] 165. Google Sign-In callback 영향 확인
- [ ] 166. root OAuth와 서비스 URL 구분
- [ ] 167. auth cookie domain `.yeon.world` 필요 여부 확인
- [ ] 168. subdomain 간 세션 공유 필요 여부 확인
- [ ] 169. path 기반 cookie 제한 확인
- [ ] 170. CSRF cookie 범위 확인
- [ ] 171. refresh token cookie 범위 확인
- [ ] 172. localStorage key 충돌 확인
- [ ] 173. sessionStorage 영향 확인
- [ ] 174. guest auth branch 영향 확인
- [ ] 175. 인증 실패 화면 링크 확인
- [ ] 176. 초대 링크 인증 플로우 확인
- [ ] 177. 모바일 WebView 로그인 영향 확인
- [ ] 178. Access 인증과 앱 인증 충돌 확인
- [ ] 179. redirect allowlist 갱신
- [ ] 180. auth 회귀 테스트 작성

## 10. 서비스별 전환: typing

- [ ] 181. typing 현재 진입 URL 확인
- [ ] 182. typing 내부 링크 확인
- [ ] 183. typing race-server URL 확인
- [ ] 184. typing WebSocket URL 확인
- [ ] 185. typing share 링크 확인
- [ ] 186. typing result 링크 확인
- [ ] 187. typing invite 링크 확인
- [ ] 188. typing SEO metadata 확인
- [ ] 189. typing sitemap 반영
- [ ] 190. typing canonical 변경
- [ ] 191. typing Cloudflare hostname 연결
- [ ] 192. typing Access 정책 확인
- [ ] 193. typing CORS origin 추가
- [ ] 194. typing smoke test 작성
- [ ] 195. typing 로그인 테스트
- [ ] 196. typing 게스트 테스트
- [ ] 197. typing 레이스 입장 테스트
- [ ] 198. typing WebSocket 테스트
- [ ] 199. typing 기존 path redirect 테스트
- [ ] 200. typing 롤백 확인

## 11. 서비스별 전환: card

- [ ] 201. card 현재 진입 URL 확인
- [ ] 202. card deck 링크 확인
- [ ] 203. card room 링크 확인
- [ ] 204. card share 링크 확인
- [ ] 205. card guest deck 영향 확인
- [ ] 206. card authenticated deck 영향 확인
- [ ] 207. card API client URL 확인
- [ ] 208. card SEO metadata 확인
- [ ] 209. card sitemap 반영
- [ ] 210. card canonical 변경
- [ ] 211. card Cloudflare hostname 연결
- [ ] 212. card Access 정책 확인
- [ ] 213. card CORS origin 추가
- [ ] 214. card smoke test 작성
- [ ] 215. card 로그인 테스트
- [ ] 216. card 게스트 테스트
- [ ] 217. card 덱 생성 테스트
- [ ] 218. card 카드 편집 테스트
- [ ] 219. card 기존 path redirect 테스트
- [ ] 220. card 롤백 확인

## 12. 서비스별 전환: community

- [ ] 221. community 현재 진입 URL 확인
- [ ] 222. community feed 링크 확인
- [ ] 223. community post 링크 확인
- [ ] 224. community chat 링크 확인
- [ ] 225. community notification 링크 확인
- [ ] 226. community share 링크 확인
- [ ] 227. community API origin 확인
- [ ] 228. community SEO metadata 확인
- [ ] 229. community sitemap 반영
- [ ] 230. community canonical 변경
- [ ] 231. community Cloudflare hostname 연결
- [ ] 232. community Access 정책 확인
- [ ] 233. community CORS origin 추가
- [ ] 234. community smoke test 작성
- [ ] 235. community 로그인 테스트
- [ ] 236. community 글 목록 테스트
- [ ] 237. community 글 작성 테스트
- [ ] 238. community 댓글 테스트
- [ ] 239. community 기존 path redirect 테스트
- [ ] 240. community 롤백 확인

## 13. Redirect/호환성

- [ ] 241. `/typing-service` public 미유지 확정
- [ ] 242. `/card-service` public 미유지 확정
- [ ] 243. `/community` public 미유지 확정
- [ ] 244. typing 308 redirect 구현
- [ ] 245. card 308 redirect 구현
- [ ] 246. community 308 redirect 구현
- [ ] 247. query string 보존 확인
- [ ] 248. hash fragment 한계 확인
- [ ] 249. deep path 보존 확인
- [ ] 250. POST 요청 redirect 영향 확인
- [ ] 251. API path redirect 제외
- [ ] 252. static asset redirect 제외
- [ ] 253. health check redirect 제외
- [ ] 254. legacy bookmark 테스트
- [ ] 255. 카카오톡 공유 링크 테스트
- [ ] 256. 브라우저 캐시 영향 확인
- [ ] 257. canonical 중복 방지
- [ ] 258. sitemap old URL 제거
- [ ] 259. monitoring old URL 유지
- [ ] 260. redirect 롤백 방법 기록

## 14. 로컬/스테이징 검증

- [ ] 261. `/etc/hosts` 테스트 필요 여부 확인
- [ ] 262. local subdomain 테스트 전략 결정
- [ ] 263. dev server 포트 중복 확인
- [ ] 264. 기존 dev 서버 재사용
- [ ] 265. typing local smoke
- [ ] 266. card local smoke
- [ ] 267. community local smoke
- [ ] 268. lint 실행
- [ ] 269. typecheck 실행
- [ ] 270. 관련 unit test 실행
- [ ] 271. 관련 integration test 실행
- [ ] 272. Playwright 필요 여부 결정
- [ ] 273. 브라우저 실제 접속 확인
- [ ] 274. 로그인 실제 확인
- [ ] 275. 쿠키 domain 확인
- [ ] 276. CORS preflight 확인
- [ ] 277. WebSocket 확인
- [ ] 278. 모바일 영향 확인
- [ ] 279. 환경변수 누락 확인
- [ ] 280. 검증 결과 로그 기록

## 15. 배포/운영/롤백

- [ ] 281. 변경 파일 diff 확인
- [ ] 282. `git diff --check` 실행
- [ ] 283. 필요한 검증 스크립트 실행
- [ ] 284. 한국어 커밋 메시지 작성
- [ ] 285. owned files만 stage
- [ ] 286. feature branch push
- [ ] 287. PR to `main` 생성
- [ ] 288. release label 필요 여부 확인
- [ ] 289. PR 설명에 URL 변경 명시
- [ ] 290. PR merge
- [ ] 291. GitHub Actions URL 기록
- [ ] 292. Cloudflare 설정 완료 시간 기록
- [ ] 293. 신규 URL 200 확인
- [ ] 294. 기존 URL redirect 확인
- [ ] 295. 로그인 smoke 확인
- [ ] 296. 주요 서비스 smoke 확인
- [ ] 297. 에러 로그 확인
- [ ] 298. 사용자 공지 필요 여부 결정
- [ ] 299. 롤백 버튼/절차 확인
- [ ] 300. 완료 보고에 변경 파일·검증·남은 리스크 기록
