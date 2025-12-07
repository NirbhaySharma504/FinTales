#!/bin/bash

# Build the application for production
echo "Building the application..."

# Install dependencies
npm install

# Build the project
npm run build

echo "Build completed successfully!"