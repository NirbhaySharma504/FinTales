# FinTales: AI and Web3 powered Personalized Financial Learning

FinTales is an engaging, gamified learning platform aimed at solving the growing crisis of financial illiteracy among teenagers in India. By combining storytelling, interactivity, AI-driven personalization, and blockchain-backed rewards, FinTales makes financial education fun, effective, and accessible.
It transforms dry financial concepts into interactive, personalized narratives inspired by the user’s interests—whether it’s anime, music, sci-fi, superheroes, or pop culture.


## 🚨 Problem

•⁠  ⁠*84%* of Indian teens lack basic financial knowledge (IBS 2022).
•⁠  ⁠Only *14%* of urban students are exposed to financial programs (RBI 2023).
•⁠  ⁠Less than *5%* of 250 million school children receive proper financial education.

Consequences include:
•⁠  ⁠Risk of online scams
•⁠  ⁠Poor saving and budgeting habits
•⁠  ⁠Lack of investment and debt knowledge
•⁠  ⁠Impulsive spending and digital payment ignorance

## 🎯 What FinTales Solves

•⁠  ⁠*Lack of Engagement*: Traditional methods are outdated and boring.
•⁠  ⁠*Limited Access*: Educational resources are not widely available.
•⁠  ⁠*Complex Concepts*: Financial jargon overwhelms young learners.

## 🌟 Features

•⁠  ⁠🎮 *Gamified Learning*: Earn XP, level up, and unlock NFT rewards.
•⁠  ⁠🤖 *AI-Powered Storytelling*: Personalized financial stories using LLMs.
•⁠  ⁠🎨 *Personalization Engine*: Tailored lessons based on interests and spending habits.
•⁠  ⁠🧠 *Interactive Content*: Engaging quizzes and challenges.
•⁠  ⁠🪙 *NFT Rewards*: Proof of progress on the blockchain with Verbwire & MetaMask integration.

## 🛠 Tech Stack

### Frontend
•⁠  ⁠React + TypeScript
•⁠  ⁠SCSS, Framer Motion
•⁠  ⁠Vite

### Backend
•⁠  ⁠Node.js + Express
•⁠  ⁠NFT Minting with Verbwire
•⁠  ⁠Web3 integration via MetaMask

### Database & Auth
•⁠  ⁠MongoDB (User Data)
•⁠  ⁠Firebase (Authentication)

### AI Tools
•⁠  ⁠Google Gemini API (Content + Image generation)
•⁠  ⁠Pydantic (Validation)
•⁠  ⁠Cloudinary (Visual asset caching)

## 🗺 Architecture & Workflow

•⁠  ⁠Modular architecture with clear separation between frontend, backend, and AI modules.
•⁠  ⁠NFT generation and transaction tracking integrated into the learning flow.
•⁠  ⁠Deployed frontend on *Vercel* and backend on *Railway*.
•⁠  ⁠Future deployment scaling via *Docker* containers and *AWS* cloud hosting.





## Local Development Setup

To run the *FinTales* project locally, follow these steps:

### 1. *Clone the Repository*

⁠ bash
git clone https://github.com/NirbhaySharma504/FinTales
cd FinTales
 ⁠

---

### 2. *Start the Frontend (React + Vite)*

The frontend is built using React, TypeScript, SCSS, and Vite.

⁠ bash
cd client
npm install
npm run dev
 ⁠

This will start the frontend server.

---

### 3. *Start the Backend (Node.js + Express + MongoDB)*

The backend handles user preferences, authentication, and NFT minting.

⁠ bash
cd server
npm install
npm start
 ⁠

•⁠  ⁠Ensure that *MongoDB* is running and the connection URI is correctly configured in your ⁠ .env ⁠ file.
•⁠  ⁠Firebase Authentication should also be set up and linked via environment variables or service keys.

---

### 4. *Run the GenAI Server (Python)*

The AI-driven story, quiz, and summary generation logic lives in a separate Python server.

⁠ bash
cd server/GenAI
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python web_server.py
 ⁠

This starts the Python server for handling novel, quiz, and summary generation requests. Ensure your backend is configured to communicate with this service.

---



## 📈 Future Enhancements

1.⁠ ⁠*AI Narrated Audiobooks*: Accessibility for auditory learners.
2.⁠ ⁠*Dynamic NFT Generation*: Personalized NFTs based on user interests.
3.⁠ ⁠*NFT Marketplace*: Trade and showcase earned assets.
4.⁠ ⁠*RAG Chatbot*: Retrieval-augmented financial chatbot powered by curated data.

## 🚀 Deployment

•⁠  ⁠*Frontend*: Hosted on Vercel
•⁠  ⁠*Backend*: Deployed using Railway
•⁠  ⁠*Planned Scaling*:
  - Docker for containerization
  - AWS for production deployment

## 📚 References

•⁠  ⁠PISA 2018 Report
•⁠  ⁠IBS Intelligence Survey (2022)
•⁠  ⁠RBI Financial Inclusion Report (2023)
•⁠  ⁠IME Survey on Financial Literacy
•⁠  ⁠Gitnux, ScienceDirect, and PMC on learning retention and pedagogy

## 👥 Contributors

This project was proudly built by *Team tripleITB*:

•⁠  ⁠[*Aaryan Antala*](https://www.linkedin.com/in/aaryan-antala/)
•⁠  ⁠[*Garv Rajput*](https://www.linkedin.com/in/garv-rajput-96b462234/)
•⁠  ⁠[*Kunal Mittal*](https://www.linkedin.com/in/kunal-mittal-749a1a27b/)
•⁠  ⁠[*Nirbhay Sharma*](https://www.linkedin.com/in/nirbhay-sharma-575639280/)

---
