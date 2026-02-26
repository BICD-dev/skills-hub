// ─── Success State Component ──────────────────────────────────────────────────

interface VerificationResult {
  paid: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

interface PaymentSuccessProps {
  result: VerificationResult;
}

export function PaymentSuccess({ result }: PaymentSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">

      {/* Icon */}
      <div
        className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center success-ring animate-pop-in"
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path
            className="check-path"
            d="M9 22 L18 32 L36 13"
            stroke="black"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="animate-fade-up delay-1">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500 mb-1">
          Payment Confirmed
        </p>
        <h2 className="font-display text-5xl text-black tracking-wide leading-none">
          YOU'RE IN!
        </h2>
        <p className="text-black/50 font-medium mt-3 text-sm leading-relaxed">
          Your registration for LEAD Conference Skill Hub 2026 is confirmed.
          A confirmation email will be sent to you shortly.
        </p>
      </div>

      {/* Receipt card */}
      <div className="animate-fade-up delay-2 w-full border-4 border-black shadow-[6px_6px_0_black] bg-white">
        {/* Card header */}
        <div className="bg-black px-5 py-3 flex items-center justify-between">
          <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">
            Payment Receipt
          </span>
          <span className="text-green-400 text-xs font-black uppercase tracking-widest">
            ● Verified
          </span>
        </div>

        {/* Card body */}
        <div className="divide-y-2 divide-dashed divide-black/10">
          <ReceiptRow label="Reference" value={result.reference} mono />
          <ReceiptRow
            label="Amount Paid"
            value={formatAmount(result.amount, result.currency)}
            highlight
          />
          <ReceiptRow label="Status" value="Successful" green />
          <ReceiptRow
            label="Date"
            value={new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </div>
      </div>

      {/* Next steps */}
      <div className="animate-fade-up delay-3 w-full bg-yellow-50 border-2 border-yellow-400 px-5 py-4 text-left">
        <p className="text-xs font-black uppercase tracking-widest text-black mb-3">
          What happens next
        </p>
        <div className="flex flex-col gap-2">
          {[
            "Check your email for your registration confirmation",
            "Save your payment reference for your records",
            "Details about the conference venue and schedule will be sent closer to the event",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-display text-yellow-500 text-lg leading-none shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-black/70 font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-4 w-full flex flex-col sm:flex-row gap-3">
        <a
          href="/"
          className="flex-1 bg-black text-yellow-400 font-black uppercase tracking-widest py-3.5 text-sm text-center border-2 border-black hover:bg-yellow-400 hover:text-black transition-all duration-200"
        >
          Back to Home
        </a>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-white text-black font-black uppercase tracking-widest py-3.5 text-sm border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}

// ── Receipt Row ───────────────────────────────────────────────────────────────

function ReceiptRow({
  label,
  value,
  mono = false,
  highlight = false,
  green = false,
  red = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  green?: boolean;
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
          ${highlight ? "text-black text-base" : ""}
          ${green ? "text-green-600" : ""}
          ${red ? "text-red-600" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}
