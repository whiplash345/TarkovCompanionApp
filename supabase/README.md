# Chat RAG setup

The app builds task documents from `TreeBackend.ts` and `SideTasksBackend.ts`. On the first retrieval in an app session, it sends those documents to the `tarkov-chat` Edge Function. The function hashes each document, embeds only new or changed content, and upserts it into the pgvector table. It then embeds the question and returns the nearest task nodes. The app combines those results with local NLP term matches and sends the digest, conversation history, original question, and assistant seed back to the same function for the chat completion.

## Supabase setup (Windows)

The source files in this folder are not deployed automatically. Complete these steps once for your Supabase project:

1. Create a Supabase project. In **Project Settings > API**, copy the project URL and the legacy `anon` key into the root `.env` using the names in `../.env.example`. These are public client settings. Never put the OpenAI key or service-role key in the app `.env`.
2. Install the Supabase CLI from the project root: `npm install --save-dev supabase`. This repo now has `supabase/config.toml` so the CLI can link and deploy the function.
3. Link the local project: `npx supabase login`, then `npx supabase link --project-ref YOUR_PROJECT_REF`. Find the project ref in the dashboard URL (`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`). The login step opens a browser for your Supabase account; do not paste an access token into chat.
4. Apply the vector table and search function: `npx supabase db push`. Confirm `task_documents` and `match_task_documents` exist in the Supabase database before continuing.
5. Create `supabase/.env` containing only `OPENAI_API_KEY=your_openai_key`, then upload it as an Edge Function secret with `npx supabase secrets set --env-file supabase/.env`. `.env` files are git-ignored. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted Edge Functions automatically. Never put the OpenAI or service-role key in the app's root `.env`.
6. Deploy the function: `npx supabase functions deploy tarkov-chat`.
7. Restart Expo after changing `.env` so Metro picks up the public settings. Send a chat message. The first question indexes task nodes and creates embeddings; subsequent questions only re-embed changed nodes.

If the request still fails, check the app's `ChatAssistant` console error. It now includes the HTTP status and Edge Function response body. Common meanings: `404` means the function was not deployed to the project in the app URL; `relation "task_documents" does not exist` or `match_task_documents` errors mean the migration was not applied to that same project; `OPENAI_API_KEY`/embedding errors mean the Edge Function secret is absent or invalid; `401` means the app's anon key does not match the project URL or the function JWT could not be verified.

Keep `verify_jwt = true`. The function uses a service-role database client and calls a billable OpenAI API, so it must not be deployed as an unauthenticated public function. For production, add Supabase user authentication and rate limiting before exposing this endpoint broadly.

The first question after launch indexes the current task nodes. Later questions in the same session still submit the node list, but unchanged documents are detected by content hash and do not incur another embedding request. Embeddings use `text-embedding-3-small` (1536 dimensions); answers use `gpt-4.1-mini`.