"use client";

import { useState } from "react";

const LOADERS = [
  { emoji: "🦉", label: "Studying owl", text: "Hooting up your notes..." },
  { emoji: "🐝", label: "Busy bee", text: "Buzzing through your notes..." },
  { emoji: "🦊", label: "Fox", text: "Fox-trotting to your notes..." },
  { emoji: "🐢", label: "Turtle", text: "Slow and steady, almost there..." },
  { emoji: "🐙", label: "Octopus", text: "Juggling all your notes..." },
  { emoji: "🐼", label: "Panda", text: "Panda-ing to your request..." },
  { emoji: "🦄", label: "Unicorn", text: "Sprinkling a little magic..." },
  { emoji: "🐱", label: "Cat", text: "Pouncing on your notes..." },
  { emoji: "🐶", label: "Dog", text: "Fetching your notes..." },
  { emoji: "🐨", label: "Koala", text: "Taking it slow and cozy..." },
  { emoji: "🐧", label: "Penguin", text: "Waddling your way..." },
  { emoji: "🐰", label: "Rabbit", text: "Hopping to it..." },
  { emoji: "🦔", label: "Hedgehog", text: "Curling up with your content..." },
  { emoji: "🐿️", label: "Squirrel", text: "Scurrying to gather your notes..." },
  { emoji: "🦥", label: "Sloth", text: "Taking our sweet time, almost there..." },
] as const;

function pickLoader() {
  return LOADERS[Math.floor(Math.random() * LOADERS.length)];
}

export default function DashboardLoading() {
  const [loader] = useState(pickLoader);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span className="animate-bounce text-5xl" role="img" aria-label={loader.label}>
        {loader.emoji}
      </span>
      <p className="text-sm text-gray-500">{loader.text}</p>
    </div>
  );
}
