const LLM_MODEL = require("../../config/LLM");

const chatAgent = async (state) => {
    try {
        if (!state.prompt) {
            return {
                ...state,
                aiResponse: "No input received."
            };
        }

        const llm = await LLM_MODEL("basic");

        const systemPrompt = "You are a helpful AI assistant. Respond clearly and concisely, matching the user's tone and language (Hindi/English mix if they use it).";

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "human", content: state.prompt }
        ];

        const response = await llm.invoke(messages);

        return {
            ...state,
            aiResponse: response.content
        };
    } catch (err) {
        console.error("chatAgent error:", err);
        return {
            ...state,
            aiResponse: "Sorry, kuch gadbad ho gayi. Please try again."
        };
    }
};

module.exports = chatAgent;