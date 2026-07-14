const { Annotation } = require("@langchain/langgraph")

const agentState = Annotation.Root({
    prompt: Annotation(), 
    aiResponse: Annotation(),
    agent :Annotation(),
    promptWithFile:Annotation(),
    agentMemory :Annotation()
})

module.exports = agentState