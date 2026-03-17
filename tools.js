import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";

const readFile = tool(
  async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Error reading file: ${error.message}`;
    }
  },
  {
    name: "read_file",
    description: "Read the contents of a file from the local filesystem.",
    schema: z.object({
      filePath: z.string().describe("The path to the file to read"),
    }),
  },
);

const writeFile = tool(
  async ({ filePath, content }) => {
    try {
      await fs.writeFile(filePath, content);
      return `Successfully wrote content to ${filePath}`;
    } catch (error) {
      return `Error writing file: ${error.message}`;
    }
  },
  {
    name: "write_file",
    description: "Write or overwrite content to a specific file path.",
    schema: z.object({
      filePath: z.string().describe("The path to the file to write"),
      content: z.string().describe("The text content to save in the file"),
    }),
  },
);

const listFiles = tool(async ({ directoryPath }) => {
  try {
    const files = await fs.readdir(directoryPath);
    return files.join("\n");
  } catch (error) {
    return `Error listing files: ${error.message}`;
  }
},{
  name: "list_files",
  description: "List all files in a specified directory.",
  schema: z.object({
    directoryPath: z.string().describe("The path to the directory to list files from"),
  })
});

export const tools = [readFile, writeFile, listFiles];
