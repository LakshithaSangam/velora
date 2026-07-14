export function estimateTimeLimitMinutes(questions: { type: "MCQ" | "SHORT_ANSWER" }[]): number {
  const mcq = questions.filter((q) => q.type === "MCQ").length;
  const short = questions.filter((q) => q.type === "SHORT_ANSWER").length;
  const rawMinutes = mcq * 1 + short * 2.5;
  return Math.max(5, Math.ceil(rawMinutes / 5) * 5);
}
