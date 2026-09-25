create extension if not exists vector with schema extensions;

create table if not exists public.task_documents (
  id text primary key,
  source text not null check (source in ('main-task', 'side-task')),
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text not null,
  embedding extensions.vector(1536) not null,
  updated_at timestamptz not null default now()
);

create index if not exists task_documents_embedding_idx
  on public.task_documents using hnsw (embedding extensions.vector_cosine_ops);

alter table public.task_documents enable row level security;
revoke all on public.task_documents from anon, authenticated;

create or replace function public.match_task_documents(
  query_embedding extensions.vector(1536),
  match_count integer default 6
)
returns table (
  id text,
  source text,
  title text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    task_documents.id,
    task_documents.source,
    task_documents.title,
    task_documents.content,
    task_documents.metadata,
    1 - (task_documents.embedding <=> query_embedding) as similarity
  from public.task_documents
  order by task_documents.embedding <=> query_embedding
  limit greatest(1, least(match_count, 12));
$$;

revoke all on function public.match_task_documents(extensions.vector, integer) from public, anon, authenticated;
grant execute on function public.match_task_documents(extensions.vector, integer) to service_role;