import { showYeonAlert } from "@yeon/ui/native";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";

import { uploadCardImageAsset } from "../../services/card-service/asset-upload";
import { getCardServiceErrorMessage } from "./error-message";
import {
  applyMarkdownTextFieldFormat,
  insertMarkdownTextFieldSnippetAtCursor,
  type InsertResult,
  type Selection,
  type ToolbarAction,
} from "./markdown-text-field-formatting";

interface UseMarkdownTextFieldControllerParams {
  maxLength?: number;
  onChangeText: (value: string) => void;
  value: string;
}

export function useMarkdownTextFieldController({
  maxLength,
  onChangeText,
  value,
}: UseMarkdownTextFieldControllerParams) {
  // 툴바 삽입 직후에만 selection을 제어하고, 그 외에는 비제어(undefined)로 둔다.
  // 이로써 onChangeText와 selection 간 동기화 문제(커서 점프)를 방지한다(idx=131).
  const [controlledSelection, setControlledSelection] = useState<
    Selection | undefined
  >(undefined);
  const [isUploading, setUploading] = useState(false);

  // 최신 value와 selection을 ref로 유지해 비동기 핸들러에서 stale closure를 방지한다(idx=132).
  const valueRef = useRef(value);
  const selectionRef = useRef<Selection>({ start: 0, end: 0 });
  valueRef.current = value;

  function commit(result: InsertResult) {
    if (typeof maxLength === "number" && result.value.length > maxLength) {
      // idx=130: 조용히 드롭하는 대신 사용자에게 안내한다.
      showYeonAlert(
        "내용이 너무 길어요",
        `최대 ${maxLength}자까지 입력할 수 있어요. 이미지를 삽입하면 글자 수가 초과됩니다.`
      );
      return;
    }
    onChangeText(result.value);
    // 삽입 후 커서 위치를 일시적으로 제어하고, 다음 onSelectionChange에서 해제한다(idx=131).
    setControlledSelection(result.selection);
  }

  async function handleAction(action: ToolbarAction) {
    if (action === "image") {
      await handleInsertImage();
      return;
    }
    // 최신 value/selection을 ref에서 읽어 stale closure를 피한다(idx=132).
    commit(
      applyMarkdownTextFieldFormat(
        valueRef.current,
        selectionRef.current,
        action
      )
    );
  }

  async function handleInsertImage() {
    if (isUploading) return;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showYeonAlert(
          "권한 필요",
          "이미지를 첨부하려면 사진 접근 권한이 필요해요."
        );
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (picked.canceled || !picked.assets[0]) return;

      const asset = picked.assets[0];
      setUploading(true);
      const uploaded = await uploadCardImageAsset({
        uri: asset.uri,
        name: asset.fileName ?? "image.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      // 업로드 완료 시점의 최신 value/selection을 ref에서 읽는다(idx=132).
      commit(
        insertMarkdownTextFieldSnippetAtCursor(
          valueRef.current,
          selectionRef.current,
          `\n![](${uploaded.imageUrl})\n`
        )
      );
    } catch (error) {
      showYeonAlert(
        "이미지 첨부 실패",
        getCardServiceErrorMessage(error, "이미지를 첨부하지 못했어요.")
      );
    } finally {
      setUploading(false);
    }
  }

  function handleSelectionChange(selection: Selection) {
    selectionRef.current = selection;
    // 제어된 selection을 해제한다(커서가 자연스럽게 이동한 것으로 간주)(idx=131).
    if (controlledSelection !== undefined) {
      setControlledSelection(undefined);
    }
  }

  return {
    controlledSelection,
    handleAction,
    handleSelectionChange,
    isUploading,
  };
}
