# Taste of Wine

MERN monorepo (npm workspaces).

```
client/                 React + Vite (port 5173, proxies /api to the server)
  index.html
  vite.config.js
  src/
    components/
    context/
    hooks/
    pages/
    services/
    App.jsx
    main.jsx
server/                 Express + Mongoose (port 5000)
  src/
    config/db.js
    controllers/
    middleware/
    models/
    routes/
    utils/
    app.js
    index.js
```

## Setup

```bash
npm install
cp server/.env.example server/.env   # then fill in MONGO_URI and JWT_SECRET
npm run dev                          # runs server and client together
```

## Scripts

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Server (nodemon) + client (Vite) |
| `npm run build` | Production build of the client   |
| `npm start`     | Start the server                 |
