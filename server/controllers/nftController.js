const NFT = require('../models/nftModel');
const User = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/errorHandler');
const nftData = require('../utils/nftData');

// Get NFT data for the user
exports.getUserNFTData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user with populated NFTs
    const user = await User.findById(userId).populate('mintedNfts');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Get minted NFT IDs
    const mintedNfts = {};
    if (user.mintedNfts && user.mintedNfts.length > 0) {
      user.mintedNfts.forEach(nft => {
        mintedNfts[nft.nftId] = nft.blockExplorerUrl || true;
      });
    }
    
    return successResponse(res, 'NFT data fetched successfully', {
      userXP: user.xp || 0,
      walletAddress: user.walletAddress || '',
      walletConnected: !!user.walletAddress,
      mintedNfts
    });
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Save wallet address
exports.saveWalletAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return errorResponse(res, 'Wallet address is required', 400);
    }
    
    // Update user's wallet address
    const user = await User.findByIdAndUpdate(
      userId, 
      { walletAddress }, 
      { new: true }
    );
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, 'Wallet address saved successfully', {
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Error saving wallet address:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Mint NFT
exports.mintNFT = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nftId, transactionHash, blockExplorerUrl, contractAddress, tokenId } = req.body;
    
    if (!nftId) {
      return errorResponse(res, 'NFT ID is required', 400);
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Get NFT metadata from nftData
    const nftMetadata = nftData.find(nft => nft.id === parseInt(nftId));
    
    if (!nftMetadata) {
      return errorResponse(res, 'NFT not found', 404);
    }
    
    // Check if user has enough XP to mint
    if (user.xp < nftMetadata.xpRequired) {
      return errorResponse(res, `Not enough XP to mint this NFT. Required: ${nftMetadata.xpRequired}, Current: ${user.xp}`, 400);
    }
    
    // Check if user has already minted this NFT
    const existingNFT = await NFT.findOne({ userId, nftId });
    
    if (existingNFT) {
      return errorResponse(res, 'You have already minted this NFT', 400);
    }
    
    // Create a new NFT record
    const nft = new NFT({
      userId,
      nftId,
      name: nftMetadata.title,
      description: nftMetadata.description,
      imageUrl: nftMetadata.imageSrc,
      transactionHash,
      blockExplorerUrl,
      contractAddress,
      tokenId,
      chain: 'mumbai'
    });
    
    // Save the NFT
    await nft.save();
    
    // Add NFT to user's mintedNfts array
    user.mintedNfts.push(nft._id);
    await user.save();
    
    return successResponse(res, 'NFT minted successfully', { nft });
  } catch (error) {
    console.error('Error minting NFT:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all available NFTs
// in nftController.js
exports.getAllNFTs = async (req, res) => {
  try {
    //console.log('Sending NFT data to client:', nftData);
    return successResponse(res, 'NFTs fetched successfully', { nfts: nftData });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return errorResponse(res, error.message, 500);
  }
};