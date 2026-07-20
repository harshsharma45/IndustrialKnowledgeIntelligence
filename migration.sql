-- ═══════════════════════════════════════════════════════════════
-- SQL Migration Script — Aegis Industrial Knowledge Intelligence Platform
-- Target: Supabase (PostgreSQL with pgvector)
-- Team Debuggers
-- ═══════════════════════════════════════════════════════════════

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the documents table for vector semantic search
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768), -- Gemini text-embedding-004 generates 768-dimensional vectors
    chunk_index INTEGER DEFAULT 0, -- Tracks chunk position within a multi-chunk document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the maintenance_logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id VARCHAR(100) NOT NULL,
    issue TEXT NOT NULL,
    action TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'In Progress', 'Completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create an HNSW index for optimized vector search performance
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING hnsw (embedding vector_cosine_ops);

-- 5. Create a PostgreSQL function for Cosine Similarity matching
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. Seed Data — Maintenance Logs (for demo / presentation)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO maintenance_logs (equipment_id, issue, action, status) VALUES
  ('PUMP-101', 'Cavitation and mechanical seal leakage detected during routine inspection', 'Replaced mechanical seals, refilled lubricant oil, verified casing alignment.', 'Completed'),
  ('VALVE-402', 'Failed to actuate fully to closed state under normal operating pressure', 'Lubricated stem actuator, adjusted limit switches, cycled five times successfully.', 'In Progress'),
  ('COMP-703', 'High discharge temperature alarm triggered repeatedly during afternoon shift', 'Checked cooling water inlet flow, preparing to replace blocked heat exchanger bypass.', 'Pending'),
  ('GEN-501', 'Stator temperature near high limit during peak load operation', 'Cleaned air filters, adjusted cooling fan pitch, scheduling cooling system flush.', 'Pending'),
  ('HTX-204', 'Fouling detected — reduced heat transfer coefficient below threshold', 'Scheduled chemical cleaning cycle, ordered replacement gaskets for plate stack.', 'In Progress'),
  ('TRB-305', 'Bearing vibration exceeded alarm threshold on inboard side', 'Performed laser alignment check, ordered replacement bearing assembly, monitoring trend.', 'Pending');
