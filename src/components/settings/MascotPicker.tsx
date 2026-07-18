"use client";

import { useMascotSpecies, setMascotSpecies, type MascotSpecies } from "@/lib/mascot-species";

const OPTIONS: { value: MascotSpecies; label: string }[] = [
  { value: "cat", label: "🐱 Cat" },
  { value: "dog", label: "🐶 Puppy" },
  { value: "hamster", label: "🐹 Hamster" },
  { value: "rabbit", label: "🐰 Rabbit" },
  { value: "koala", label: "🐨 Koala" },
  { value: "panda", label: "🐼 Panda" },
  { value: "owl", label: "🦉 Owl" },
];

export function MascotPicker() {
  const species = useMascotSpecies();

  return (
    <div className="max-w-md space-y-1">
      <label htmlFor="mascot" className="text-sm font-medium">
        Personal study partner:
      </label>
      <select
        id="mascot"
        value={species}
        onChange={(e) => setMascotSpecies(e.target.value as MascotSpecies)}
        className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">Changes right away — no reload needed.</p>
    </div>
  );
}
