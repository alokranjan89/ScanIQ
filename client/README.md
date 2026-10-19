# ScanIQ Client

React, TypeScript, and Vite frontend for ScanIQ.

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The client runs at `http://localhost:5173`. It expects the API at
`http://localhost:5000/api/v1` by default. To use another API URL, create a
`.env` file in this directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

See the [project README](../README.md) for backend, database, and Redis setup.

## Checks

```bash
npm run build
npm run lint
```
