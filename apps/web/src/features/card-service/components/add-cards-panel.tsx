"use client";
import { ResponsiveModal } from "./responsive-modal";
import {
  AddCardsPanelBody,
  AddCardsPanelFooter,
} from "./add-cards-panel-parts";
import { useAddCardsPanelState } from "./use-add-cards-panel-state";

interface AddCardsPanelProps {
  deckId: string;
  onClose: () => void;
}

export function AddCardsPanel({ deckId, onClose }: AddCardsPanelProps) {
  const panel = useAddCardsPanelState({ onClose });

  return (
    <ResponsiveModal
      title="카드 추가"
      description={panel.modeDescription}
      onClose={panel.handleRequestClose}
      widthClassName={panel.modalWidthClassName}
      footer={<AddCardsPanelFooter panel={panel} />}
      density="compact"
    >
      <AddCardsPanelBody deckId={deckId} panel={panel} onClose={onClose} />
    </ResponsiveModal>
  );
}
