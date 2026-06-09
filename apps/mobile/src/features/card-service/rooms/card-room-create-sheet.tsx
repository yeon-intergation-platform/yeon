import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonFormIntro as FormIntro,
  YeonTextField as TextField,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import {
  CardRoomCreateDeckSelector,
  CardRoomCreateVisibilitySelector,
} from "./card-room-create-sheet-sections";
import { useCardRoomCreateSheetState } from "./use-card-room-create-sheet-state";

type CardRoomCreateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: (roomId: string) => void;
};

export function CardRoomCreateSheet({
  visible,
  onClose,
  onCreated,
}: CardRoomCreateSheetProps) {
  const state = useCardRoomCreateSheetState({ onCreated, visible });

  return (
    <BottomSheetModal
      closeAccessibilityLabel={CARD_SERVICE_TEXT.shared.closeModalLabel}
      onClose={onClose}
      visible={visible}
    >
      <BottomSheetForm>
        <FormIntro
          hint={CARD_SERVICE_TEXT.rooms.createSubtitle}
          title={CARD_SERVICE_TEXT.rooms.createTitle}
        />
        <TextField
          label={CARD_SERVICE_TEXT.rooms.createRoomNameLabel}
          onChangeText={state.setTitle}
          placeholder={CARD_SERVICE_TEXT.rooms.createRoomNamePlaceholder}
          value={state.title}
        />

        <CardRoomCreateDeckSelector
          decks={state.decks}
          onSelectDeck={state.setSelectedDeckId}
          selectedDeckId={state.selectedDeckId}
        />

        <CardRoomCreateVisibilitySelector
          onChangeVisibility={state.setVisibility}
          visibility={state.visibility}
        />

        <ActionButton
          disabled={!state.canSubmit}
          label={
            state.isPending
              ? CARD_SERVICE_TEXT.rooms.createBusyLabel
              : CARD_SERVICE_TEXT.rooms.createSubmitLabel
          }
          onPress={state.handleCreate}
          variant="dark"
        />
      </BottomSheetForm>
    </BottomSheetModal>
  );
}
