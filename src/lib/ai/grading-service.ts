import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./client";
import { MODELS } from "./models";
import { GradingSchema, type GradingResult } from "./schemas/grading.schema";
import { GRADING_SYSTEM_PROMPT, buildGradingFixedBlock, buildGradingStudentBlock } from "./prompts/grading.prompt";

export async function gradeShortAnswers(
  questions: { questionId: string; prompt: string; modelAnswer: string }[],
  answers: { questionId: string; answerText: string }[],
): Promise<GradingResult["results"]> {
  if (questions.length === 0) return [];

  const response = await anthropic.messages.parse({
    model: MODELS.grading,
    max_tokens: 4096,
    output_config: { format: zodOutputFormat(GradingSchema), effort: "low" },
    system: [{ type: "text", text: GRADING_SYSTEM_PROMPT }],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildGradingFixedBlock(questions),
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: buildGradingStudentBlock(answers) },
        ],
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("Grading response did not match the expected format.");
  }

  return response.parsed_output.results;
}
