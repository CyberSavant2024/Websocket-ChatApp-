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

## Git push (simple)
If you haven't set a remote yet:

```powershell
git remote add origin git@github.com:<your-username>/<repo>.git
git branch -M main
git push -u origin main
```

If the repo is already initialized and you only want to commit current changes:

```powershell
cd chat
git add -A
git commit -m "Prepare repo: add README and polish UI"
git push
```

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
