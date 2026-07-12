const LLM_MODEL = require("../config/LLM")


const routerAgent = async (state) => {

    const model = await LLM_MODEL("basic")
    const Prompt = `You are a Router Agent. Your job is to analyze the user's query and decide which specialized agent should handle it.

AVAILABLE AGENTS:
- chat   → casual conversation, greetings, general Q&A, opinions, explanations
- search → needs live/current/real-time data (news, prices, weather, "latest", facts you're unsure about)
- code   → user wants code generated/fixed/explained (HTML, CSS, JS, Python, any language)
- pdf    → user wants to create, read, or edit a PDF document
- vision → user has shared or is asking about an image

RULES:
1. If the query is casual conversation, greetings, or general questions → return "chat"
2. If the query needs live/current/real-time information → return "search"
3. If the query is about generating, fixing, or explaining code → return "code"
4. If the query is about PDF creation, reading, or editing → return "pdf"
5. If the query involves an image (uploaded or described) → return "vision"
6. If the query is ambiguous and needs clarification (e.g. "code" request missing key details like language/framework/purpose) → return "clarify" instead of an agent name, along with ONE short clarifying question.

OUTPUT FORMAT (strict — no extra text, no explanation):
Return ONLY a ONE WORD in this exact shape type :

"chat",
"agent",
"search", 
"code",
"pdf",
"vision"

Do not add any text before or after the JSON. Do not explain your reasoning.

USER PROMPT IS:${state.prompt}
AGENT MEMORY IS:${state.agentMemory}
`;


    const response = await model.invoke(Prompt)

    return {
        ...state,
        agent: response.content.trim().toLowerCase(),
        
    }



}

module.exports = routerAgent