import "dotenv/config"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ask(prompt) {
  const response = await client.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
      
    ],
  })
  return response.output_text ?? ""
}