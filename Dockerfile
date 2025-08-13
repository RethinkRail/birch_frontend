# Stage 1: Build the React app
FROM node:19-bullseye AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build


# Install `serve` and use it to serve the build
RUN npm install -g serve
EXPOSE 5000

CMD ["serve", "-s", "build", "-l", "5000"]