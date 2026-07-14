"use client";

export function McqQuestion({
  index,
  prompt,
  options,
  selected,
  onSelect,
}: {
  index: number;
  prompt: string;
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium">
        {index + 1}. {prompt}
      </p>
      <div className="space-y-1">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2 text-sm">
            <input type="radio" name={`q-${index}`} checked={selected === i} onChange={() => onSelect(i)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
