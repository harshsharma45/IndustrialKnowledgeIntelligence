import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { supabaseAdmin } from '@/lib/supabase';

// ─── Text Chunking Utility ────────────────────────────────────
// Splits large text into overlapping chunks for precise vector search.
// Each chunk is ~500 words with ~50 word overlap for context continuity.
function chunkText(
  text: string,
  maxWords = 500,
  overlapWords = 50
): string[] {
  const words = text.split(/\s+/).filter(Boolean);

  // If the text is small enough, return as a single chunk
  if (words.length <= maxWords) {
    return [words.join(' ')];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    const chunk = words.slice(start, end).join(' ');

    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }

    // If we've reached the end, stop
    if (end >= words.length) break;

    // Advance by (maxWords - overlap) to create overlapping windows
    start += maxWords - overlapWords;
  }

  return chunks;
}

// ─── POST Handler ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    let content = '';
    let metadata: Record<string, unknown> = {};

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textContent = formData.get('content') as string | null;

      if (file) {
        content = await file.text();
        metadata = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
        };
      } else if (textContent) {
        content = textContent;
        metadata = {
          source: 'Manual Form Input',
          uploadedAt: new Date().toISOString(),
        };
      }
    } else {
      // Assume application/json
      const body = await req.json();
      content = body.content || '';
      metadata = body.metadata || {};
      if (!metadata.uploadedAt) {
        metadata.uploadedAt = new Date().toISOString();
      }
    }

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'No content provided for ingestion' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Google AI API Key is missing.');
    }

    // ── Chunk the document ──
    const chunks = chunkText(content);
    const totalChunks = chunks.length;

    console.log(
      `Ingesting document: ${(metadata.fileName as string) || 'unknown'} — ${totalChunks} chunk(s)`
    );

    // ── Embed and insert each chunk ──
    const insertedIds: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];

      // Generate embedding for this chunk
      const { embedding } = await embed({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        value: chunkContent,
      });

      // Insert into Supabase with chunk metadata
      const { data, error } = await supabaseAdmin
        .from('documents')
        .insert({
          content: chunkContent,
          metadata: {
            ...metadata,
            chunkIndex: i,
            totalChunks,
          },
          embedding,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Supabase insert error for chunk ${i}:`, error);
        return NextResponse.json(
          {
            error: `Failed to save chunk ${i + 1}/${totalChunks}`,
            details: error.message,
          },
          { status: 500 }
        );
      }

      insertedIds.push(data.id);
    }

    return NextResponse.json({
      success: true,
      message: `Document ingested successfully as ${totalChunks} chunk(s)`,
      chunksCreated: totalChunks,
      documentIds: insertedIds,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Ingestion error:', message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
