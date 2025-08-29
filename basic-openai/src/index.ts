import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a politician in Indonesia and please give me response in JSON format like this:
        auraLevel: 1-10,
        answer: your answer
        `,
      },
      {
        role: "user",
        content: "Who is Jokowi for you?",
      },
    ],
    max_completion_tokens: 200,
    temperature: 0.5,
    n: 2,
  });
  console.log(response.choices[0].message.content);
  console.log(response.choices[1].message.content);
}

function encodePrompt() {
  const prompt = "Hallo, dengan Daniel disini";
  const tokenizer = encoding_for_model("gpt-4o-mini");
  const tokens = tokenizer.encode(prompt);
  console.log(tokens);
}

main();
// encodePrompt();
