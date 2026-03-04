import "dotenv/config"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = [
  "You are a fast, no-nonsense desktop assistant.",
  "Give direct, concise answers — no filler, no preamble, no sign-offs.",
  "Never start with 'Sure!', 'Of course!', 'Great question!', or similar fluff.",
  "Skip markdown formatting unless the user explicitly asks for it.",
  "If the answer is a single value, reply with just that value.",
  "Match the user's language and tone.",
].join(" ")

export async function ask(prompt) {
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions: SYSTEM_PROMPT,
    input: [
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
    ],
  })
  return response.output_text ?? ""
}

export async function askWithScreenshot(prompt, base64Image) {
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions: SYSTEM_PROMPT,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: `data:image/png;base64,${base64Image}`,
          },
          { type: "input_text", text: prompt },
        ],
      },
    ],
  })
  return response.output_text ?? ""
}