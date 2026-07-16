const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { TavilySearch } = require("@langchain/tavily");
const LLM_MODEL = require("../../config/LLM");
const { createAgent } = require("langchain");

// ✅ Custom tool with strict schema
const searchTool = tool(
    async ({ query }) => {
        const tavily = new TavilySearch({
            apiKey: process.env.TAVILY_API_KEY,
            maxResults: 4,
            topic: "general",
            includeAnswer: true,
            searchDepth: "basic",
        });
        return await tavily.invoke({ query, max_results: 4 });
    },
    {
        name: "web_search",
        description: "Search the web for real-time information",
        schema: z.object({
            query: z.string().describe("The search query"),
        }),
    }
);

const searchAgent = async (state) => {
    const start = Date.now();

    try {
        if (!state?.prompt?.trim()) {
            return { ...state, aiResponse: "No input received." };
        }

        const query = state.prompt.trim();
        

        const llm = await LLM_MODEL("groq");
      

        const agent = createAgent({
            model: llm,
            tools: [searchTool],
        });

        const systemPrompt = `Search agent. Use web_search tool with just the query parameter. After getting results, give a concise answer (max 100 words) with real URLs. Call tool ONCE.`;

        const response = await agent.invoke(
            {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "human", content: state.prompt }
                ]
            },
            { recursionLimit: 6 }
        );

        const hadToolCall = response.messages.some(
            (msg) => msg.tool_calls && msg.tool_calls.length > 0
        );
       

        const lastMessage = response.messages[response.messages.length - 1];
        let aiResponse = typeof lastMessage.content === 'string' 
            ? lastMessage.content 
            : JSON.stringify(lastMessage.content);

        // ✅ YEH NAYA CODE HAI - Real URLs extract karo tool result se
        const toolMessage = response.messages.find(msg => msg._getType?.() === 'tool' || msg.role === 'tool');
        if (toolMessage) {
            try {
                let toolData;
                if (typeof toolMessage.content === 'string') {
                    toolData = JSON.parse(toolMessage.content);
                } else {
                    toolData = toolMessage.content;
                }
                
                if (toolData && toolData.results && toolData.results.length > 0) {
                    const sources = toolData.results.slice(0, 4).map((r, i) => 
                        `[${i + 1}] [${r.title}](${r.url})`
                    ).join('\n');
                    
                    // Sirf tab add karo jab URLs nahi hain response me
                    if (!aiResponse.includes('http') && !aiResponse.includes('](http')) {
                        aiResponse = `${aiResponse}\n\n---\n**📎 Sources:**\n${sources}`;
                    }
                }
            } catch (e) {
                // Parse error - ignore
            }
        }

        return {
            ...state,
            aiResponse: aiResponse,
            toolUsed: hadToolCall
        };

    } catch (err) {
        console.error("searchAgent error:", err.message);
        return {
            ...state,
            aiResponse: "Sorry, kuch gadbad ho gayi. Please try again."
        };
    }
};

module.exports = searchAgent;
