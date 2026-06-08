"use client";

import { useEffect } from "react";

export function Toast({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transform transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-neutral-800">
        <i className="fa-solid fa-check text-emerald-400" aria-hidden />
        {message}
      </div>
    </div>
  );
}
