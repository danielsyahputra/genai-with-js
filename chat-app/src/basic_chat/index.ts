import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
const MAX_TOKENS = 700;

const tokenizer = encoding_for_model("gpt-4o-mini");

const context: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot",
  },
];

async function createChatCompletions(messages: ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });
  const responseMessage = response.choices[0].message;
  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    deleteOlderMessages();
  }
  messages.push({
    role: "assistant",
    content: responseMessage.content,
  });
  console.log(`${responseMessage.role}: ${responseMessage.content}`);
}

function deleteOlderMessages() {
  let contextLength = getContextLength();
  while (contextLength > MAX_TOKENS) {
    context.splice(1, 1);
    contextLength = getContextLength();
    console.log("New context length: " + contextLength);
  }
}

function getContextLength() {
  let length = 0;
  context.forEach((message) => {
    if (typeof message.content == "string") {
      length += tokenizer.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach((c) => {
        if (c.type == "text") {
          length += tokenizer.encode(c.text).length;
        }
      });
    }
  });
  return length;
}

process.stdin.addListener("data", async function (input) {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });
  await createChatCompletions(context);
});
