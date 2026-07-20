import { google } from '@ai-sdk/google';
import { streamText, tool, embed, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

// Allow longer execution for RAG queries that involve embedding + DB lookup + LLM generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Google AI API Key is missing.');
      return new Response(
        JSON.stringify({
          error:
            'Google AI API key is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local.',
        }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const coreMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-3.5-flash'),
      messages: coreMessages,
      system: `You are an Expert Industrial Knowledge Copilot for Team Debuggers.
Your job is to assist operators and maintenance teams by answering queries based on standard operating procedures (SOPs), safety procedures, P&IDs, and maintenance logs.
Always run the search tool 'search_industrial_knowledge' when asked about specific equipment, issues, guidelines, safety rules, or industrial protocols to see if there is matching information in the database.
You must cite your sources accurately. When utilizing information retrieved from a document, suffix or prefix the statement with the document's name (e.g., "[Lockout_Tagout_SOP.txt]") or other metadata available.
If the information is not present in the retrieved database, clearly tell the user that the information was not found in the custom knowledge base. If you then offer a general advice based on your general knowledge, clearly demarcate it by saying "General Industrial Knowledge (Not in DB):".`,
      tools: {
        search_industrial_knowledge: tool({
          description:
            'Search the industrial knowledge base (including safety SOPs, manuals, P&IDs, and logs) for relevant procedures and information using semantic similarity.',
          inputSchema: z.object({
            query: z
              .string()
              .describe(
                'The semantic search query, e.g., "what is the safety procedure for pump maintenance" or "lockout tagout specifications"'
              ),
            matchThreshold: z
              .number()
              .optional()
              .default(0.4)
              .describe(
                'Cosine similarity match threshold between 0 and 1 (default: 0.4)'
              ),
            matchCount: z
              .number()
              .optional()
              .default(4)
              .describe(
                'Maximum number of matching documents to retrieve (default: 4)'
              ),
          }),
          execute: async ({ query, matchThreshold, matchCount }) => {
            console.log(`Executing semantic search for query: "${query}"`);

            // 1. Generate the query embedding using text-embedding-004
            const { embedding } = await embed({
              model: google.textEmbeddingModel('gemini-embedding-2'),
              value: query,
            });

            // 2. Query the match_documents PostgreSQL RPC function
            const { data, error } = await supabaseAdmin.rpc(
              'match_documents',
              {
                query_embedding: embedding,
                match_threshold: matchThreshold,
                match_count: matchCount,
              }
            );

            if (error) {
              console.error(
                'Supabase RPC match_documents failed:',
                error
              );
              throw new Error(
                `Database vector search failed: ${error.message}`
              );
            }

            console.log(
              `Retrieved ${data?.length || 0} matching documents.`
            );
            return data;
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Chat endpoint error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
