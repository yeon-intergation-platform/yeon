import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonBrandIcon,
  YeonButton,
  YeonFormIntro as FormIntro,
  YeonImage,
  YeonText,
  YeonTextField as TextField,
  YeonView,
} from "@yeon/ui/native";

import mascotImage from "../../../assets/images/card-home/mascot-home.png";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { cardOnboardingGateStyles as styles } from "./card-onboarding-gate-styles";
import type { MobileSocialProvider } from "./social-login";

export function CardOnboardingHero() {
  return (
    <YeonView style={styles.hero}>
      <YeonImage
        resizeMode="contain"
        source={mascotImage}
        style={styles.heroMascot}
      />
      <YeonText style={styles.heroTitle}>
        {CARD_SERVICE_TEXT.list.gateTitle}
      </YeonText>
      <YeonText style={styles.heroSubtitle}>
        {CARD_SERVICE_TEXT.list.gateSubtitle}
      </YeonText>
    </YeonView>
  );
}

interface CardOnboardingSocialButtonsProps {
  disabled: boolean;
  onSocialLogin: (provider: MobileSocialProvider) => void;
  pendingProvider: MobileSocialProvider | null;
}

export function CardOnboardingSocialButtons({
  disabled,
  onSocialLogin,
  pendingProvider,
}: CardOnboardingSocialButtonsProps) {
  return (
    <>
      <YeonButton
        accessibilityRole="button"
        aria-label={CARD_SERVICE_TEXT.list.gateGoogleLabel}
        disabled={disabled}
        onPress={() => onSocialLogin("google")}
        style={styles.googleButton}
      >
        <YeonView style={styles.brandIconSlot}>
          <YeonBrandIcon name="google" size={22} tone="brand" />
        </YeonView>
        <YeonText style={styles.googleButtonText}>
          {pendingProvider === "google"
            ? CARD_SERVICE_TEXT.list.socialBusyLabel
            : CARD_SERVICE_TEXT.list.gateGoogleLabel}
        </YeonText>
      </YeonButton>

      <YeonButton
        accessibilityRole="button"
        aria-label={CARD_SERVICE_TEXT.list.gateKakaoLabel}
        disabled={disabled}
        onPress={() => onSocialLogin("kakao")}
        style={styles.kakaoButton}
      >
        <YeonView style={styles.brandIconSlot}>
          <YeonBrandIcon name="kakao" size={22} tone="brand" />
        </YeonView>
        <YeonText style={styles.kakaoButtonText}>
          {pendingProvider === "kakao"
            ? CARD_SERVICE_TEXT.list.socialBusyLabel
            : CARD_SERVICE_TEXT.list.gateKakaoLabel}
        </YeonText>
      </YeonButton>
    </>
  );
}

export function CardOnboardingDivider() {
  return (
    <YeonView style={styles.divider}>
      <YeonView style={styles.dividerLine} />
      <YeonText style={styles.dividerLabel}>
        {CARD_SERVICE_TEXT.list.gateOrLabel}
      </YeonText>
      <YeonView style={styles.dividerLine} />
    </YeonView>
  );
}

interface CardOnboardingSecondaryActionsProps {
  disabled: boolean;
  onOpenEmailLogin: () => void;
  onOpenRegister: () => void;
}

export function CardOnboardingSecondaryActions({
  disabled,
  onOpenEmailLogin,
  onOpenRegister,
}: CardOnboardingSecondaryActionsProps) {
  return (
    <YeonView style={styles.secondaryRow}>
      <YeonButton
        accessibilityRole="button"
        aria-label={CARD_SERVICE_TEXT.list.gateEmailLoginLabel}
        disabled={disabled}
        onPress={onOpenEmailLogin}
        style={styles.secondaryButton}
      >
        <YeonText style={styles.secondaryButtonText}>
          {CARD_SERVICE_TEXT.list.gateEmailLoginLabel}
        </YeonText>
      </YeonButton>
      <YeonButton
        accessibilityRole="button"
        aria-label={CARD_SERVICE_TEXT.list.gateRegisterLabel}
        disabled={disabled}
        onPress={onOpenRegister}
        style={styles.secondaryButton}
      >
        <YeonText style={styles.secondaryButtonText}>
          {CARD_SERVICE_TEXT.list.gateRegisterLabel}
        </YeonText>
      </YeonButton>
    </YeonView>
  );
}

interface CardOnboardingGuestActionProps {
  disabled: boolean;
  onContinue: () => void;
}

export function CardOnboardingGuestAction({
  disabled,
  onContinue,
}: CardOnboardingGuestActionProps) {
  return (
    <YeonButton
      accessibilityRole="button"
      aria-label={CARD_SERVICE_TEXT.list.guestContinueLabel}
      disabled={disabled}
      onPress={onContinue}
      style={styles.guestNoteButton}
    >
      <YeonText style={styles.guestNoteText}>
        {CARD_SERVICE_TEXT.list.gateGuestNote}
      </YeonText>
    </YeonButton>
  );
}

interface CardEmailLoginSheetProps {
  email: string;
  isPending: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  password: string;
  visible: boolean;
}

export function CardEmailLoginSheet({
  email,
  isPending,
  onChangeEmail,
  onChangePassword,
  onClose,
  onSubmit,
  password,
  visible,
}: CardEmailLoginSheetProps) {
  return (
    <BottomSheetModal
      closeAccessibilityLabel="닫기"
      onClose={onClose}
      visible={visible}
    >
      <BottomSheetForm>
        <FormIntro title={CARD_SERVICE_TEXT.list.gateEmailSheetTitle} />
        <TextField
          keyboardType="email-address"
          label={CARD_SERVICE_TEXT.list.loginEmailLabel}
          onChangeText={onChangeEmail}
          placeholder={CARD_SERVICE_TEXT.list.loginEmailPlaceholder}
          value={email}
        />
        <TextField
          label={CARD_SERVICE_TEXT.list.loginPasswordLabel}
          onChangeText={onChangePassword}
          placeholder={CARD_SERVICE_TEXT.list.loginPasswordPlaceholder}
          secureTextEntry
          value={password}
        />
        <ActionButton
          disabled={isPending || !email.trim() || !password}
          label={
            isPending
              ? CARD_SERVICE_TEXT.list.loginBusyLabel
              : CARD_SERVICE_TEXT.list.loginActionLabel
          }
          onPress={onSubmit}
          variant="dark"
        />
      </BottomSheetForm>
    </BottomSheetModal>
  );
}
