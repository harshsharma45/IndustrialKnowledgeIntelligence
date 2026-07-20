-- ═══════════════════════════════════════════════════════════════
-- SQL Fix Script — Update Vector Dimensions for Gemini Embedding 2
-- ═══════════════════════════════════════════════════════════════

-- 1. Drop the existing search function
DROP FUNCTION IF EXISTS match_documents;

-- 2. Update the embedding column to 3072 dimensions
ALTER TABLE documents DROP COLUMN embedding;
ALTER TABLE documents ADD COLUMN embedding VECTOR(3072);

-- 3. Recreate the search function with the updated 3072 vector size
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.embedding IS NOT NULL
    AND 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
