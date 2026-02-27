import { useEffect, useState } from "react";
import { PaymentSuccess } from "../component/PaymentSuccess";
import { PaymentFailed } from "../component/PaymentFailed";
import { verifyPayment } from "../api/register.api";
import { LoadingState } from "../component/LoadingState";
import { NoReferenceState } from "../component/NoReference";
import logo from "../assets/logo1.png";

// ── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = "loading" | "success" | "failed" | "no-reference";

interface VerificationResult {
  paid: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentVerification() {
  // Get reference from URL query params
  const reference = new URLSearchParams(window.location.search).get(
    "reference",
  );

  // Determine initial status based on reference presence
  const initialStatus: VerificationStatus =
    !reference || reference.trim() === "" ? "no-reference" : "loading";

  const [status, setStatus] = useState<VerificationStatus>(initialStatus);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dotCount, setDotCount] = useState(1);

  // ── Animate loading dots ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(
      () => setDotCount((d) => (d === 3 ? 1 : d + 1)),
      500,
    );
    return () => clearInterval(interval);
  }, [status]);

  // ── Run verification on mount ────────────────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      // Only verify if we have a valid reference and status is loading
      if (!reference || reference.trim() === "" || status !== "loading") {
        return;
      }
      const response = await verifyPayment(reference);
      console.log("REsponse: ", response);
      setStatus(response.data.paid ? "success" : "failed");
      if (response.data.paid) {
        setResult(response.data);
      } else {
        setErrorMsg(response.message || "Payment verification failed.");
      }
    };
    verify();
  }, [status, reference]);

  return (
    <>
      <div className="min-h-screen bg-white font-body flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-black px-6 py-5 flex items-center gap-6 border-b-4 border-yellow-400">
          {/* Logo placeholder */}
          <div className="w-14 h-14 border-2 border-yellow-400 flex items-center justify-center shrink-0">
        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-0.5">
              TREM Oko Oba latterhouse sanctuary
            </p>
            <h1 className="font-display text-4xl text-white leading-none tracking-wide">
              LEAD CONFERENCE
            </h1>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end">
            <span className="text-white/40 text-xs uppercase tracking-widest">
              Registration
            </span>
            <span className="text-yellow-400 font-black text-sm">
              2026 Edition
            </span>
          </div>
        </div>

        {/* ── Accent stripe ──────────────────────────────────────────────── */}
        <div className="h-1.5 bg-linear-to-r from-yellow-400 via-red-600 to-yellow-400" />

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          {status === "loading" && (
            <LoadingState dotCount={dotCount} reference={reference} />
          )}
          {status === "success" && result && <PaymentSuccess result={result} />}
          {status === "failed" && (
            <PaymentFailed errorMsg={errorMsg} reference={reference} />
          )}
          {status === "no-reference" && <NoReferenceState />}
        </main>

        {/* ── Ticker ─────────────────────────────────────────────────────── */}
        <div className="bg-yellow-400 border-t-4 border-black overflow-hidden py-2">
          <div className="ticker-inner">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="text-black font-black uppercase tracking-widest text-sm mx-8"
              >
                LEAD CONFERENCE 2026 &nbsp;·&nbsp; TREM Latterhouse Sanctuary
                &nbsp;·&nbsp; EQUIPPING THE NEXT GENERATION &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
