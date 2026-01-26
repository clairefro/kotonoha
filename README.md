# notanda2 Monorepo

- Backend: Node.js, TypeScript, Express, Sqlite (with option to use Turso DaaS)
- Frontend: React, TypeScript, Vite
- Shared: TypeScript types
- Orchestrated with Docker Compose

## Getting Started

### Development

1. Install dependencies for all workspaces:

   ```sh
   npm install
   ```

2. Start the backend (dev mode, uses ./dev-db.sqlite):

   ```sh
   npm run dev:backend
   ```

3. Start the frontend (dev mode, uses Vite):

   ```sh
   npm run dev:frontend
   ```

4. Access the frontend at http://localhost:3000 and the backend API at http://localhost:4000 (dev) or http://localhost:4001 (prod).

5. Database management (from root):
   - Inspect prod (local) DB: `npm run db:inspect` (opens SQLite shell for apps/backend/db.sqlite)
   - Inspect dev DB: `npm run db:dev:inspect` (opens SQLite shell for apps/backend/dev-db.sqlite)
   - Seed dev DB: `npm run db:dev:seed` (runs seed script in apps/backend/db-scripts)
   - Clear dev DB: `npm run db:dev:clear` (runs clear script in apps/backend/db-scripts)

- if using Turso for prod DB, use their UI or tools to inspect db

### Production

Before running in production (Docker), you must configure environment variables for the backend and frontend. Copy the example file and edit as needed:

```sh
cp .env.example .env
# Edit .env to set your production values (e.g., TURSO_DB_URL, TURSO_DB_AUTH_TOKEN, PORT, etc.)
```

Key variables:

- `TURSO_DB_URL` and `TURSO_DB_AUTH_TOKEN`: (Optional if you want remote DB) Set these to use Turso (libSQL) as your production database. If not set, the backend will use local SQLite.
- `PORT`: (optional) Set the backend port (defaults to 4001 in production).

Make sure your `.env` file is present at the project root before starting Docker Compose.

### Production (Docker)

1. Build and start all services with Docker Compose:

   ```sh
   npm run docker:up:prod
   ```

2. Stop all services:

   ```sh
   npm run docker:down
   ```

3. The backend will run on port 4001 by default in production mode, unless PORT is specified in environment.

See each app's README for more details and advanced configuration.

## Architecture

This project uses a monorepo structure managed by npm workspaces. The main components are:

- **apps/backend**: Node.js + TypeScript + Express API server. Handles all backend logic, database access, and exposes REST endpoints. Supports both local SQLite and Turso (libSQL) databases - uses local Sqlite unless Turso credentials are provided in environment. Contains scripts for database management and schema handling.
- **apps/frontend**: React + TypeScript + Vite web application. Consumes the backend API and provides the user interface.
- **packages/shared-types**: Shared TypeScript types used by both backend and frontend to ensure type safety and reduce duplication.
- **db-scripts** (inside backend): Contains scripts for seeding, clearing, and managing the development database.

All workspaces are orchestrated using npm scripts and Docker Compose for easy development and production workflows. Shared types are imported directly from the shared package, ensuring consistency across the stack.

The root `package.json` manages scripts for starting, building, and managing both apps, as well as database utilities.

## Encrypting the database

The default sqlite setup does not use encryption, meaning data is readable on filesystem. If you'd like to encrypt with SQLCipher, add an `encryptionKey` prop to the db `createClient()` args

```js
const dbEncryptionKey = process.env.DB_ENCRYPTION_KEY;

const db = createClient({
  url: tursoUrl || `file:${localDbPath}`,
  authToken: tursoUrl ? tursoAuthToken : undefined,
  encryptionKey: !tursoUrl && dbEencryptionKey ? encryptionKey : undefined,
});
```

Note: inspecting an encrypted sqlite db requires the SQLCipher CLI.

1. Install SQLCipher (brew install sqlcipher on macOS).
2. Open the DB with SQLCipher: `sqlcipher apps/backend/dev-db.sqlite`
3. Enter the key: `PRAGMA key = 'your_encryption_key';`

Consider updating package.json scripts accordingly.
