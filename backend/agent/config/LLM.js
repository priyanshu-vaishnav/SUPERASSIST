require("dotenv").config({path:"../.env"})
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");


async function LLM_MODEL(agent) {


    if(agent ==="basic") {
        console.log(
            `[System] Switching to LOCAL OLLAMA (${process.env.OLLAMA_MODEL_NAME || "gemma2"})...`,
        );
        return model = new ChatOllama({
            model: "qwen3", // Default model set kiya
            temperature: 0,
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
            streaming: false, // 👈 Ye line add karo taaki response freeze na ho
        });
    
    }
    if(agent === "extended") 
     {
        console.log("[System] Switching to CLOUD GOOGLE GEMINI...");
        return model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY, // Env variable se secure key load hogi
            model: "gemini-2.5-flash", // Default recommended model set kiya
            temperature: 0,
        });
    }

}

module.exports = LLM_MODEL