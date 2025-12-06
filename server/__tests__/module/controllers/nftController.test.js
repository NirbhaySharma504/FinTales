/**
 * Module Tests for NFT Controller
 * Tests: nftController.js
 */

// Mock dependencies
jest.mock('../../../models/nftModel');
jest.mock('../../../models/userModel');
jest.mock('../../../utils/errorHandler', () => ({
  successResponse: jest.fn((res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  }),
  errorResponse: jest.fn((res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  })
}));
jest.mock('../../../utils/nftData', () => [
  {
    id: 1,
    title: 'Budget Basics',
    description: 'Test NFT',
    xpRequired: 100,
    imageSrc: '/assets/nfts/1.jpg'
  },
  {
    id: 2,
    title: 'First Budget Creator',
    description: 'Test NFT 2',
    xpRequired: 200,
    imageSrc: '/assets/nfts/2.jpg'
  }
]);

const NFT = require('../../../models/nftModel');
const User = require('../../../models/userModel');
const { successResponse, errorResponse } = require('../../../utils/errorHandler');
const nftData = require('../../../utils/nftData');
const {
  getUserNFTData,
  saveWalletAddress,
  mintNFT,
  getAllNFTs
} = require('../../../controllers/nftController');

describe('NFT Controller - Module Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      user: { id: 'user-123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getUserNFTData', () => {
    test('should return user NFT data successfully', async () => {
      const mockUser = {
        _id: 'user-123',
        xp: 500,
        walletAddress: '0x1234567890abcdef',
        mintedNfts: [
          { nftId: 1, blockExplorerUrl: 'https://explorer.com/tx/1' }
        ]
      };

      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserNFTData(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('user-123');
      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'NFT data fetched successfully',
        expect.objectContaining({
          userXP: 500,
          walletAddress: '0x1234567890abcdef',
          walletConnected: true
        })
      );
    });

    test('should return 404 when user not found', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getUserNFTData(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found',
        404
      );
    });

    test('should handle user with no wallet', async () => {
      const mockUser = {
        _id: 'user-123',
        xp: 100,
        walletAddress: null,
        mintedNfts: []
      };

      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserNFTData(mockReq, mockRes);

      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'NFT data fetched successfully',
        expect.objectContaining({
          walletConnected: false,
          walletAddress: ''
        })
      );
    });

    test('should handle user with no minted NFTs', async () => {
      const mockUser = {
        _id: 'user-123',
        xp: 50,
        walletAddress: '0xabc',
        mintedNfts: null
      };

      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserNFTData(mockReq, mockRes);

      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'NFT data fetched successfully',
        expect.objectContaining({
          mintedNfts: {}
        })
      );
    });

    test('should handle database errors', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getUserNFTData(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Database error',
        500
      );
    });
  });

  describe('saveWalletAddress', () => {
    test('should save wallet address successfully', async () => {
      mockReq.body = { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' };

      const updatedUser = {
        _id: 'user-123',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
      };

      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await saveWalletAddress(mockReq, mockRes);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-123',
        { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
        { new: true }
      );
      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'Wallet address saved successfully',
        { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' }
      );
    });

    test('should return 400 when wallet address is missing', async () => {
      mockReq.body = {};

      await saveWalletAddress(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Wallet address is required',
        400
      );
    });

    test('should return 404 when user not found', async () => {
      mockReq.body = { walletAddress: '0xabc' };
      User.findByIdAndUpdate.mockResolvedValue(null);

      await saveWalletAddress(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found',
        404
      );
    });
  });

  describe('mintNFT', () => {
    test('should mint NFT successfully', async () => {
      mockReq.body = {
        nftId: '1',
        transactionHash: '0xtxhash',
        blockExplorerUrl: 'https://explorer.com/tx/1',
        contractAddress: '0xcontract',
        tokenId: '1'
      };

      const mockUser = {
        _id: 'user-123',
        xp: 500,
        mintedNfts: [],
        save: jest.fn().mockResolvedValue(true)
      };

      const mockNFT = {
        _id: 'nft-123',
        userId: 'user-123',
        nftId: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(mockUser);
      NFT.findOne.mockResolvedValue(null);
      NFT.mockImplementation(() => mockNFT);

      await mintNFT(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('user-123');
      expect(mockNFT.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 400 when nftId is missing', async () => {
      mockReq.body = {};

      await mintNFT(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'NFT ID is required',
        400
      );
    });

    test('should return 404 when user not found', async () => {
      mockReq.body = { nftId: '1' };
      User.findById.mockResolvedValue(null);

      await mintNFT(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found',
        404
      );
    });

    test('should return 404 when NFT metadata not found', async () => {
      mockReq.body = { nftId: '999' }; // Non-existent NFT

      const mockUser = {
        _id: 'user-123',
        xp: 500
      };

      User.findById.mockResolvedValue(mockUser);

      await mintNFT(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'NFT not found',
        404
      );
    });

    test('should return 400 when user has insufficient XP', async () => {
      mockReq.body = { nftId: '2' }; // Requires 200 XP

      const mockUser = {
        _id: 'user-123',
        xp: 50 // Less than required
      };

      User.findById.mockResolvedValue(mockUser);

      await mintNFT(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        expect.stringContaining('Not enough XP'),
        400
      );
    });

    test('should return 400 when NFT already minted', async () => {
      mockReq.body = { nftId: '1' };

      const mockUser = {
        _id: 'user-123',
        xp: 500
      };

      const existingNFT = {
        _id: 'existing-nft',
        userId: 'user-123',
        nftId: 1
      };

      User.findById.mockResolvedValue(mockUser);
      NFT.findOne.mockResolvedValue(existingNFT);

      await mintNFT(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'You have already minted this NFT',
        400
      );
    });
  });

  describe('getAllNFTs', () => {
    test('should return all NFT data', async () => {
      await getAllNFTs(mockReq, mockRes);

      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'NFTs fetched successfully',
        { nfts: nftData }
      );
    });

    test('should include NFT metadata in response', async () => {
      await getAllNFTs(mockReq, mockRes);

      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'NFTs fetched successfully',
        expect.objectContaining({
          nfts: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              title: 'Budget Basics',
              xpRequired: 100
            })
          ])
        })
      );
    });
  });
});
