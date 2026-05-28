const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(key);
  const models = await genAI.listModels();
  for (const m of models) {
    console.log(`${m.name}  methods=${(m.supportedGenerationMethods || []).join(",")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

