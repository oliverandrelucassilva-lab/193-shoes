"use client";

import { useState } from "react";

export default function ShareImageButton({
  imageUrl,
  fileName,
  label,
}: {
  imageUrl: string;
  fileName: string;
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "sharing" | "error">("idle");

  async function handleShare() {
    setStatus("sharing");
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
      } else {
        window.open(imageUrl, "_blank");
      }
      setStatus("idle");
    } catch {
      window.open(imageUrl, "_blank");
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={status === "sharing"}
      className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {status === "sharing" ? "Abrindo..." : label}
    </button>
  );
}
