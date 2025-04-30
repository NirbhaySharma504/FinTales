const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');
const { protect } = require('../middleware/authMiddleware'); // Changed from authenticateToken to protect

// All routes require authentication
router.use(protect);

// Get user NFT data
router.get('/user-data', nftController.getUserNFTData);

// Save wallet address
router.post('/wallet', nftController.saveWalletAddress);

// Mint NFT
router.post('/mint', nftController.mintNFT);

// Get all available NFTs
router.get('/all', nftController.getAllNFTs);

module.exports = router;