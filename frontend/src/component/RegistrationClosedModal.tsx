import type { JSX } from "react";

interface RegistrationClosedModalProps {
  message: string;
}

export function RegistrationClosedModal({ message }: RegistrationClosedModalProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label="Registration closed"
    >
      <div
        className="w-full max-w-xl border-4 border-black bg-white shadow-[8px_8px_0_black]"
        style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <div className="bg-yellow-400 px-8 py-4 border-b-4 border-black">
          <h2 className="font-display text-4xl tracking-wide text-black">REGISTRATION CLOSED</h2>
        </div>
        <div className="px-8 py-6">
          <p className="text-sm font-bold uppercase tracking-wide text-black">{message}</p>
          <p className="text-xs text-black/60 mt-2 uppercase tracking-widest">
            Submissions for Skills Hub 2026 are currently disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
