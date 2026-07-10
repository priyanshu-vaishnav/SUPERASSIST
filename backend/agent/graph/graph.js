const { StateGraph } = require("@langchain/langgraph");
const agentState = require("./state");
const routerAgent = require("./routerAgent.js");
const chatAgent = require("../service/agent/chat.agent");   // ← add
const searchAgent = require("../service/agent/search.agent");
const codingAgent = require("../service/agent/coding.agent");
const visionAgent = require("../service/agent/vision.agent");
const pdfAgent = require("../service/agent/pdf.agent");

const workflow = new StateGraph(agentState);

workflow.addNode("router", routerAgent);
workflow.addNode("chat", chatAgent);        // ← add
workflow.addNode("search", searchAgent);
workflow.addNode("code", codingAgent);
workflow.addNode("vision", visionAgent);
workflow.addNode("pdf", pdfAgent);

workflow.addEdge("__start__", "router");

workflow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "search": return "search";
      case "code":   return "code";
      case "pdf":    return "pdf";
      case "vision": return "vision";
      case "chat":   return "chat";
      default:       return "chat";
    }
  },
  {
    chat: "chat",
    search: "search",
    code: "code",
    pdf: "pdf",
    vision: "vision",
  }
);

workflow.addEdge("search", "chat");
workflow.addEdge("chat", "__end__");   // ← add, chat had no exit
workflow.addEdge("code", "__end__");
workflow.addEdge("pdf", "__end__");
workflow.addEdge("vision", "__end__");

const graph = workflow.compile();

module.exports = graph;