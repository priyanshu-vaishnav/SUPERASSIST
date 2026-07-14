const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

async function embedding(chunks) {
    const ai = new GoogleGenerativeAIEmbeddings({ 
        apiKey: process.env.GOOGLE_API_KEY,
        // 1. Model ka naam explicitly dena zaroori hai taaki 404 error na aaye
        model: "gemini-embedding-001",
       
    });
    
    const response = await ai.embedQuery(chunks);
    return response;
}

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0; // Dono mein se ek vector zero ho toh 0 return karein

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { embedding, cosineSimilarity };