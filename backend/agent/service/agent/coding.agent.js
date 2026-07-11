const LLM_MODEL = require("../../config/LLM")
const graph = require("../../graph/graph")


const codingAgent = async (state) => {
    if (state.prompt === undefined || state.prompt === null || state.prompt === "") {
        return {
            ...state,
            aiResponse: "no prompt from user"
        }
    }
    try {
        const llm = await LLM_MODEL("basic")
        const systemPrompt = "You are an Coding Expert , Help user by Understading theri prompt and give'em code or whatever the user wants"
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "human", content: state.prompt }
        ];

        const response = await llm.invoke(messages)

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

}

module.exports = codingAgent