interface fieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    hint?: string;
}


// ─── FIELD COMPONENT ─────────────────────────────────────────────────────────
export function Field({ label, required, children, hint }: fieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold uppercase tracking-widest text-black/80">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-black/40 italic">{hint}</p>}
    </div>
  );
}