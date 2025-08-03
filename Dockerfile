# ===================================
# =========== BUILD IMAGE ===========
# ===================================
FROM node:22-alpine AS build_image

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json ./

# Download all dependencies. Dependencies will be cached
# if the package.json files are not changed
RUN npm i

# Copy the source from the current directory to
# the Working Directory inside the container
COPY . .

# Compile the website (production build)
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ===================================
# ========== RUNTIME IMAGE ==========
# ===================================
FROM node:22-alpine

# Set the Current Working Directory inside the container
WORKDIR /app

# Adds Bash for env variable access (alpine does not ship w/ Bash)
RUN apk update && apk add bash

COPY --from=build_image /app/.next ./.next
COPY --from=build_image /app/public ./public
COPY --from=build_image /app/node_modules ./node_modules
COPY --from=build_image /app/package.json ./package.json

# Run it
CMD ["npm", "run", "start"]
