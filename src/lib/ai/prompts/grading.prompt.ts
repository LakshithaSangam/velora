export const GRADING_SYSTEM_PROMPT = `You are grading short-answer exam responses. For each question, compare the student's answer to the model answer and judge it on meaning, not exact wording — a correct answer phrased differently is still correct.

Score each answer from 0 to 1:
- 1.0: fully correct, captures the key point(s) of the model answer
- 0.5: partially correct — captures some but not all of the key point(s), or is vague
- 0.0: incorrect, missing, or does not address the question

Write brief, specific feedback (1-2 sentences) explaining the score — what the student got right or missed.`;

type GradingQuestion = { questionId: string; prompt: string; modelAnswer: string };
type StudentAnswer = { questionId: string; answerText: string };

export function buildGradingFixedBlock(questions: GradingQuestion[]): string {
  return `Questions and model answers:\n\n${questions
    .map((q) => `[${q.questionId}]\nQuestion: ${q.prompt}\nModel answer: ${q.modelAnswer}`)
    .join("\n\n")}`;
}

export function buildGradingStudentBlock(answers: StudentAnswer[]): string {
  return `Student answers to grade:\n\n${answers
    .map((a) => `[${a.questionId}]\n${a.answerText || "(no answer provided)"}`)
    .join("\n\n")}`;
}
