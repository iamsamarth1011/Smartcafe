# Smartcafe

Fullstack MERN QR ordering app scaffold with separate frontend and backend.

## Prerequisites

- Node.js 18+
- MongoDB connection string

## Backend (Express + MongoDB)

```bash
cd backend
npm install
```

Create or update `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongo_uri
NODE_ENV=development
```

Run the server:

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
```

Create or update `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run the app:

```bash
npm run dev
```
