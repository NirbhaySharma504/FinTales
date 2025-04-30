const axios = require('axios');
const Lesson = require('../models/lessonModel');
const imageService = require('./imageService');
require('dotenv').config();

// Verbwire API
const VERBWIRE_API_URL = 'https://api.verbwire.com/v1';
const VERBWIRE_API_KEY = process.env.VERBWIRE_API_KEY;

/**
 * Mint an NFT for a user upon lesson completion
 */
exports.mintNFT = async ({ userId, lessonId, walletAddress, userName, userXp }) => {
  try {
    // Get lesson details for NFT metadata
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    if (!walletAddress) {
      throw new Error('Wallet address is required for minting NFT');
    }
    
    // Generate NFT name and description
    const nftName = `${lesson.title} Badge - CoinQuest`;
    const nftDescription = `Awarded to ${userName} for completing "${lesson.title}" with ${userXp} XP. This NFT represents your knowledge of ${lesson.concepts?.join(', ') || 'financial concepts'}.`;
    
    // Generate or use existing image prompt
    const imagePrompt = lesson.nftMetadata?.imagePrompt || 
      `Award badge for financial education achievement: ${lesson.title}. Modern, colorful, teen-friendly design.`;
    
    // Generate image for NFT
    const imageData = await imageService.generateImage(imagePrompt, '512x512');
    
    if (!imageData) {
      throw new Error('Failed to generate image for NFT');
    }
    
    // Prepare metadata for NFT
    const metadata = {
      name: nftName,
      description: nftDescription,
      image: imageData.url,
      attributes: [
        {
          trait_type: "Course",
          value: lesson.courseId.toString()
        },
        {
          trait_type: "Difficulty",
          value: lesson.difficulty.toString()
        },
        {
          trait_type: "XP Reward",
          value: lesson.xpReward.toString()
        },
        {
          trait_type: "Concepts",
          value: lesson.concepts?.join(", ") || lesson.title
        }
      ]
    };
    
    // Mint NFT via Verbwire API
    const response = await axios.post(`${VERBWIRE_API_URL}/nft/mint/quickMintFromMetadata`, {
      chain: "sepolia",
      recipientAddress: walletAddress,
      metadataName: nftName,
      metadataDescription: nftDescription,
      metadataImage: imageData.url,
      metadataAttributes: JSON.stringify(metadata.attributes)
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': VERBWIRE_API_KEY
      }
    });
    
    if (!response.data || !response.data.transaction) {
      throw new Error('NFT minting failed');
    }
    
    // Return NFT data
    return {
      name: nftName,
      description: nftDescription,
      imageUrl: imageData.url,
      transactionHash: response.data.transaction.transactionHash,
      contractAddress: response.data.transaction.contractAddress,
      tokenId: response.data.transaction.tokenID,
      chain: 'sepolia'
    };
  } catch (error) {
    console.error('NFT minting error:', error);
    return null;
  }
};