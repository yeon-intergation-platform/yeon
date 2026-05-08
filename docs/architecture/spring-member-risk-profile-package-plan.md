# spring member-risk-profile package plan

- `world.yeon.backend.member_risk_profiles.controller.MemberRiskProfileController`
- `world.yeon.backend.member_risk_profiles.service.MemberRiskProfileService`
- `world.yeon.backend.member_risk_profiles.repository.MemberRiskProfileRepository`
- `world.yeon.backend.member_risk_profiles.dto.*`

책임:
- Spring이 memberId 목록별 최근 counseling risk record 최대 5개 조회
- analysis_result JSON에서 representative risk 계산
- Next는 member payload merge만 수행
