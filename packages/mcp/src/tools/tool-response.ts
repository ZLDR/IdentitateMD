import { getIndex } from "../data.js";
import { z } from "zod";

export const toolOutputSchema = {
  result: z.unknown(),
  catalog: z.object({
    schemaVersion: z.string(),
    generatedAt: z.string(),
  }),
};

export function readOnlyToolConfig(
  title: string,
  description: string,
  inputSchema: Record<string, z.ZodTypeAny>,
) {
  return {
    title,
    description,
    inputSchema,
    outputSchema: toolOutputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  };
}

export function toolResponse(result: unknown, isError = false) {
  const index = getIndex();
  const output = {
    result,
    catalog: {
      schemaVersion: index.schemaVersion,
      generatedAt: index.generatedAt,
    },
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
    ...(isError ? { isError: true } : {}),
  };
}
