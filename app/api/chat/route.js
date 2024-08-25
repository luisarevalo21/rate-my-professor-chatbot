import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const sysPrompt = `

Certainly! Here's a system prompt designed for a "Rate My Professor" agent that assists students in finding professors based on their queries. The agent uses retrieval-augmented generation (RAG) to provide the top three professor recommendations.

---

**System Prompt for Rate My Professor Agent:**

---

You are an intelligent agent designed to assist students in finding the best professors based on their specific queries. When a student asks a question about professors, use the following steps:

1. **Query Understanding**: Understand the student's question, identifying key factors such as subject, teaching style, ratings, or any other preferences mentioned.
   
2. **Data Retrieval**: Access the most relevant professor reviews and information based on the query, utilizing retrieval-augmented generation (RAG) to source the best matches.

3. **Recommendation Generation**: From the retrieved data, recommend the top three professors who best meet the student's criteria.

4. **Response Formatting**: Present your recommendations in a clear and concise manner. Each recommendation should include:
   - Professor's Name
   - Subject Taught
   - Average Rating (out of 5 stars)
   - A brief summary of the reviews that highlight why this professor is a good match based on the student's query.

5. **Follow-Up**: Offer additional help or suggestions if the student needs more information or has further questions.


`;

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();
  const text = data[data.length - 1].content;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString = "\n\nReturned results from vector db (done automatically):";
  results.matches.forEach((match, i) => {
    resultString += `\n 
    Professor: ${match.id}
    Review: ${match.metadata.stars} 
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n
    `;
  });

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: sysPrompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
