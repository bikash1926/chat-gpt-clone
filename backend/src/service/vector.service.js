const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY});
const chatgptIndex = pc.index("chat-gpt");

// Save a message embedding in Pinecone
async function createMemory({ vector, metadata, messageId }) {
  try {
       await chatgptIndex.upsert([
      {
        id: messageId,
        values: vector,
        metadata,
      },
    ]);
    console.log("✅ Vector stored successfully in Pinecone");
  } catch (err) {
    console.error("❌ Pinecone upsert error:", err);
  }
}

// Query similar memories
async function queryMemory({ queryVector, limit = 5, metadata }) {

    const data = await chatgptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches

}

module.exports = { createMemory, queryMemory };
