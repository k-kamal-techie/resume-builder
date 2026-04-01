"use client";

import { ReactNode, useEffect, useRef } from "react";
import { LuX } from "react-icons/lu";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus the dialog panel
    setTimeout(() => panelRef.current?.focus(), 0);

    // ESC key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus on unmount
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className="relative z-50 w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl outline-none"
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <LuX className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
