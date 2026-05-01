const { OpenAI } = require("openai");

function getClient() {
  return new OpenAI({ apiKey: undefined }); // This throws synchronously
}

async function llm() {
  const client = getClient();
  console.log("Got client");
}

async function analyseResume() {
  try {
    await llm();
    console.log("Success");
  } catch (e) {
    console.log("Caught:", e.message);
  }
}

analyseResume();
