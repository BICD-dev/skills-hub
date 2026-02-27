// ── No Reference State ────────────────────────────────────────────────────────

export function NoReferenceState() {
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