# Stage 1: Build the React app
FROM node:19-bullseye AS build

WORKDIR /app

COPY package*.json ./
# Use retry logic to reduce issues with transient 503 errors
RUN npm install --force || npm install --force

COPY . .
RUN npm run build

# Stage 2: Serve the built app using Nginx
FROM nginx:alpine

# Remove the default config (to prevent conflicts)
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app to Nginx's HTML directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
