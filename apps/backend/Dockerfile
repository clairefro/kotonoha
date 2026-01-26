FROM node:20-alpine
WORKDIR /app
# Copy backend package files
COPY apps/backend/package.json apps/backend/package-lock.json* ./
RUN npm install
# Copy backend source
COPY apps/backend .
# Copy shared types
COPY packages/shared-types ../packages/shared-types
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
