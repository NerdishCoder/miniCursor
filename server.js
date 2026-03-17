import {app} from "./graph.js";
import { config } from "dotenv";
await config();

const response = await app.invoke({
  messages: [
    { 
      role: "system", 
      content: "You are a helpful agentic assistant..." 
    },
    {
      role: "user",
      content: "Create a file called hello.txt and write 'Hello, World, how are you?' only if the hello.txt doesn't already exist, and then create a file hello1.txt and write 'Hello, World!' in it."
    }
  ]
});

console.log(
  "Final Response:",
  response.messages[response.messages.length - 1].content,
);