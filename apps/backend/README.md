# Backend (Node.js/Express/TypeScript)

- Run `npm install` in this directory.
- Use `npm run dev` for development (requires ts-node-dev).
- Use `npm run build` then `npm start` for production.
- The database file is `db.sqlite` (SQLCipher-compatible, see Dockerfile for setup).
- API runs on port 4000.

# Docker

- Build: `docker build -t notanda2-backend .`
- Run: `docker run -p 4000:4000 notanda2-backend`

# SQLCipher

- The current setup uses `sqlite3` for demonstration. To use SQLCipher, install the `sqlite3` package with SQLCipher support or use a compatible image.
