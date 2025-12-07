#!/bin/bash

# This script deploys the FinTales frontend application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Build the application
echo "Building the application..."
bash scripts/build.sh

# Deploy the application
echo "Deploying the application..."
# Add your deployment commands here, for example:
# firebase deploy --only hosting

echo "Deployment completed successfully!"