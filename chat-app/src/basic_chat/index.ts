import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { encoding_for_model } from "tiktoken";

import { reserveFlight, getAvailableFlights } from "../tools";

const openai = new OpenAI();
const MAX_TOKENS = 4096;

const tokenizer = encoding_for_model("gpt-4o-mini");

const context: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot",
  },
];

async function createChatCompletions(messages: ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    temperature: 0.0,
    tools: [
      {
        type: "function",
        function: {
          name: "getAvailableFlights",
          description:
            "Return the available flights for a given departure and destination",
          parameters: {
            type: "object",
            properties: {
              departure: {
                type: "string",
                description: "The departure airport code",
              },
              destination: {
                type: "string",
                description: "The destination airport code",
              },
            },
            required: ["departure", "destination"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "reserveFlight",
          description: "Make a reservation for a given flight number",
          parameters: {
            type: "object",
            properties: {
              flightNumber: {
                type: "string",
                description: "The flight number to reserve",
              },
            },
            required: ["flightNumber"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    deleteOlderMessages();
  }
  const willInvokeFunctions = response.choices[0].finish_reason == "tool_calls";
  if (willInvokeFunctions) {
    const toolCall = response.choices[0].message.tool_calls![0];
    if (toolCall.type === "function") {
      const functionName = toolCall.function.name;
      const rawArguments = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArguments);

      if (functionName === "getAvailableFlights") {
        const flights = getAvailableFlights(
          parsedArguments.departure,
          parsedArguments.destination,
        );

        messages.push(response.choices[0].message);

        messages.push({
          role: "tool",
          content: flights.toString(),
          tool_call_id: toolCall.id,
        });
      }

      if (functionName === "reserveFlight") {
        const reservationNumber = reserveFlight(parsedArguments.flightNumber);

        messages.push(response.choices[0].message);

        messages.push({
          role: "tool",
          content: reservationNumber,
          tool_call_id: toolCall.id,
        });
      }
    } else {
      console.warn("Tool call type is not 'function':", toolCall.type);
    }
  }

  const secondCallResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });
  console.log("Assistant: " + secondCallResponse.choices[0].message.content);
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
