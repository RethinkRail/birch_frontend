# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .

# Disable sourcemaps at BUILD time
ENV GENERATE_SOURCEMAP=false
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy only the build output
COPY --from=build /app/build ./build

EXPOSE 5000
ENV NODE_ENV=production

CMD ["serve", "-s", "build", "-l", "5000"]
