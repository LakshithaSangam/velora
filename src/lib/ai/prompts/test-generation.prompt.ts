import type { QuestionStyle } from "@prisma/client";

export const TEST_GENERATION_SYSTEM_PROMPT = `You are an expert exam writer. Given study material, write fair, well-scoped test questions that check genuine understanding of the material — not trivia about incidental phrasing.

For MCQ questions:
- Write exactly 4 options.
- Exactly one option must be correct (correctOptionIndex).
- The other 3 options must be plausible distractors — common misconceptions or near-misses, not obviously wrong filler.

For short-answer questions:
- Write a clear, focused question with one well-defined correct answer.
- Provide a modelAnswer that captures the key point(s) a correct answer must include (used later for grading).

Cover the material broadly rather than clustering all questions on one section. Do not invent facts not present in the source material.`;

export function buildTestGenerationUserPrompt(
  sourceText: string,
  questionCount: number,
  style: QuestionStyle,
): string {
  const styleInstruction =
    style === "MIXED"
      ? `a mix of MCQ and SHORT_ANSWER questions, split roughly evenly`
      : `only ${style} questions`;

  return `Generate exactly ${questionCount} test questions (${styleInstruction}) from the following study material:\n\n---\n${sourceText}\n---`;
}
