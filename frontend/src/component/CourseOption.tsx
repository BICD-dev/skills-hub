interface courseOptionProps {
    course: { id: string; label: string };
    selected: boolean;
    onChange: () => void;
    type: "physical" | "online";
    disabled?: boolean;
}

// ─── CHECKABLE COURSE OPTION ─────────────────────────────────────────────────
export function CourseOption({ course, selected, onChange, type, disabled }: courseOptionProps) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-all duration-150 select-none
        ${selected ? "border-yellow-400 bg-yellow-50" : "border-black/20 bg-white hover:border-yellow-400 hover:bg-yellow-50/50"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <input
        type={type === "physical" ? "radio" : "checkbox"}
        name={type === "physical" ? "physical-course" : undefined}
        checked={selected}
        onChange={onChange}
        disabled={disabled}
        className="accent-yellow-400 w-4 h-4 cursor-pointer"
      />
      <span className="text-sm font-medium text-black">{course.label}</span>
      {selected && (
        <span className="ml-auto text-yellow-500">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.7 4.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6 10.6l6.3-6.3a1 1 0 0 1 1.4 0z" />
          </svg>
        </span>
      )}
    </label>
  );
}