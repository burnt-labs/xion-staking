# Use a Node.js image for building the project
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the environment variables
ENV NEXT_PUBLIC_IS_DEPLOYMENT="false" \
    NEXT_PUBLIC_IS_PRO_MODE="false" \
    NEXT_PUBLIC_NETWORK_TYPE="testnet" \
    NEXT_PUBLIC_RPC_ENDPOINT="http://localhost:26657" \
    VITE_FEE_GRANTER_ADDRESS="xion1e2fuwe3uhq8zd9nkkk876nawrwdulgv460vzg7"

# Build the project
RUN npm run build

# Start the Nginx server
CMD [wrangler pages dev ".vercel/output/static" --compatibility-flag "nodejs_compat"]
