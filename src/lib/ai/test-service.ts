import type { QuestionStyle } from "@prisma/client";
import { generateStructured } from "./generate-structured";
import { MODELS } from "./models";
import { TestGenerationSchema, type GeneratedQuestion, type RawQuestion } from "./schemas/test.schema";
import { TEST_GENERATION_SYSTEM_PROMPT, buildTestGenerationUserPrompt } from "./prompts/test-generation.prompt";

function normalizeQuestion(q: RawQuestion): GeneratedQuestion | null {
  if (q.type === "MCQ") {
    if (
      !q.options ||
      q.options.length !== 4 ||
      q.correctOptionIndex === undefined ||
      q.correctOptionIndex < 0 ||
      q.correctOptionIndex > 3
    ) {
      return null;
    }
    return { type: "MCQ", prompt: q.prompt, options: q.options, correctOptionIndex: q.correctOptionIndex };
  }
  if (!q.modelAnswer) return null;
  return { type: "SHORT_ANSWER", prompt: q.prompt, modelAnswer: q.modelAnswer };
}

export async function generateTest(
  sourceText: string,
  questionCount: number,
  style: QuestionStyle,
  repeatQuestions: GeneratedQuestion[] = [],
): Promise<{ questions: GeneratedQuestion[]; model: string }> {
  const freshCount = Math.max(1, questionCount - repeatQuestions.length);

  const { data, model } = await generateStructured({
    model: MODELS.testGen,
    systemPrompt: TEST_GENERATION_SYSTEM_PROMPT,
    content: buildTestGenerationUserPrompt(sourceText, freshCount, style),
    schema: TestGenerationSchema,
    maxOutputTokens: 32000,
  });

  const freshQuestions = data.questions.map(normalizeQuestion).filter((q): q is GeneratedQuestion => q !== null);
  const questions = [...repeatQuestions, ...freshQuestions];

  if (questions.length === 0) {
    throw new Error("Gemini did not return any valid questions.");
  }

  return { questions, model };
}
