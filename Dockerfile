# Use the official Node.js image
FROM node:19-bullseye


# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the built app using a lightweight web server (nginx or serve)
FROM nginx:alpine

# Copy the build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port that the app will run on
EXPOSE 3000

# Run the React app
# Start nginx server
CMD ["nginx", "-g", "daemon off;"]