import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  counselingWorkspaceFetchJson,
  counselingWorkspaceFetchVoid,
} from "@/features/counseling-record-workspace/api/counseling-workspace-fetch";
import { counselingWorkspaceQueryKeys } from "@/features/counseling-record-workspace/api/counseling-workspace-query-keys";
import type { Space } from "@/features/counseling-record-workspace/hooks/use-current-space";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";

export type CreateSpaceStepKind = "choose" | "template" | "form" | "import";

export type CreateSpaceStep = { kind: CreateSpaceStepKind };

export interface TemplateOption {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  tabCount: number;
  fieldCount: number;
  tabPreviewNames: string[];
  fieldPreviewNames: string[];
  updatedAt: string;
}

type UseCreateSpaceModalControllerParams = {
  initialStep: CreateSpaceStepKind;
  onClose: () => void;
  onCreated: (space: Space) => void;
};

export function useCreateSpaceModalController({
  initialStep,
  onClose,
  onCreated,
}: UseCreateSpaceModalControllerParams) {
  const [step, setStep] = useState<CreateSpaceStep>({ kind: initialStep });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateLoadError, setTemplateLoadError] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: templatesData, isPending: templatesLoading } = useQuery({
    queryKey: counselingWorkspaceQueryKeys.spaceTemplates(),
    queryFn: async () => {
      try {
        const data = await counselingWorkspaceFetchJson<{
          templates: TemplateOption[];
        }>(
          resolveApiHrefForCurrentPath("/api/v1/space-templates"),
          {},
          "템플릿 목록을 불러오지 못했습니다."
        );
        setTemplateLoadError(null);
        return data;
      } catch {
        setTemplateLoadError("템플릿 목록을 불러오지 못했습니다.");
        return { templates: [] as TemplateOption[] };
      }
    },
    enabled: step.kind === "template",
  });

  const templates = templatesData ? templatesData.templates : [];
  const selectedTemplate =
    selectedTemplateId === null
      ? null
      : templates.find((template) => template.id === selectedTemplateId) ||
        null;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("스페이스 이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await counselingWorkspaceFetchJson<{ space: Space }>(
        resolveApiHrefForCurrentPath("/api/v1/spaces"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmed,
            description: description.trim() || null,
            startDate: startDate || null,
            endDate: endDate || null,
          }),
        },
        "스페이스를 만들지 못했습니다."
      );

      if (selectedTemplateId) {
        await counselingWorkspaceFetchVoid(
          resolveApiHrefForCurrentPath(
            `/api/v1/spaces/${data.space.id}/apply-template`
          ),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: selectedTemplateId }),
          },
          "스페이스 템플릿을 적용하지 못했습니다."
        ).catch(() => {});
      }

      onCreated(data.space);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "스페이스를 만들지 못했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    step,
    setStep,
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    saving,
    error,
    templateLoadError,
    selectedTemplateId,
    setSelectedTemplateId,
    previewOpen,
    setPreviewOpen,
    templates,
    templatesLoading,
    selectedTemplate,
    handleCreate,
  };
}
