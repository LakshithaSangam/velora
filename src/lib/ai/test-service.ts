import type { QuestionStyle } from "@prisma/client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./client";
import { MODELS } from "./models";
import { TestGenerationSchema, type GeneratedQuestion } from "./schemas/test.schema";
import { TEST_GENERATION_SYSTEM_PROMPT, buildTestGenerationUserPrompt } from "./prompts/test-generation.prompt";

function extractText(message: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text content.");
  return textBlock.text;
}

export async function generateTest(
  sourceText: string,
  questionCount: number,
  style: QuestionStyle,
): Promise<{ questions: GeneratedQuestion[]; model: string }> {
  const stream = anthropic.messages.stream({
    model: MODELS.testGen,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: TEST_GENERATION_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(TestGenerationSchema), effort: "high" },
    messages: [{ role: "user", content: buildTestGenerationUserPrompt(sourceText, questionCount, style) }],
  });

  const message = await stream.finalMessage();
  const result = TestGenerationSchema.parse(JSON.parse(extractText(message)));

  if (result.questions.length === 0) {
    throw new Error("Claude did not return any questions.");
  }

  return { questions: result.questions, model: MODELS.testGen };
}
