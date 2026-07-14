"use client";

export function ShortAnswerQuestion({
  index,
  prompt,
  value,
  onChange,
}: {
  index: number;
  prompt: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium">
        {index + 1}. {prompt}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
        placeholder="Your answer..."
      />
    </div>
  );
}
