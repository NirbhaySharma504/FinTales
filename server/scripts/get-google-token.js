const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.FIREBASE_API_KEY;

/**
 * NOTE: This script is for demonstration purposes only.
 * In a real application, users would authenticate with Google via a web interface
 * or mobile app using Firebase SDK, not through this direct API call.
 * 
 * For Postman testing, you'll need to get an actual Google OAuth token separately
 * and then exchange it with Firebase for an ID token.
 */
async function exchangeGoogleToken(googleToken) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${API_KEY}`,
      {
        postBody: `id_token=${googleToken}&providerId=google.com`,
        requestUri: "http://localhost:5000",
        returnSecureToken: true,
        returnIdpCredential: true
      }
    );

    console.log('Authentication successful!');
    console.log('Firebase ID Token:', response.data.idToken);
    console.log('\nCopy this token and use it in your Postman requests as:');
    console.log('Authorization: Bearer YOUR_ID_TOKEN');
    
    return response.data;
  } catch (error) {
    console.error('Error exchanging Google token:', error.response?.data || error.message);
  }
}

/**
 * For testing in Postman, you'll need to:
 * 1. Sign in to Google in your browser
 * 2. Use Google's OAuth Playground to get a token
 * 3. Use this script to exchange it for a Firebase token
 */

// Usage: node get-google-token.js GOOGLE_TOKEN_HERE
const googleToken = process.argv[2];

if (!googleToken) {
  console.log('Please provide a Google token as an argument.');
  process.exit(1);
}

exchangeGoogleToken(googleToken);