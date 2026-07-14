require("dotenv").config({ path: "../.env" });
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");
const { ChatOpenAI } = require("@langchain/openai");
const { ChatGroq } = require("@langchain/groq")

async function LLM_MODEL(agent) {

    if (agent === "groq") {
         console.log(
            `[System] Switching to Groq `
        );
        return new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant", // ⚡ FASTEST
            temperature: 0.2,
            maxTokens: 600,
        });
    }
    if (agent === "basic") {
        console.log(
            `[System] Switching to LOCAL OLLAMA (${process.env.OLLAMA_MODEL_NAME || "qwen2.5:1.5b"})...`
        );
        return new ChatOllama({
            model: process.env.OLLAMA_CLOUD_MODEL || "gpt-oss:120b", // cloud-tagged model
            temperature: 0,
            baseUrl: "https://ollama.com",
            headers: {
                Authorization: `Bearer 158b179c06c543e38e565ae8f1e766b3.pTcBdfMtKuqP_fxYGH7t6dOt`,
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