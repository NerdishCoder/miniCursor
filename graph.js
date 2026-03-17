import { Annotation, StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { smallModel, largeModel, routerModel} from "./gemini.js";
import { tools } from "./tools.js";
import {config} from "dotenv";
await config();


const routerSchema = z.object({
  complexity: z.enum(["simple", "complex"]),
});

const toolNode = new ToolNode(tools);

const routerNode = async (state) => {
  const response = await routerModel.invoke([
    ...state.messages,
    { role: "user", content: "Classify this request as 'simple' or 'complex', so that I can route it to the appropriate small or large model" }
  ]);
  
  return { next_model: response.complexity };
};

const smallModelNode = async (state) => {
  const res = await smallModel.invoke(state.messages);
  return { messages: [res] };
};

const largeModelNode = async (state) => {
  const res = await largeModel.invoke(state.messages);
  return { messages: [res] };
};

const routeToModel = (state) => {
  return state.next_model === "complex" ? "large_model" : "small_model";
};

const routeAfterModel = (state) => {
  const lastMsg = state.messages[state.messages.length - 1];
  if (lastMsg.tool_calls?.length > 0) return "tools";
  return END;
};

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec, // This brings in the 'messages' field with its reducer
  next_model: Annotation({
    reducer: (a, b) => b ?? a,
    default: () => "simple" 
  })
});

const workflow = new StateGraph(GraphAnnotation)
  .addNode("router", routerNode)
  .addNode("small_model", smallModelNode)
  .addNode("large_model", largeModelNode)
  .addNode("tools", toolNode)
  .addEdge(START, "router")
  .addConditionalEdges("router", routeToModel)
  .addConditionalEdges("small_model", routeAfterModel)
  .addConditionalEdges("large_model", routeAfterModel)
  .addEdge("tools", "router"); 

export const app = workflow.compile();