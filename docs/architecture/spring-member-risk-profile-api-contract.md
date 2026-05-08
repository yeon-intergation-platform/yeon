# spring member-risk-profile API contract

- `POST /member-risk-profiles`
  - header: `X-Yeon-User-Id`
  - body:
    - `{ members: [{ id, initialRiskLevel? }] }`
  - response:
    - `{ profiles: [{ id, aiRiskLevel, aiRiskSummary, aiRiskSignals, riskSource, counselingRecordCount, lastCounselingAt }] }`

용도:
- `/members/[memberId]` 단건 조합
- `/spaces/[spaceId]/members` 목록 조합
