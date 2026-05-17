import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ActionButton } from "../../components/ui/action-button";
import { StateBlock } from "../../components/ui/state-block";
import { TextField } from "../../components/ui/text-field";
import { TopBar } from "../../components/ui/top-bar";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import {
  clearPrimaryAuthSessionToken,
  writePrimaryAuthSessionToken,
} from "../../services/primary-auth/storage";
import {
  createGuestDeck,
  listGuestDecks,
} from "../../services/card-service/storage";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { colors, shadow } from "../../theme/colors";
import {
  CARD_SERVICE_MODE,
  resolveCardServiceSession,
} from "./card-service-session";

const CARD_SERVICE_DECK_DETAIL_ROUTE = "/card-service/decks/[deckId]" as Href;

function getCardServiceDeckDetailHref(deckId: string): Href {
  return {
    pathname: CARD_SERVICE_DECK_DETAIL_ROUTE,
    params: { deckId },
  } as Href;
}

function formatDeckMeta(deck: CardDeckDto): string {
  const updated = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(deck.updatedAt));

  return `카드 ${deck.itemCount}${CARD_SERVICE_TEXT.list.cardCountSuffix} · 업데이트 ${updated}`;
}

export function CardDeckListScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isBooting, setBooting] = useState(true);
  const [isSignedIn, setSignedIn] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");

  const decksQuery = useQuery({
    enabled: !isBooting,
    queryFn: async (): Promise<CardDeckDto[]> =>
      isSignedIn && sessionToken
        ? cardServiceApi
            .listCardDecks(sessionToken)
            .then((response) => response.decks)
        : listGuestDecks(),
    queryKey: cardServiceQueryKeys.decks(isSignedIn),
  });

  const isGuestMode = useMemo(() => !isSignedIn, [isSignedIn]);
  const loginMutation = useMutation({
    mutationFn: async () =>
      cardServiceApi.loginWithCredential({
        email: email.trim(),
        password,
      }),
    onSuccess: async (response) => {
      await writePrimaryAuthSessionToken(response.sessionToken);
      setSessionToken(response.sessionToken);
      setSignedIn(true);
      setPassword("");
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.all,
      });
    },
  });
  const createDeckMutation = useMutation({
    mutationFn: async (nextTitle: string) => {
      if (isSignedIn && sessionToken) {
        return cardServiceApi.createCardDeck(
          { title: nextTitle },
          sessionToken
        );
      }
      return createGuestDeck({ title: nextTitle });
    },
    onSuccess: async (response) => {
      setTitle("");
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(isSignedIn),
      });
      const deckId = "deck" in response ? response.deck.id : response.id;
      router.push(getCardServiceDeckDetailHref(deckId));
    },
  });

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function bootstrapSession() {
    setBooting(true);
    const next = await resolveCardServiceSession();
    setSessionToken(next.sessionToken);
    setSignedIn(next.mode === CARD_SERVICE_MODE.server);
    setBooting(false);
  }

  async function handleLogin() {
    try {
      await loginMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.list.loginErrorMessage;
      Alert.alert(CARD_SERVICE_TEXT.list.loginErrorTitle, message);
    }
  }

  async function handleLogout() {
    if (sessionToken) {
      try {
        await cardServiceApi.logout(sessionToken);
      } catch {
        // Local sign-out should still win.
      }
    }

    await clearPrimaryAuthSessionToken();
    setSessionToken(null);
    setSignedIn(false);
    queryClient.removeQueries({ queryKey: cardServiceQueryKeys.all });
  }

  async function handleCreateDeck() {
    try {
      await createDeckMutation.mutateAsync(title.trim());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.list.createDeckErrorMessage;
      Alert.alert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  if (isBooting) {
    return (
      <View style={[styles.screen, styles.center]}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.bootLoadingTitle}
        />
      </View>
    );
  }

  const decks = decksQuery.data ?? [];

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <TopBar
        rightLabel={
          isSignedIn ? CARD_SERVICE_TEXT.list.topBarLogoutLabel : undefined
        }
        onRightPress={handleLogout}
        subtitle={
          isGuestMode
            ? CARD_SERVICE_TEXT.list.topBarDescriptionGuest
            : CARD_SERVICE_TEXT.list.topBarDescriptionSignedIn
        }
        title={CARD_SERVICE_TEXT.list.topBarTitle}
      />

      {isGuestMode ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {CARD_SERVICE_TEXT.list.loginHintTitle}
          </Text>
          <Text style={styles.cardDescription}>
            {CARD_SERVICE_TEXT.list.loginHintDescription}
          </Text>
          <View style={styles.gap}>
            <TextField
              keyboardType="default"
              label={CARD_SERVICE_TEXT.list.loginEmailLabel}
              onChangeText={setEmail}
              placeholder={CARD_SERVICE_TEXT.list.loginEmailPlaceholder}
              value={email}
            />
            <TextField
              label={CARD_SERVICE_TEXT.list.loginPasswordLabel}
              onChangeText={setPassword}
              placeholder={CARD_SERVICE_TEXT.list.loginPasswordPlaceholder}
              secureTextEntry
              value={password}
            />
          </View>
          <ActionButton
            disabled={loginMutation.isPending || !email.trim() || !password}
            labelStyle={styles.loginButtonLabel}
            variant="dark"
            style={styles.loginButton}
            label={
              loginMutation.isPending
                ? CARD_SERVICE_TEXT.list.loginBusyLabel
                : CARD_SERVICE_TEXT.list.loginActionLabel
            }
            onPress={handleLogin}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {CARD_SERVICE_TEXT.list.deckSectionTitle}
        </Text>
        <TextField
          label={CARD_SERVICE_TEXT.list.deckNameLabel}
          onChangeText={setTitle}
          placeholder={CARD_SERVICE_TEXT.list.deckNamePlaceholder}
          value={title}
        />
        <ActionButton
          disabled={createDeckMutation.isPending || title.trim().length === 0}
          labelStyle={styles.createDeckButtonLabel}
          variant="dark"
          style={styles.createDeckButton}
          label={
            createDeckMutation.isPending
              ? CARD_SERVICE_TEXT.list.creatingDeckLabel
              : CARD_SERVICE_TEXT.list.createDeckButtonLabel
          }
          onPress={handleCreateDeck}
        />
      </View>

      {decksQuery.isPending ? (
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.loading}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      ) : decksQuery.isError ? (
        <StateBlock
          message={
            decksQuery.error instanceof Error
              ? decksQuery.error.message
              : CARD_SERVICE_TEXT.list.errorMessage
          }
          title={CARD_SERVICE_TEXT.state.errorTitle}
        />
      ) : decks.length === 0 ? (
        <StateBlock
          message={CARD_SERVICE_TEXT.list.emptyMessage}
          title={CARD_SERVICE_TEXT.list.emptyTitle}
        />
      ) : (
        <View style={styles.deckList}>
          {decks.map((deck) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${CARD_SERVICE_TEXT.shared.openDeckLabel}: ${deck.title}`}
              key={deck.id}
              onPress={() => router.push(getCardServiceDeckDetailHref(deck.id))}
              style={({ pressed }) => [
                styles.deckCard,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View>
                <Text style={styles.deckTitle}>{deck.title}</Text>
                <Text style={styles.deckCount}>{formatDeckMeta(deck)}</Text>
                {deck.description ? (
                  <Text style={styles.deckDescription}>{deck.description}</Text>
                ) : null}
              </View>
              <Text style={styles.deckOpenAction}>
                {CARD_SERVICE_TEXT.shared.openDeckLabel}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  center: {
    justifyContent: "center",
    padding: 24,
  },
  gap: {
    gap: 14,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    ...shadow,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  createDeckButton: {
    borderRadius: 14,
  },
  createDeckButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  deckFooter: {
    marginTop: 8,
  },
  deckFooterText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  loginButton: {
    borderRadius: 14,
  },
  loginButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  deckCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    padding: 18,
    alignItems: "flex-start",
    flexDirection: "column",
  },
  deckCount: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
  },
  deckDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  deckOpenAction: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  deckList: {
    gap: 12,
  },
  deckTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
  },
});
