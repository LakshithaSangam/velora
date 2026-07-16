const LOADERS = [
  { emoji: "🦉", label: "Studying owl", text: "Hooting up your notes..." },
  { emoji: "📚", label: "Stack of books", text: "Cracking open the books..." },
  { emoji: "🐝", label: "Busy bee", text: "Buzzing through your notes..." },
  { emoji: "🧠", label: "Brain", text: "Firing up those neurons..." },
  { emoji: "🦊", label: "Fox", text: "Fox-trotting to your notes..." },
  { emoji: "🐢", label: "Turtle", text: "Slow and steady, almost there..." },
  { emoji: "🎓", label: "Graduation cap", text: "Prepping something smart..." },
  { emoji: "🔍", label: "Magnifying glass", text: "Digging up the details..." },
  { emoji: "☕", label: "Coffee", text: "Brewing up something good..." },
  { emoji: "🐙", label: "Octopus", text: "Juggling all your notes..." },
  { emoji: "🐼", label: "Panda", text: "Panda-ing to your request..." },
  { emoji: "🦄", label: "Unicorn", text: "Sprinkling a little magic..." },
] as const;

export default function DashboardLoading() {
  const loader = LOADERS[Math.floor(Math.random() * LOADERS.length)];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span className="animate-bounce text-5xl" role="img" aria-label={loader.label}>
        {loader.emoji}
      </span>
      <p className="text-sm text-gray-500">{loader.text}</p>
    </div>
  );
}
