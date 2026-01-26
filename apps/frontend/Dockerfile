FROM node:20-alpine
WORKDIR /app
# Copy frontend package files
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./
RUN npm install
# Copy frontend source
COPY apps/frontend .
# Copy shared types
COPY packages/shared-types ../packages/shared-types
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
