# Use the official Node.js image
FROM node:19-bullseye


# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use an nginx web server to serve the built app
FROM nginx:alpine

# Copy the build output from the previous stage to the nginx html directory
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 5060

# Start the nginx web server
CMD ["nginx", "-g", "daemon off;"]