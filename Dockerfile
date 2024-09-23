# Stage 1: Build the React app
FROM node:19-bullseye AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the built React app using a lightweight web server
FROM nginx:alpine

# Copy the production build from Stage 1 to the nginx folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port that the app will run on
EXPOSE 3000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
