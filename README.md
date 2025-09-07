# ChatApp

A minimal real-time chat app (WebSocket) with a backend (Node.js + ws + Express) and a Vite + React frontend.

## Quick overview
- Backend: `backend/server.js` — a WebSocket server that supports rooms and broadcasts user counts and chat messages.
- Frontend: `frontend/src/App.jsx` — React UI that connects to the WebSocket server and provides a simple chat UI.

## Prerequisites
- Node.js 16+ (tested with Node 22)
- npm (bundled with Node)

## Setup
1. Clone the repo (if not already):

```powershell
git clone <your-repo-url> chat
cd chat
```

2. Backend

```powershell
cd backend
npm install
# copy or create .env with at least:
# PORT=5000
# MONGO_DB=<your-mongo-uri> (optional for auth routes)
npm start
```

The backend listens on the port defined in `.env` (defaults to 5030 in code if missing).

3. Frontend

```powershell
cd ..\frontend
npm install
npm run dev
```

Open the dev server shown by Vite (usually http://localhost:5173).

## Environment variables
- `backend/.env`:
  - `PORT` — WebSocket/HTTP port (e.g. `5000`)
  - `MONGO_DB` — MongoDB connection string (optional, used by auth/db files)

Do not commit your `.env` — it's already covered by `.gitignore`.

## How it works
- Client sends `{ type: 'join', payload: { roomId } }` to join a room.
- Client sends `{ type: 'chat', payload: { roomId, message, sender } }` to broadcast a chat message.
- Server broadcasts messages of shape `{ type: 'chat', message, sender }` to other clients in the room.
- Server broadcasts `{ type: 'users', count }` to all clients in the room when users join/leave.


## Next improvements (suggested)
- Proper authentication and persistent messages (DB storage).
- TLS/wss support for secure production WebSockets.
- Message timestamps and message delivery receipts.
- Improve UI/UX, mobile polishing.

## Troubleshooting
- If `ws` import fails, run `npm install` in `backend`.
- If port conflicts occur, change `PORT` in `backend/.env`.
- Check both backend and frontend consoles for parse errors; malformed JSON from clients is ignored by the server.

---
If you want, I can also create a small `server-check` script to verify the WebSocket endpoint, or add CI (GitHub Actions) to run lint/tests before push.

## Deploying (Vercel + Fly.io)

Recommended free combo:
- Frontend: Vercel (static, free tier) — deploy the `frontend` folder.
- Backend: Fly.io (free allocation supports WebSockets) — deploy the `backend` folder as a Docker app.

Vercel (frontend)
1. Sign in to Vercel and create a new project, import your GitHub repo and select the `frontend` directory.
2. In Project Settings → Environment Variables, add `VITE_WS_URL` with the production backend URL (e.g. `wss://your-app.fly.dev`).
3. Deploy. Vercel will build the frontend and host it with TLS.

Fly.io (backend)
1. Install `flyctl` and log in: `flyctl auth login`.
2. From the `backend` directory, run `flyctl launch` and follow prompts. Use the generated Dockerfile or let Fly create one.
3. Deploy with `flyctl deploy`.
4. Fly will provide a domain like `https://your-app.fly.dev`. Use `wss://your-app.fly.dev` as `VITE_WS_URL`.

Docker (optional)
- A `backend/Dockerfile` is provided for building a container image for the backend. Use it if deploying to Fly, DigitalOcean App Platform, or other container hosts.
