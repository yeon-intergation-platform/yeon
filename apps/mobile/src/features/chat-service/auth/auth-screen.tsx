import {
  YeonRedirect as Redirect,
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonAuthHeader as AuthHeader,
  YeonCenteredFormShell as CenteredFormShell,
  YeonDescriptionText as DescriptionText,
  YeonFormBlock as FormBlock,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonSectionTitle as SectionTitle,
  YeonTextField as TextField,
} from "@yeon/ui/native";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";

const LIFE_OS_ROUTE = "/life-os" as Href;
const CARD_SERVICE_ROUTE = "/card-service" as Href;

export function AuthScreen() {
  const router = useRouter();
  const { challenge, requestOtp, status, verifyOtp } = useChatServiceSession();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "signed_in") {
    return <Redirect href="/(tabs)/feed" />;
  }

  async function handleRequestOtp() {
    try {
      setIsSubmitting(true);
      const nextChallenge = await requestOtp(phoneNumber.trim());

      if (nextChallenge.acceptAnyCode) {
        showYeonAlert(
          "개발환경 인증",
          "개발환경에서는 인증번호에 아무 값이나 입력해도 입장됩니다."
        );
      } else {
        showYeonAlert("인증번호 전송", "문자로 인증번호를 보냈습니다.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "인증번호 요청에 실패했습니다.";
      showYeonAlert("오류", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    try {
      setIsSubmitting(true);
      await verifyOtp(code.trim());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "인증번호 확인에 실패했습니다.";
      showYeonAlert("오류", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MobileScreen
      contentVariant="centered"
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
    >
      <CenteredFormShell>
        <AuthHeader brand="연챗 - 익명 친구 만들기" title="회원가입" />

        <FormStack gap="roomy">
          <FormBlock>
            <SectionTitle spacing="none">전화번호</SectionTitle>
            <TextField
              keyboardType="phone-pad"
              label="휴대폰 번호"
              onChangeText={setPhoneNumber}
              placeholder="01012345678"
              value={phoneNumber}
            />

            <ActionButton
              disabled={isSubmitting || phoneNumber.trim().length < 10}
              label={challenge ? "인증번호 다시 요청" : "인증번호 요청"}
              onPress={handleRequestOtp}
            />
          </FormBlock>

          {challenge ? (
            <FormBlock>
              <SectionTitle spacing="none">인증번호</SectionTitle>
              <TextField
                keyboardType={
                  challenge.acceptAnyCode ? "default" : "number-pad"
                }
                label={challenge.acceptAnyCode ? "임의 값" : "인증번호"}
                maxLength={challenge.acceptAnyCode ? undefined : 6}
                onChangeText={setCode}
                placeholder={
                  challenge.acceptAnyCode ? "아무 값이나 입력" : "6자리 숫자"
                }
                value={code}
              />

              <ActionButton
                disabled={
                  isSubmitting ||
                  code.trim().length < (challenge.acceptAnyCode ? 1 : 6)
                }
                label="입장하기"
                onPress={handleVerifyOtp}
              />
            </FormBlock>
          ) : null}
          <FormBlock>
            <SectionTitle spacing="none">개인 생산성 도구</SectionTitle>
            <DescriptionText>
              Life OS와 카드 서비스는 Yeon 계정으로 별도 로그인해 사용할 수
              있습니다.
            </DescriptionText>
            <ActionButton
              label="Life OS 열기"
              onPress={() => router.push(LIFE_OS_ROUTE)}
              variant="secondary"
            />
            <ActionButton
              label="카드 서비스 열기"
              onPress={() => router.push(CARD_SERVICE_ROUTE)}
              variant="secondary"
            />
          </FormBlock>
        </FormStack>
      </CenteredFormShell>
    </MobileScreen>
  );
}
