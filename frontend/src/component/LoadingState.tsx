// ── Loading State ─────────────────────────────────────────────────────────────

export function LoadingState({ dotCount, reference }: { dotCount: number; reference: string | null }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
      <div className="spin-ring" />

      <div>
        <h2 className="font-display text-4xl text-black tracking-wide">
          VERIFYING PAYMENT
        </h2>
        <p className="text-black/50 font-medium mt-2 text-sm">
          Please wait, we are confirming your payment
          {".".repeat(dotCount)}
        </p>
      </div>

      {/* Shimmer skeleton */}
      <div className="w-full border-2 border-black p-5 flex flex-col gap-3">
        <div className="shimmer-bar h-4 w-3/4 rounded" />
        <div className="shimmer-bar h-4 w-1/2 rounded" />
        <div className="shimmer-bar h-4 w-2/3 rounded" />
        {reference && (
          <p className="text-[11px] text-black/30 font-mono mt-1 break-all">
            REF: {reference}
          </p>
        )}
      </div>

      <p className="text-xs text-black/30 uppercase tracking-widest">
        Do not close or refresh this page
      </p>
    </div>
  );
}