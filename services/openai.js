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

export async function askWithScreenshot(prompt, base64Image) {
  const response = await client.responses.create({
    model: "gpt-4o",
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