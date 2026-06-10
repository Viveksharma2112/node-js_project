# Leaderborad — Architecture & Workflow

This document explains the project structure, which files are responsible for what, how data flows through the system, authentication, common troubleshooting, and how to run the project locally.

## Overview
- Backend: an Express + Mongoose API that stores users and scores in MongoDB.
- Frontend: a Vite + React app that shows a leaderboard, allows authenticated users to submit and delete scores.

## Key folders and files
- [backend/server.js](backend/server.js)
  - App entry for the API. Loads environment variables from `backend/.env`, mounts routes, and starts an HTTP server on `process.env.PORT || 5000`.
  - Adds a small root health route `GET /`.

- [backend/package.json](backend/package.json)
  - Backend dependencies and a `start` script (`node server.js`).

- [backend/.env](backend/.env)
  - Stores `MONGODB_URI`, `PORT`, `JWT_SECRET`. Example:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/leaderboard
    JWT_SECRET=your_jwt_secret_here
    ```

- [backend/routes/leaderboard.js](backend/routes/leaderboard.js)
  - GET `/api/leaderboard/top`: returns top scores (populated `user.username`).
  - POST `/api/leaderboard/submit`: submit a score (requires auth middleware).
  - DELETE `/api/leaderboard/:id`: delete a score (owner-only).

- [backend/routes/auth.js](backend/routes/auth.js)
  - (Handles user registration/login and token issuance. The frontend uses these endpoints to get a JWT stored in localStorage.)

- [backend/middleware/auth.js](backend/middleware/auth.js)
  - Reads `x-auth-token` header, verifies JWT using `JWT_SECRET`, and attaches `req.user`.

- [backend/models/Score.js](backend/models/Score.js)
  - Mongoose schema: `{ user: ObjectId(ref 'User'), score: Number, game: String, createdAt: Date }`.

- [backend/models/User.js](backend/models/User.js)
  - User schema with `username`, `email`, `password`, `createdAt`.

- [frontend/package.json](frontend/package.json)
  - Frontend dependencies (React, Vite, plugin, dev tools). Dev server: `npm run dev` (Vite).

- [frontend/src/main.jsx](frontend/src/main.jsx)
  - React entry point. Renders `<App />` into `#root`.

- [frontend/src/pages/Leaderboard.jsx](frontend/src/pages/Leaderboard.jsx)
  - Fetches `GET /api/leaderboard/top` and renders the table.
  - If a token exists in `localStorage.token`, shows a "Submit Score" form and allows score submission via POST `/api/leaderboard/submit` with header `x-auth-token`.
  - Shows a `Delete` button beside rows owned by the current user. The delete flow decodes the JWT payload client-side to determine current user id, and calls `DELETE /api/leaderboard/:id` with `x-auth-token`.

- [frontend/src/pages/Leaderboard.css](frontend/src/pages/Leaderboard.css)
  - Styles for leaderboard layout and the delete button.

## Data flow (end-to-end)
1. Registration/Login (frontend) -> POST to backend auth route -> backend creates user and returns JWT.
2. Frontend stores JWT in `localStorage.token`.
3. Frontend requests leaderboard: `GET /api/leaderboard/top` -> backend reads `Score` collection, populates `user.username`, sorts by `score` desc and returns top N.
4. Submitting a score: frontend POST `/api/leaderboard/submit` with headers: `Content-Type: application/json` and `x-auth-token: <token>`. Backend `auth` middleware verifies token and sets `req.user`. Backend creates a `Score` document with `user: req.user.id`.
5. Deleting a score: frontend calls `DELETE /api/leaderboard/:id` with `x-auth-token`. Backend checks that `score.user.toString() === req.user.id` then removes the document.
6. Data is persisted in MongoDB (configured by `MONGODB_URI`).

## Authentication details
- JWT token is issued by the backend auth routes and signed with `JWT_SECRET` (see `backend/.env`).
- Frontend places the token in `localStorage` under `token` or uses `localStorage.getItem('token')` in `Leaderboard.jsx`.
- auth middleware expects the header `x-auth-token`.
- Frontend decodes the token client-side (unsafe for trust — only used to show/hide UI elements). Real authorization checks are done server-side via middleware.

## How to run locally
1. Ensure Node.js (recommended stable LTS or >= 20.x/22.12+) is installed.
2. Start MongoDB (local or use Atlas) and set `backend/.env` `MONGODB_URI` accordingly.

From repo root:

```powershell
# install
npm --prefix .\backend install
npm --prefix .\frontend install --legacy-peer-deps

# start backend (API)
npm --prefix .\backend start
# or: node backend/server.js

# start frontend (dev server)
npm --prefix .\frontend run dev
# open the Vite URL printed (http://localhost:5173/ by default)
```

## Common issues & troubleshooting
- "Cannot GET /": backend did not have a root route; this repository now includes a simple `GET /` health endpoint in `backend/server.js`.
- Vite native binding / Node engine errors (when using Vite v8 and newer Node): If you see rolldown native binding errors, either upgrade Node to a compatible version (22.12+ or 20.19+), or downgrade Vite to v4 (this repo already includes a Vite v4 fallback) and run install with `--legacy-peer-deps` if needed.
- Port conflicts: Vite defaults to 5173; if occupied Vite will pick the next free port (e.g., 5174).
- MongoDB connection errors: ensure `MONGODB_URI` is set in `backend/.env`. The server will run without DB, but many routes will be limited.

## Notes for contributors
- Add new API endpoints under `backend/routes/` and mount them in `server.js`.
- Add new models to `backend/models/` and use Mongoose.
- For client-side protected actions, always send `x-auth-token` header; do not rely solely on client-side decoded tokens for authorization decisions.

---

File references:
- Backend entry: [backend/server.js](backend/server.js)
- Leaderboard routes: [backend/routes/leaderboard.js](backend/routes/leaderboard.js)
- Client leaderboard page: [frontend/src/pages/Leaderboard.jsx](frontend/src/pages/Leaderboard.jsx)

If you want, I can expand this into a more formal README, add sequence diagrams, or link to specific line numbers for complex functions.