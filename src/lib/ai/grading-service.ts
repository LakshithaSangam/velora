import { generateStructured } from "./generate-structured";
import { MODELS } from "./models";
import { GradingSchema, type GradingResult } from "./schemas/grading.schema";
import { GRADING_SYSTEM_PROMPT, buildGradingFixedBlock, buildGradingStudentBlock } from "./prompts/grading.prompt";

export async function gradeShortAnswers(
  questions: { questionId: string; prompt: string; modelAnswer: string }[],
  answers: { questionId: string; answerText: string }[],
): Promise<GradingResult["results"]> {
  if (questions.length === 0) return [];

  const { data } = await generateStructured({
    model: MODELS.grading,
    systemPrompt: GRADING_SYSTEM_PROMPT,
    content: `${buildGradingFixedBlock(questions)}\n\n${buildGradingStudentBlock(answers)}`,
    schema: GradingSchema,
    maxOutputTokens: 4096,
  });

  return data.results;
}
