const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nftId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  transactionHash: String,
  blockExplorerUrl: String,
  contractAddress: String,
  tokenId: String,
  chain: {
    type: String,
    default: 'mumbai'
  },
  mintedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to prevent duplicate minting of the same NFT by the same user
nftSchema.index({ userId: 1, nftId: 1 }, { unique: true });

module.exports = mongoose.model('NFT', nftSchema);