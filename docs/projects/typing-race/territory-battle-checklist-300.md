# 타자 점령전 300 체크리스트

기준일: 2026-06-01

목표: `typing.yeon.world`에 실시간 팀 기반 타자 점령전 모드를 추가한다.

## 2026-06-01 진행 상태

- 구현 완료: shared protocol/helper, Colyseus room, web 점령전 route/hook, Phaser scene mount, 재접속 토큰 복구, race-server 2인/6인 smoke script.
- 2026-06-01 추가 구현: 전체 화면 모던 게임 HUD, muted red/blue Phaser board, 하단 입력 control bar, 점령전 route의 공용 floating chat 숨김.
- 검증 완료: local 2인 재접속 smoke, local 6인 지연 smoke, lint/typecheck/build, Playwright 화면 smoke.
- 아직 제품 후속으로 남는 항목: 덱 단어 연동, Spring 결과 저장, 랭킹, 모바일 최적화, 운영 실사용 부하 측정, 시각 에셋 고도화.

## 1. 목표/범위 확정

- [ ] 1. 타자 점령전의 한 줄 목표를 확정한다.
- [ ] 2. MVP 이름을 `타자 점령전`으로 고정한다.
- [ ] 3. 서비스 위치를 `typing.yeon.world` 내부 모드로 확정한다.
- [ ] 4. 기존 레이스와 별도 모드로 분리한다.
- [ ] 5. v0.1 범위를 2팀 5x5 60초 게임으로 제한한다.
- [ ] 6. v0.1은 랜덤 점령 규칙을 기본으로 한다.
- [ ] 7. v0.2 칸 선택 점령은 후속으로 분리한다.
- [ ] 8. v0.3 스킬/아이템은 후속으로 분리한다.
- [ ] 9. 게스트 진입을 기본 지원한다.
- [ ] 10. 로그인 기록 저장은 선택 기능으로 분리한다.
- [ ] 11. 모바일 1차 지원 범위를 입력/관전 가능 수준으로 제한한다.
- [ ] 12. 실시간 공정성을 서버 authoritative 원칙으로 고정한다.
- [ ] 13. 클라이언트 단독 점수 확정을 금지한다.
- [ ] 14. raw key stream 전송 금지를 원칙으로 둔다.
- [ ] 15. 서버에는 완성 제출 이벤트만 보낸다.
- [ ] 16. 게임 중 DB write 금지를 원칙으로 둔다.
- [ ] 17. 경기 종료 후 결과만 저장한다.
- [ ] 18. race-server 변경 시 shared protocol을 같이 갱신한다.
- [ ] 19. typing deck 연동은 v0.1 기본 단어풀 이후로 분리한다.
- [ ] 20. Phaser 적용은 서버 규칙 검증 후 진행한다.
- [ ] 21. React MVP를 먼저 만든다.
- [ ] 22. 운영 배포 전 502/WS smoke test를 포함한다.
- [ ] 23. Cloudflare `race.yeon.world` WebSocket 영향 범위를 확인한다.
- [ ] 24. 카카오/구글 로그인 redirect 영향은 이번 MVP에서 제외한다.
- [ ] 25. 점령전 결과 공유 링크는 후속으로 분리한다.
- [ ] 26. 랭킹은 후속으로 분리한다.
- [ ] 27. 부하 테스트 기준을 별도 항목으로 둔다.
- [ ] 28. rollback은 기존 typing-service 홈/레이스 유지로 정의한다.
- [ ] 29. 사용자 확인 기준을 URL/게임 시작/제출/종료로 정의한다.
- [ ] 30. 완료 보고에 남은 리스크를 포함한다.

## 2. 게임 규칙/밸런스

- [ ] 31. 팀은 red/blue 두 개로 고정한다.
- [ ] 32. 최소 시작 인원을 1명으로 둔다.
- [ ] 33. 권장 대전 인원은 2~6명으로 둔다.
- [ ] 34. 방 최대 인원 상한을 shared constant로 둔다.
- [ ] 35. 기본 제한 시간을 60초로 둔다.
- [ ] 36. 카운트다운은 3초로 둔다.
- [ ] 37. 보드 기본 크기는 5x5로 둔다.
- [ ] 38. 보드 셀 id는 deterministic하게 생성한다.
- [ ] 39. seed가 같으면 동일 보드가 생성되어야 한다.
- [ ] 40. 단어풀은 v0.1 내장 단어로 시작한다.
- [ ] 41. 단어는 한글 2~6자 중심으로 둔다.
- [ ] 42. 중복 단어는 보드 생성 시 제거한다.
- [ ] 43. 중립 칸 우선 점령 규칙을 둔다.
- [ ] 44. 중립 칸이 없으면 상대 칸 탈환을 허용한다.
- [ ] 45. 같은 팀 칸 재점령은 기본 점수만 허용하지 않는다.
- [ ] 46. 오타 제출은 점수 0으로 처리한다.
- [ ] 47. 빈 문자열 제출은 무시한다.
- [ ] 48. 공백 normalize 정책을 정의한다.
- [ ] 49. 대소문자 normalize는 한글 중심이라 후순위로 둔다.
- [ ] 50. 기본 점수는 글자 수 x 10으로 둔다.
- [ ] 51. 무오타 보너스는 +20으로 둔다.
- [ ] 52. 탈환 보너스는 +30으로 둔다.
- [ ] 53. 콤보 보너스는 combo x 5로 둔다.
- [ ] 54. 라인 완성 보너스는 +100으로 둔다.
- [ ] 55. 라인은 행/열만 v0.1에 포함한다.
- [ ] 56. 대각선 라인은 후속으로 둔다.
- [ ] 57. 동점이면 총 정확도 높은 팀이 승리한다.
- [ ] 58. 정확도도 동점이면 점령 칸 수가 많은 팀이 승리한다.
- [ ] 59. 모두 동점이면 draw 처리한다.
- [ ] 60. 결과 화면에는 팀 점수와 개인 기여도를 표시한다.
- [ ] 61. MVP에서는 아이템을 넣지 않는다.
- [ ] 62. MVP에서는 방해 효과를 넣지 않는다.
- [ ] 63. MVP에서는 채팅과 음성은 기존 방 기능과 분리한다.
- [ ] 64. 한 판 평균 시간을 90초 이하로 맞춘다.
- [ ] 65. 재대결 버튼을 결과 화면에 둔다.

## 3. UX/화면 설계

- [ ] 66. typing 홈에 `점령전 입장` CTA를 추가한다.
- [ ] 67. 점령전 랜딩은 흰 배경 미니멀로 만든다.
- [ ] 68. 게임 플레이 영역만 픽셀 감성을 허용한다.
- [ ] 69. 로비에서 빠른 시작 버튼을 제공한다.
- [ ] 70. 방 만들기 옵션을 v0.1에서는 최소화한다.
- [ ] 71. 보드 크기 옵션은 후속으로 감춘다.
- [ ] 72. 제한 시간 옵션은 후속으로 감춘다.
- [ ] 73. 팀 색상은 red/blue로 명확히 구분한다.
- [ ] 74. 색상 외 텍스트/패턴으로 소유 팀을 보조 표시한다.
- [ ] 75. 타이머는 상단 중앙에 둔다.
- [ ] 76. 팀 점수는 좌우 또는 상단 영역에 둔다.
- [ ] 77. 내 팀 배지는 입력창 가까이에 둔다.
- [ ] 78. 현재 목표 단어는 입력창 위에 크게 표시한다.
- [ ] 79. 입력창은 Enter 제출 중심으로 둔다.
- [ ] 80. 모바일에서는 제출 버튼을 추가한다.
- [ ] 81. 오타 상태를 빨강으로 표시한다.
- [ ] 82. 성공 제출은 초록/짧은 진동 느낌으로 표시한다.
- [ ] 83. 칸 점령은 즉시 색 전환으로 표시한다.
- [ ] 84. 서버 확정 전 pending 상태를 표시한다.
- [ ] 85. 서버 거절 시 pending을 되돌린다.
- [ ] 86. 보드 셀 hover/focus 상태를 제공한다.
- [ ] 87. 키보드만으로 입력이 가능해야 한다.
- [ ] 88. 게임 중 포커스가 입력창에 유지되어야 한다.
- [ ] 89. ESC 포기 동작을 확인한다.
- [ ] 90. 결과 화면은 승리팀을 먼저 보여준다.
- [ ] 91. 개인 기여도는 점령 칸 수/점수/정확도 순으로 보여준다.
- [ ] 92. 다시 하기 CTA를 결과 화면에 둔다.
- [ ] 93. 홈으로 나가기 CTA를 둔다.
- [ ] 94. 로비로 돌아가기 CTA를 둔다.
- [ ] 95. 로딩 상태와 연결 실패 상태를 분리한다.
- [ ] 96. 재접속 중 상태를 표시한다.
- [ ] 97. 관전 상태 문구를 준비한다.
- [ ] 98. 작은 화면에서는 보드를 5열 유지하되 셀 높이를 줄인다.
- [ ] 99. 색 대비를 WCAG 기준으로 점검한다.
- [ ] 100. 애니메이션은 reduce motion 설정을 존중한다.

## 4. shared protocol/type

- [ ] 101. `packages/race-shared/src/territory-battle.ts`를 만든다.
- [ ] 102. room name constant를 정의한다.
- [ ] 103. team constant를 as const로 정의한다.
- [ ] 104. phase constant를 as const로 정의한다.
- [ ] 105. event constant를 as const로 정의한다.
- [ ] 106. cell owner type을 정의한다.
- [ ] 107. board cell snapshot type을 정의한다.
- [ ] 108. player snapshot type을 정의한다.
- [ ] 109. team score snapshot type을 정의한다.
- [ ] 110. room snapshot type을 정의한다.
- [ ] 111. submit payload type을 정의한다.
- [ ] 112. submit result type을 정의한다.
- [ ] 113. error code constant를 정의한다.
- [ ] 114. default board size constant를 정의한다.
- [ ] 115. default duration constant를 정의한다.
- [ ] 116. default countdown constant를 정의한다.
- [ ] 117. score config constant를 정의한다.
- [ ] 118. word normalize helper를 만든다.
- [ ] 119. seeded random helper를 만든다.
- [ ] 120. board generation helper를 만든다.
- [ ] 121. score calculation helper를 만든다.
- [ ] 122. line completion helper를 만든다.
- [ ] 123. winner resolution helper를 만든다.
- [ ] 124. team assignment helper를 만든다.
- [ ] 125. submission validation helper를 만든다.
- [ ] 126. pure helper unit test를 작성한다.
- [ ] 127. index export를 갱신한다.
- [ ] 128. 타입 이름이 기존 typing race와 충돌하지 않게 한다.
- [ ] 129. enum 대신 as const 객체를 사용한다.
- [ ] 130. 서버와 웹이 같은 helper를 재사용하게 한다.

## 5. race-server

- [ ] 131. `TerritoryBattleRoom` 파일을 만든다.
- [ ] 132. server index에 room define을 추가한다.
- [ ] 133. health rooms 목록에 점령전 room을 추가한다.
- [ ] 134. filterBy 기준을 정의한다.
- [ ] 135. room onCreate에서 seed를 만든다.
- [ ] 136. room onCreate에서 board를 생성한다.
- [ ] 137. room onJoin에서 player를 등록한다.
- [ ] 138. 팀 자동 배정을 수행한다.
- [ ] 139. 닉네임/캐릭터 payload를 sanitize한다.
- [ ] 140. ready 이벤트를 처리한다.
- [ ] 141. start 이벤트를 처리한다.
- [ ] 142. 최소 인원 조건을 확인한다.
- [ ] 143. 카운트다운 timer를 서버 기준으로 둔다.
- [ ] 144. playing 시작 시 startsAt/endsAt을 고정한다.
- [ ] 145. submitWord 이벤트를 처리한다.
- [ ] 146. phase가 playing이 아니면 제출을 거절한다.
- [ ] 147. 서버 시간 기준 종료 후 제출을 거절한다.
- [ ] 148. 단어가 board에 없으면 거절한다.
- [ ] 149. 너무 빠른 제출 interval을 거절한다.
- [ ] 150. 탈환/점령 가능 셀을 선택한다.
- [ ] 151. 점수 계산을 shared helper로 수행한다.
- [ ] 152. player combo를 갱신한다.
- [ ] 153. player accuracy를 갱신한다.
- [ ] 154. team score를 갱신한다.
- [ ] 155. cellCaptured 이벤트를 broadcast한다.
- [ ] 156. 주기적 state snapshot을 broadcast한다.
- [ ] 157. 종료 timer를 둔다.
- [ ] 158. finish 시 winner를 계산한다.
- [ ] 159. result 이벤트를 broadcast한다.
- [ ] 160. 방 cleanup 타이머를 둔다.
- [ ] 161. disconnect grace를 둔다.
- [ ] 162. reconnect 시 player 상태를 복구한다.
- [ ] 163. room lock 조건을 정의한다.
- [ ] 164. max player 초과를 거절한다.
- [ ] 165. server unit 또는 integration test 전략을 문서화한다.
- [ ] 166. race-server typecheck를 통과시킨다.
- [ ] 167. race-server lint를 통과시킨다.
- [ ] 168. 로컬 WebSocket smoke test를 수행한다.
- [ ] 169. 운영 WebSocket smoke test를 수행한다.
- [ ] 170. 비정상 payload error message를 한국어로 둔다.
- [ ] 171. 기존 typing race room에 영향이 없음을 확인한다.
- [ ] 172. 기존 card room에 영향이 없음을 확인한다.
- [ ] 173. 기존 star lobby room에 영향이 없음을 확인한다.
- [ ] 174. Pi 배포 이미지 build 영향을 확인한다.

## 6. web UI

- [ ] 175. `/typing-service/territory` route를 추가한다.
- [ ] 176. 점령전 화면 컴포넌트를 만든다.
- [ ] 177. typing 홈 CTA를 추가한다.
- [ ] 178. SEO metadata를 추가한다.
- [ ] 179. 점령전 소개 문구를 기능 중심으로 작성한다.
- [ ] 180. 빠른 시작 버튼을 배치한다.
- [ ] 181. 로컬 프로토타입 보드를 먼저 표시한다.
- [ ] 182. 5x5 board grid를 만든다.
- [ ] 183. cell owner 색상을 표시한다.
- [ ] 184. cell word를 표시한다.
- [ ] 185. 입력창을 만든다.
- [ ] 186. 현재 목표 단어를 표시한다.
- [ ] 187. Enter submit을 처리한다.
- [ ] 188. 성공 시 local board 상태를 갱신한다.
- [ ] 189. 실패 시 오류 메시지를 표시한다.
- [ ] 190. 팀 점수 패널을 만든다.
- [ ] 191. 타이머 자리 표시를 만든다.
- [ ] 192. 내 팀 배지를 만든다.
- [ ] 193. 결과 placeholder를 만든다.
- [ ] 194. Colyseus 연결 hook을 설계한다.
- [ ] 195. race server URL resolver를 재사용한다.
- [ ] 196. room join payload를 정의한다.
- [ ] 197. state snapshot을 React state로 반영한다.
- [ ] 198. cellCaptured 이벤트를 반영한다.
- [ ] 199. result 이벤트를 반영한다.
- [ ] 200. 연결 실패 상태를 표시한다.
- [ ] 201. 재접속 상태를 표시한다.
- [ ] 202. 브라우저 focus 회복을 처리한다.
- [ ] 203. mobile layout을 확인한다.
- [ ] 204. reduce motion을 고려한다.
- [ ] 205. analytics event를 추가한다.
- [ ] 206. 서비스 홈 카드 순서를 검토한다.
- [ ] 207. 점령전 route test를 추가한다.
- [ ] 208. 컴포넌트 pure helper test를 추가한다.
- [ ] 209. web lint를 통과시킨다.
- [ ] 210. web typecheck를 통과시킨다.
- [ ] 211. web build를 통과시킨다.
- [ ] 212. 운영 URL smoke test를 수행한다.
- [ ] 213. home CTA 클릭 최종 URL을 확인한다.
- [ ] 214. 레거시 path redirect와 충돌이 없는지 확인한다.

## 7. game engine/Phaser

- [ ] 215. Phaser 적용 시점을 v0.2로 분리한다.
- [ ] 216. engine package에 territory scene entry를 만든다.
- [ ] 217. board scene을 만든다.
- [ ] 218. cell sprite atlas 필요 여부를 결정한다.
- [ ] 219. 픽셀 폰트 사용 여부를 결정한다.
- [ ] 220. 팀 점수 HUD를 만든다.
- [ ] 221. 타이머 HUD를 만든다.
- [ ] 222. cell flip animation을 만든다.
- [ ] 223. score popup animation을 만든다.
- [ ] 224. combo animation을 만든다.
- [ ] 225. team mascot placeholder를 만든다.
- [ ] 226. reduce motion 모드에서 애니메이션을 줄인다.
- [ ] 227. React와 Phaser 상태 경계를 정의한다.
- [ ] 228. Phaser scene은 authoritative state를 직접 계산하지 않는다.
- [ ] 229. 서버 snapshot을 scene command로 변환한다.
- [ ] 230. scene dispose cleanup을 작성한다.
- [ ] 231. resize handling을 작성한다.
- [ ] 232. mobile canvas scale을 확인한다.
- [ ] 233. memory leak을 확인한다.
- [ ] 234. FPS budget을 확인한다.
- [ ] 235. asset preload 실패 fallback을 만든다.
- [ ] 236. sprite 저작권/라이선스를 확인한다.
- [ ] 237. 기존 캐릭터 sprite 재사용 여부를 확인한다.
- [ ] 238. engine typecheck를 통과시킨다.
- [ ] 239. engine lint를 통과시킨다.

## 8. 저장/랭킹/기록

- [ ] 240. v0.1 저장 범위를 경기 결과로 제한한다.
- [ ] 241. raw key 저장 금지를 문서화한다.
- [ ] 242. team score 저장 필드를 설계한다.
- [ ] 243. player score 저장 필드를 설계한다.
- [ ] 244. captured cell count 저장 필드를 설계한다.
- [ ] 245. accuracy 저장 필드를 설계한다.
- [ ] 246. cpm 저장 필드를 설계한다.
- [ ] 247. game duration 저장 필드를 설계한다.
- [ ] 248. winner team 저장 필드를 설계한다.
- [ ] 249. draw 결과를 표현한다.
- [ ] 250. guest 결과 저장 정책을 결정한다.
- [ ] 251. 로그인 사용자 기록 병합 정책을 결정한다.
- [ ] 252. 일간 최고 기록은 후속으로 분리한다.
- [ ] 253. 시즌 랭킹은 후속으로 분리한다.
- [ ] 254. MVP는 DB migration 없이 진행 가능한지 확인한다.
- [ ] 255. DB 저장이 필요하면 Spring 소유 원칙을 검토한다.
- [ ] 256. Next.js에 신규 backend ownership을 만들지 않는다.
- [ ] 257. 결과 저장 API가 필요하면 Spring 쪽 계획을 세운다.
- [ ] 258. 운영 개인정보 영향이 없는지 확인한다.
- [ ] 259. 삭제/보존 정책을 문서화한다.

## 9. 테스트/검증

- [ ] 260. shared board generation deterministic test를 작성한다.
- [ ] 261. shared score calculation test를 작성한다.
- [ ] 262. shared line bonus test를 작성한다.
- [ ] 263. shared winner test를 작성한다.
- [ ] 264. shared team assignment test를 작성한다.
- [ ] 265. invalid submit test를 작성한다.
- [ ] 266. too fast submit test를 작성한다.
- [ ] 267. race-server room join smoke를 작성한다.
- [ ] 268. race-server submit smoke를 작성한다.
- [ ] 269. race-server finish smoke를 작성한다.
- [ ] 270. web component render test를 작성한다.
- [ ] 271. web input submit test를 작성한다.
- [ ] 272. web route smoke를 작성한다.
- [ ] 273. home CTA href test를 작성한다.
- [ ] 274. typing existing race test를 재실행한다.
- [ ] 275. race metrics test를 재실행한다.
- [ ] 276. typing room screen test를 재실행한다.
- [ ] 277. race-shared 전체 test를 실행한다.
- [ ] 278. race-server typecheck를 실행한다.
- [ ] 279. web typecheck를 실행한다.
- [ ] 280. web lint를 실행한다.
- [ ] 281. race-server lint를 실행한다.
- [ ] 282. race-shared lint를 실행한다.
- [ ] 283. web build를 실행한다.
- [ ] 284. race-server build를 실행한다.
- [ ] 285. 로컬 dev 서버 중복 실행을 피한다.
- [ ] 286. 필요 시 기존 포트를 확인한다.
- [ ] 287. WebSocket local connection을 확인한다.
- [ ] 288. 동시 2인 접속을 확인한다.
- [ ] 289. 동시 6인 접속을 확인한다.
- [ ] 290. 지연 200ms 상황을 확인한다.
- [ ] 291. disconnect/reconnect를 확인한다.
- [ ] 292. 서버 종료 후 클라이언트 오류 문구를 확인한다.
- [ ] 293. 운영 deploy 후 URL 200을 확인한다.
- [ ] 294. 운영 race server health를 확인한다.

## 10. 배포/운영/문서

- [ ] 295. 백로그 문서를 작성한다.
- [ ] 296. 작업 로그를 작성한다.
- [ ] 297. 기획 문서를 작성한다.
- [ ] 298. 300 체크리스트를 작성한다.
- [ ] 299. architecture 문서 링크를 갱신한다.
- [ ] 300. typing-service rule 영향 여부를 확인한다.
