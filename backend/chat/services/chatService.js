require("dotenv").config();
// Dono model classes import kar li hain
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { AIMessage, ToolMessage } = require("@langchain/core/messages");

async function runAgent( input ) {

    console.log(input)
    let model;

    // SYSTEM LOGIC: Env variable check karke model initialize karega
    if (process.env.MODEL_MODE === "local") {
        console.log(
            `[System] Switching to LOCAL OLLAMA (${process.env.OLLAMA_MODEL_NAME || "gemma2"})...`,
        );
        model = new ChatOllama({
            model: process.env.OLLAMA_MODEL_NAME || "gemma4", // Default model set kiya
            temperature: 0,
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
            streaming: false, // 👈 Ye line add karo taaki response freeze na ho
        });
    } else {
        console.log("[System] Switching to CLOUD GOOGLE GEMINI...");
        model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY, // Env variable se secure key load hogi
            model: "gemini-2.5-flash", // Default recommended model set kiya
            temperature: 0,
            verbose:true
        });
    }




    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `YOUR ARE AI CHATBOT WITH INTERACT WITH USER FOR FORMAL MESSAGES , YOUR TASK IS TO READ THE USER INPUTS AND ANSWER
      TO IT YOU CAN ANSWER SIMPLE QUESTIONS OF A USER QUERY`,
        ],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]);
    let reply;
    let scratchpad = [];
    const maxIterations = 5;
    let iterations = 0;
    let keepRunning = true;

    try {
        const chain = prompt.pipe(model);

        while (keepRunning && iterations < maxIterations) {
            iterations++;
            console.log(
                `[Agent - Mode: ${process.env.MODEL_MODE || "cloud"}] Running iteration ${iterations}...`,
            );

            const response = await chain.invoke({
                input,

            });

            reply = response.content;
            keepRunning = false;

        }

        if (iterations >= maxIterations && keepRunning) {
            console.warn(
                `[Agent] Max iterations (${maxIterations}) reached without a clean exit.`,
            );
            reply =
                "I'm having trouble retrieving all the details right now. Could you please try again or simplify your request?";
        }
    } catch (err) {
        console.error("Execution failed:", err.stack);
        reply =
            "Something went wrong while processing your request. Please try again.";
    }

    return { type: "agent_response", reply };
}

module.exports = { runAgent };
