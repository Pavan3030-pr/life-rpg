# Life RPG

Life RPG turns ordinary productivity into a tactile role-playing loop: quests, XP, level progression, streaks, attributes, gold, shop rewards, and inventory persistence.

## Hackathon Architecture

- Frontend: React, Vite, Tailwind CSS, Supabase auth client, responsive RPG dashboard.
- Backend: Express API with authenticated server-side quest completion and purchase routes.
- Database/Auth: Supabase tables and RPC functions for profiles, quests, shop items, inventory, XP, gold, and user isolation.
- AI layer: Local Ollama quest generation using `qwen2.5-coder:7b`, with timeout-safe fallback quests so the UI never freezes.

## Local Setup

Create the root `.env` file:

```env
OLLAMA_MODEL=qwen2.5-coder:7b
OLLAMA_HOST=http://localhost:11434
```

Create `backend/.env` from `backend/.env.example` and `frontend/.env.local` from `frontend/.env.example`, then add your Supabase values.

Start Ollama:

```bash
ollama serve
ollama pull qwen2.5-coder:7b
```

Run the API:

```bash
cd backend
npm install
npm run dev
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Submission Checklist

- Public GitHub repository with frontend and backend source.
- Environment templates committed, secrets excluded.
- Supabase persistence for users, quests, profiles, shop rewards, and inventory.
- Screen recording showing login, quest creation, completion, level progression, and refresh persistence.
- Deployment URL for both frontend and backend configuration.
