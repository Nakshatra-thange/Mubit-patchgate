

const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();

async function run(input, context, systemInstruction) {
  const system = [
    "You are a customer support agent for an online store.",
    systemInstruction || "",
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system,
    messages: [{ role: "user", content: input }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

module.exports = { run };