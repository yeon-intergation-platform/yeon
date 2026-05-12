"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

type ToastState = { text: string; type: "success" | "error" } | null;

function OAuthResultToastInner() {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const gdError = searchParams.get("googledrive_error");
    const gdConnected = searchParams.get("googledrive_connected");
    const odError = searchParams.get("onedrive_error");
    const odConnected = searchParams.get("onedrive_connected");

    if (gdConnected === "true") {
      setToast({ text: "Google Drive 연동이 완료됐습니다.", type: "success" });
    } else if (gdError) {
      setToast({
        text: "Google Drive 연동에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } else if (odConnected === "true") {
      setToast({ text: "OneDrive 연동이 완료됐습니다.", type: "success" });
    } else if (odError) {
      setToast({
        text: "OneDrive 연동에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }

    if (gdError || gdConnected || odError || odConnected) {
      const params = new URLSearchParams(window.location.search);
      params.delete("googledrive_error");
      params.delete("googledrive_connected");
      params.delete("onedrive_error");
      params.delete("onedrive_connected");
      const qs = params.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const Icon = toast.type === "success" ? CheckCircle : AlertCircle;
  const bg = toast.type === "success" ? "var(--accent)" : "#ef4444";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={16} strokeWidth={2.5} />
      {toast.text}
    </div>
  );
}

export const OAuthResultToast = dynamic(
  () => Promise.resolve(OAuthResultToastInner),
  { ssr: false }
);
