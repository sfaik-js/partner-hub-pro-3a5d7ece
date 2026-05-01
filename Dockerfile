# Use Node.js LTS version based on Alpine Linux for a smaller image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and related files to install dependencies
# We use a wildcard to copy both package.json and package-lock.json if it exists
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that Vite uses (configured as 8080 in vite.config.ts)
EXPOSE 8080

# Command to run the application in development mode
# Adding --host 0.0.0.0 ensures the server is accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
