const app = require("express")()
const { PDFParse } = require("pdf-parse")
const multer = require('multer');
const LLM_MODEL = require("../../config/LLM");
const { embedding, cosineSimilarity } = require("../embedders/embedder");
const upload = multer({ storage: multer.memoryStorage() });



const pdfAgent = async (state) => {

    const pdfFile = state.promptWithFile;





    try {

        if (!state.prompt) {
            return {
                ...state,
                aiResponse: "No input received."
            };
        }
        if (!pdfFile || pdfFile === null || pdfFile === "") {


            return {
                ...state,
                aiResponse: "No pdf received"
            }
        }


        const fileBuffer = pdfFile.buffer;
        const parser = new PDFParse({ data: fileBuffer })
        const pdfContent = (await parser.getText()).text

        /**
         * @method: getting the extracted pdf content and splitting it into chunks by
         *filitring out the unwanted chunks like page numbers,chapter heading 
         @access: Admin

         */
        function chunkText(text, chunkSize = 800, overlap = 150) {
            const cleaned = text.replace(/\s+/g, " ").trim();
            const chunks = [];
            let start = 0;

            while (start < cleaned.length) {
                let end = start + chunkSize;

                if (end < cleaned.length) {
                    const lastSpace = cleaned.lastIndexOf(" ", end);
                    if (lastSpace > start) end = lastSpace;
                }

                const chunk = cleaned.slice(start, end).trim();
                if (chunk.length > 20) {
                    chunks.push(chunk);
                }

                start = end - overlap;
                if (start <= 0 || end >= cleaned.length) break;
            }

            return chunks;
        }

        let chunks = chunkText(pdfContent)

    


        /**Now we are using embedding to convert text into numerical vectors*/
        const chunkEmbeddings = await Promise.all(
            chunks.map(async (chunk) => ({
                text: chunk,
                embeddedChunks: await embedding(chunk)
            }))
        )
        /**Now the query user query Embedding */
        const queryEmbedding = await embedding(state.prompt)


        /**@method: finding the best chunk and best score by comaparing the vector cosine Similarites */
        let bestChunk = null
        let bestScore = -Infinity
        for (const item of chunkEmbeddings) {
            const score = cosineSimilarity(queryEmbedding, item.embeddedChunks)
            if (score > bestScore) {
                bestChunk = item.text
                bestScore = score
            }
        }

        const llm = await LLM_MODEL("extended")

        const systemPrompt = `You are a pdf Expert ,
          answer the given question which provided by the user ,
           Always give meaningful response to the user if they ask anything about the pdf
           If user wants summarize , or want his full pdf you need to provide`

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "human", content: state.prompt, pdfContent: pdfContent }
        ];
       const response = await llm.invoke(
    `BY FOLLOWING THIS STRICTLY: ${systemPrompt}, IF THE QUESTION IS ASKED THEN
ANSWER THE FOLLOWING QUESTION BY THIS CONTEXT: ${bestChunk} and the question is ${state.prompt}`
);


        return {
            ...state,
            aiResponse: response.content
        }

    } catch (err) {
   
    return {
        ...state,
        aiResponse: err?.status === 429
            ? "Too many request, try again later "
            : "Something went wrong , please refresh the page"
    }
}


}


module.exports = pdfAgent