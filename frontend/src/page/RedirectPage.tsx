import { useEffect, useState } from "react";
import { PaymentSuccess } from "../component/PaymentSuccess";
import { PaymentFailed } from "../component/PaymentFailed";

// ── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = "loading" | "success" | "failed" | "no-reference";

interface VerificationResult {
  paid: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

// ── Simulate API call — replace with your real fetch later ───────────────────

const simulateVerification = (reference: string): Promise<VerificationResult> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success for references starting with "LEAD"
      if (reference.startsWith("LEAD")) {
        resolve({
          paid: true,
          status: "success",
          reference,
          amount: 5000,
          currency: "NGN",
        });
      } else {
        reject(new Error("Payment could not be verified."));
      }
    }, 2800);
  });

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentVerification() {
  // Get reference from URL query params
  const reference = new URLSearchParams(window.location.search).get("reference");
  
  // Determine initial status based on reference presence
  const initialStatus: VerificationStatus = 
    (!reference || reference.trim() === "") ? "no-reference" : "loading";
  
  const [status, setStatus] = useState<VerificationStatus>(initialStatus);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dotCount, setDotCount] = useState(1);

  // ── Animate loading dots ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(
      () => setDotCount((d) => (d === 3 ? 1 : d + 1)),
      500
    );
    return () => clearInterval(interval);
  }, [status]);

  // ── Run verification on mount ────────────────────────────────────────────
  useEffect(() => {
    // Only verify if we have a valid reference and status is loading
    if (!reference || reference.trim() === "" || status !== "loading") {
      return;
    }

    // Replace simulateVerification with:
    // fetch(`/api/payment/verify/${reference}`)
    //   .then(res => res.json())
    //   .then(data => { ... })
    simulateVerification(reference)
      .then((data) => {
        setResult(data);
        // Check if payment was actually successful
        if (data.paid && data.status === "success") {
          setStatus("success");
        } else {
          setErrorMsg("Payment was not successful");
          setStatus("failed");
        }
      })
      .catch((err: Error) => {
        setErrorMsg(err.message || "An unexpected error occurred.");
        setStatus("failed");
      });
  }, [reference, status]);

  return (
    <>
      
      <div className="min-h-screen bg-white font-body flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
       <div className="bg-black px-6 py-5 flex items-center gap-6 border-b-4 border-yellow-400">
          {/* Logo placeholder */}
          <div className="w-14 h-14 border-2 border-yellow-400 flex items-center justify-center shrink-0">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest text-center leading-tight">LOGO</span>
          </div>
          <div>
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-0.5">
              TREM Oko Oba latterhuse sanctuary
            </p>
            <h1 className="font-display text-4xl text-white leading-none tracking-wide">
              LEAD CONFERENCE
            </h1>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end">
            <span className="text-white/40 text-xs uppercase tracking-widest">Registration</span>
            <span className="text-yellow-400 font-black text-sm">2026 Edition</span>
          </div>
        </div>

        {/* ── Accent stripe ──────────────────────────────────────────────── */}
        <div className="h-1.5 bg-linear-to-r from-yellow-400 via-red-600 to-yellow-400" />

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          {status === "loading" && <LoadingState dotCount={dotCount} reference={reference} />}
          {status === "success" && result && <PaymentSuccess result={result} />}
          {status === "failed" && <PaymentFailed errorMsg={errorMsg} reference={reference} />}
          {status === "no-reference" && <NoReferenceState />}
        </main>

        {/* ── Ticker ─────────────────────────────────────────────────────── */}
        <div className="bg-yellow-400 border-t-4 border-black overflow-hidden py-2">
          <div className="ticker-inner">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-black font-black uppercase tracking-widest text-sm mx-8">
                LEAD CONFERENCE 2026 &nbsp;·&nbsp; TREM Latterhouse Sanctuary &nbsp;·&nbsp;
                EQUIPPING THE NEXT GENERATION &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

// ── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ dotCount, reference }: { dotCount: number; reference: string | null }) {
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

// ── No Reference State ────────────────────────────────────────────────────────

function NoReferenceState() {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full animate-fade-up">
      <div className="w-20 h-20 border-4 border-black bg-yellow-400 flex items-center justify-center font-display text-4xl text-black">
        ?
      </div>
      <div>
        <h2 className="font-display text-4xl text-black tracking-wide">
          MISSING REFERENCE
        </h2>
        <p className="text-black/50 font-medium mt-2 text-sm">
          No payment reference was found in the URL. If you came here directly,
          please go back to the registration form.
        </p>
      </div>
      <a
        href="/"
        className="w-full bg-black text-yellow-400 font-black uppercase tracking-widest py-4 text-sm text-center border-2 border-black hover:bg-yellow-400 hover:text-black transition-all duration-200"
      >
        Go to Registration →
      </a>
    </div>
  );
}
