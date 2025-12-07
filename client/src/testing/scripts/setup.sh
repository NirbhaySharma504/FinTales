#!/bin/bash

# Setup script for FinTales Frontend project

# Update package list and install dependencies
echo "Updating package list..."
sudo apt-get update

echo "Installing Node.js and npm..."
sudo apt-get install -y nodejs npm

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Install additional tools if necessary
echo "Installing additional tools..."
# Add any additional tool installations here

# Setup environment variables
echo "Setting up environment variables..."
cp .env.example .env

echo "Setup complete! You can now run the project using 'npm start'."