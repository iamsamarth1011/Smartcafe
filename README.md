# Smartcafe — QR Ordering Platform
Full‑stack MERN app for QR-based ordering, kitchen display, and billing.

## Tech Stack
- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Tailwind CSS
- Socket.io

## Folder Structure
```
Smartcafe/
├─ backend/
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ seedMenu.js
│  ├─ seedTables.js
│  └─ server.js
└─ frontend/
   ├─ src/
   │  ├─ components/
   │  ├─ context/
   │  ├─ pages/
   │  ├─ hooks/
   │  └─ utils/
   └─ index.html
```

## Prerequisites
- Node.js 18+
- MongoDB connection string

## Setup
1. **Clone the repo**
```
git clone <your-repo-url>
cd Smartcafe
```

2. **Install backend dependencies**
```
cd backend
npm install
```

3. **Backend environment**
Create `backend/.env`:
```
PORT=5000
MONGO_URI=your_mongo_uri
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. **Install frontend dependencies**
```
cd ../frontend
npm install
```

5. **Frontend environment**
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RESTAURANT_NAME=The Golden Fork
VITE_TABLE_COUNT=10
```

6. **Seed the database**
```
cd ../backend
node seedMenu.js
node seedTables.js
```

7. **Run backend**
```
npm run dev
```

8. **Run frontend**
```
cd ../frontend
npm run dev
```

## Pages & Routes
| URL | Page | Audience |
| --- | --- | --- |
| `/` | Staff Panel | Staff |
| `/kitchen` | Kitchen Display | Staff |
| `/billing` | Billing Counter | Staff |
| `/qr` | QR Codes | Staff |
| `/menu?table=1` | Customer Menu | Customers |
| `/order-status?table=1&orderId=<ORDER_ID>` | Order Status | Customers |

## Environment Variables
### Backend
| Variable | Purpose |
| --- | --- |
| `PORT` | API server port |
| `MONGO_URI` | MongoDB connection string |
| `NODE_ENV` | Environment mode |
| `CLIENT_URL` | Frontend URL for CORS + sockets |

### Frontend
| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base API URL |
| `VITE_SOCKET_URL` | Socket.io server URL |
| `VITE_RESTAURANT_NAME` | Restaurant branding text |
| `VITE_TABLE_COUNT` | Number of tables to display |

## Local Network Usage
To test QR scanning on a phone:
1. Find your computer’s LAN IP (e.g., `192.168.1.20`).
2. Update these values:
   - `CLIENT_URL=http://192.168.1.20:5173`
   - `VITE_API_URL=http://192.168.1.20:5000/api`
   - `VITE_SOCKET_URL=http://192.168.1.20:5000`
3. Restart both servers and reprint the QR codes from `/qr`.
