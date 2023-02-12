# ==== CONFIGURE =====
# Use a Node 16 base image
FROM node:13.12.0-alpine

# Set the working directory to /app inside the container
WORKDIR /app
# Copy app files

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
# ==== BUILD =====
# Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
RUN npm install 

EXPOSE 3000
# Start the app
CMD [ "npm", "start" ]