require("dotenv").config({ path: "../.env" });
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");
const { ChatOpenAI } = require("@langchain/openai");

async function LLM_MODEL(agent) {
    if (agent === "basic") {
        console.log(
            `[System] Switching to LOCAL OLLAMA (${process.env.OLLAMA_MODEL_NAME || "qwen2.5:1.5b"})...`
        );
        return new ChatOllama({
            model: process.env.OLLAMA_CLOUD_MODEL || "gpt-oss:120b", // cloud-tagged model
            temperature: 0,
            baseUrl: "https://ollama.com",
            headers: {
                Authorization: `Bearer ${OLLAMA_API_KEY}`,
            },
            streaming: true,
        });
    }

    if (agent === "extended") {
        console.log("[System] Switching to CLOUD GOOGLE GEMINI...");
        return new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY, // .env se load hogi, hardcode mat karo
            model: "gemini-2.5-flash",
            temperature: 0,
            verbose: true,
        });
    }

    if (agent === "openai") {
        console.log("[System] Switching to CLOUD OPENAI...");
        return new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY, // .env se load hogi
            model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
            temperature: 0,
        });
    }

    // koi bhi agent match na ho to error throw karo, silently undefined return mat karo
    throw new Error(`Unknown agent type: ${agent}`);
}

module.exports = LLM_MODEL;