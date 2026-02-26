// ─── Failed State Component ───────────────────────────────────────────────────

interface PaymentFailedProps {
  errorMsg: string;
  reference: string | null;
}

export function PaymentFailed({ errorMsg, reference }: PaymentFailedProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">

      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-red-600 border-4 border-black flex items-center justify-center animate-pop-in">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            className="cross-path"
            d="M12 12 L28 28 M28 12 L12 28"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="animate-fade-up delay-1">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 mb-1">
          Verification Failed
        </p>
        <h2 className="font-display text-5xl text-black tracking-wide leading-none">
          PAYMENT ISSUE
        </h2>
        <p className="text-black/50 font-medium mt-3 text-sm leading-relaxed">
          {errorMsg || "We could not verify your payment. This may be a temporary issue."}
        </p>
      </div>

      {/* Error card */}
      <div className="animate-fade-up delay-2 w-full border-4 border-red-600 shadow-[6px_6px_0_#dc2626]">
        <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
          <span className="text-white text-xs font-black uppercase tracking-widest">
            Transaction Details
          </span>
          <span className="text-white/70 text-xs font-black uppercase tracking-widest">
            ● Not Confirmed
          </span>
        </div>
        <div className="bg-white divide-y-2 divide-dashed divide-black/10">
          {reference && <ReceiptRow label="Reference" value={reference} mono />}
          <ReceiptRow label="Status" value="Unverified" red />
        </div>
      </div>

      {/* Help box */}
      <div className="animate-fade-up delay-3 w-full bg-black px-5 py-4 text-left">
        <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-3">
          What you can do
        </p>
        <div className="flex flex-col gap-2">
          {[
            "Wait a few minutes and try verifying again below",
            "Check if the amount was deducted from your account",
            "If deducted, contact us with your reference number",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-yellow-400 font-display text-lg leading-none shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-white/70 font-medium">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="animate-fade-up delay-4 w-full flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-yellow-400 text-black font-black uppercase tracking-widest py-3.5 text-sm border-2 border-black shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150"
        >
          Try Again
        </button>
        <a
          href="/"
          className="flex-1 bg-white text-black font-black uppercase tracking-widest py-3.5 text-sm text-center border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
        >
          Back to Form
        </a>
      </div>
    </div>
  );
}

// ── Receipt Row ───────────────────────────────────────────────────────────────

function ReceiptRow({
  label,
  value,
  mono = false,
  red = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  red?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-black/40 shrink-0">
        {label}
      </span>
      <span
        className={`text-sm font-black text-right break-all
          ${mono ? "font-mono text-xs" : ""}
          ${red ? "text-red-600" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
}
