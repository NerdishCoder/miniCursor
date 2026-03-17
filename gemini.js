import { initChatModel } from "langchain";
import { config } from "dotenv";
import { tools } from "./tools.js";
import * as z from "zod";
await config();

const routerSchema = z.object({
  complexity: z.enum(["simple", "complex"]),
});

const model1 = (await initChatModel("google-genai:gemini-3-flash-preview")).bindTools(tools);
const model2 = (await initChatModel("google-genai:gemini-3.1-flash-lite-preview")).bindTools(tools);
const model3 = (await initChatModel("google-genai:gemini-2.5-flash")).bindTools(tools);
const model4 = (await initChatModel("google-genai:gemini-2.5-flash-lite")).bindTools(tools);

export const routerModel = model2.withStructuredOutput(routerSchema);

export const largeModel = await model1.withFallbacks({
  fallbacks: [model3]
});

export const smallModel = await model2.withFallbacks({
  fallbacks: [model4]
});



