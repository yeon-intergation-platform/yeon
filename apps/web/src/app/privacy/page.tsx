import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  YeonLegalDocumentPage,
  YeonLegalLink,
  YeonLegalList,
  YeonLegalSection,
  YeonListItem,
  YeonTable,
  YeonTableBody,
  YeonTableCell,
  YeonTableHead,
  YeonTableHeaderCell,
  YeonTableRow,
  YeonText,
} from "@yeon/ui";
import { SITE_BRAND_NAME, SITE_SUPPORT_EMAIL } from "@/lib/site-brand";

export const metadata: YeonPageMetadata = {
  title: `개인정보 처리방침 | ${SITE_BRAND_NAME}`,
  description:
    "YEON의 개인정보 수집 항목, 이용 목적, 보유 기간, 위탁 처리와 이용자 권리를 안내합니다.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `개인정보 처리방침 | ${SITE_BRAND_NAME}`,
    description:
      "YEON의 개인정보 수집 항목, 이용 목적, 보유 기간, 위탁 처리와 이용자 권리를 안내합니다.",
    url: "/privacy",
    type: "article",
  },
};

export default function PrivacyPage() {
  return (
    <YeonLegalDocumentPage
      title="개인정보 처리방침"
      lastUpdated="2026년 4월 10일"
    >
      <YeonLegalSection title="1. 개인정보의 수집 및 이용 목적">
        <YeonText variant="unstyled" tone="inherit">
          {SITE_BRAND_NAME}(이하 "서비스")은 교육기관 운영자 및 멘토가 수강생을
          효율적으로 관리하고 멘토링을 기록할 수 있도록 돕는 플랫폼입니다.
          서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.
        </YeonText>
      </YeonLegalSection>

      <YeonLegalSection title="2. 수집하는 개인정보 항목">
        <YeonTable className="mt-2">
          <YeonTableHead>
            <YeonTableRow>
              <YeonTableHeaderCell>항목</YeonTableHeaderCell>
              <YeonTableHeaderCell>수집 목적</YeonTableHeaderCell>
              <YeonTableHeaderCell>보유 기간</YeonTableHeaderCell>
            </YeonTableRow>
          </YeonTableHead>
          <YeonTableBody>
            <YeonTableRow>
              <YeonTableCell>
                이름, 이메일, 프로필 사진 (소셜 로그인)
              </YeonTableCell>
              <YeonTableCell>회원 식별 및 로그인</YeonTableCell>
              <YeonTableCell>회원 탈퇴 시까지</YeonTableCell>
            </YeonTableRow>
            <YeonTableRow>
              <YeonTableCell>수강생 이름, 이메일, 전화번호</YeonTableCell>
              <YeonTableCell>수강생 관리 및 운영 메모</YeonTableCell>
              <YeonTableCell>서비스 이용 종료 시까지</YeonTableCell>
            </YeonTableRow>
            <YeonTableRow>
              <YeonTableCell>멘토링 녹음 파일 및 AI 요약본</YeonTableCell>
              <YeonTableCell>운영 메모 보관 및 분석</YeonTableCell>
              <YeonTableCell>삭제 요청 시까지</YeonTableCell>
            </YeonTableRow>
            <YeonTableRow>
              <YeonTableCell>OneDrive · Google Drive OAuth 토큰</YeonTableCell>
              <YeonTableCell>클라우드 파일 연동</YeonTableCell>
              <YeonTableCell>연결 해제 시까지</YeonTableCell>
            </YeonTableRow>
          </YeonTableBody>
        </YeonTable>
      </YeonLegalSection>

      <YeonLegalSection title="3. 개인정보의 제3자 제공">
        <YeonText variant="unstyled" tone="inherit">
          서비스는 수집한 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
          다만, 아래의 경우는 예외로 합니다.
        </YeonText>
        <YeonLegalList>
          <YeonListItem>이용자가 사전에 동의한 경우</YeonListItem>
          <YeonListItem>
            법령에 의거하거나 수사 목적으로 기관의 요청이 있는 경우
          </YeonListItem>
        </YeonLegalList>
      </YeonLegalSection>

      <YeonLegalSection title="4. 개인정보 처리 위탁">
        <YeonTable className="mt-2">
          <YeonTableHead>
            <YeonTableRow>
              <YeonTableHeaderCell>수탁 업체</YeonTableHeaderCell>
              <YeonTableHeaderCell>위탁 업무</YeonTableHeaderCell>
            </YeonTableRow>
          </YeonTableHead>
          <YeonTableBody>
            <YeonTableRow>
              <YeonTableCell>Cloudflare (R2)</YeonTableCell>
              <YeonTableCell>녹음 파일 저장</YeonTableCell>
            </YeonTableRow>
            <YeonTableRow>
              <YeonTableCell>OpenAI</YeonTableCell>
              <YeonTableCell>AI 텍스트 분석 및 요약</YeonTableCell>
            </YeonTableRow>
            <YeonTableRow>
              <YeonTableCell>Neon / PostgreSQL</YeonTableCell>
              <YeonTableCell>데이터베이스 운영</YeonTableCell>
            </YeonTableRow>
          </YeonTableBody>
        </YeonTable>
      </YeonLegalSection>

      <YeonLegalSection title="5. 이용자의 권리">
        <YeonText variant="unstyled" tone="inherit">
          이용자는 언제든지 다음 권리를 행사할 수 있습니다.
        </YeonText>
        <YeonLegalList>
          <YeonListItem>개인정보 열람 요청</YeonListItem>
          <YeonListItem>개인정보 정정·삭제 요청</YeonListItem>
          <YeonListItem>개인정보 처리 정지 요청</YeonListItem>
          <YeonListItem>계정 탈퇴 및 데이터 삭제 요청</YeonListItem>
        </YeonLegalList>
        <YeonText variant="unstyled" tone="inherit">
          요청은 아래 연락처로 문의해주시면 지체 없이 처리하겠습니다.
        </YeonText>
      </YeonLegalSection>

      <YeonLegalSection title="6. 쿠키 사용">
        <YeonText variant="unstyled" tone="inherit">
          서비스는 로그인 세션 유지를 위해 쿠키를 사용합니다. 브라우저 설정에서
          쿠키를 비활성화할 수 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.
        </YeonText>
      </YeonLegalSection>

      <YeonLegalSection title="7. 개인정보 보호책임자">
        <YeonText variant="unstyled" tone="inherit">
          개인정보 처리에 관한 문의사항은 아래로 연락해주세요.
        </YeonText>
        <YeonLegalList>
          <YeonListItem>서비스명: {SITE_BRAND_NAME}</YeonListItem>
          <YeonListItem>
            이메일:{" "}
            <YeonLegalLink href={`mailto:${SITE_SUPPORT_EMAIL}`}>
              {SITE_SUPPORT_EMAIL}
            </YeonLegalLink>
          </YeonListItem>
        </YeonLegalList>
      </YeonLegalSection>

      <YeonLegalSection title="8. 방침 변경">
        <YeonText variant="unstyled" tone="inherit">
          본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시
          서비스 내 공지를 통해 안내합니다.
        </YeonText>
      </YeonLegalSection>
    </YeonLegalDocumentPage>
  );
}
