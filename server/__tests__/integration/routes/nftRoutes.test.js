/**
 * Integration Tests for NFT Routes
 * Tests: nftRoutes.js with Express app integration
 */

const request = require('supertest');
const express = require('express');

// Create mock user and NFT data
const mockUser = {
  _id: 'mock-user-id-123',
  firebaseUid: 'firebase-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  xp: 500,
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  mintedNfts: [],
  preferences: { difficulty: 'beginner' },
  save: jest.fn().mockResolvedValue(true)
};

const mockNFTData = [
  {
    id: 1,
    title: 'Budget Basics',
    description: 'Test NFT 1',
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
];

// Mock dependencies
jest.mock('../../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

jest.mock('../../../models/userModel', () => {
  const mockUserModel = jest.fn().mockImplementation(() => mockUser);
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  return mockUserModel;
});

jest.mock('../../../models/nftModel', () => {
  const mockNFT = jest.fn().mockImplementation(function(data) {
    this._id = 'nft-id-123';
    this.userId = data.userId;
    this.nftId = data.nftId;
    this.name = data.name;
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  });
  mockNFT.findOne = jest.fn();
  return mockNFT;
});

jest.mock('../../../utils/nftData', () => mockNFTData);

const admin = require('../../../config/firebase-config');
const User = require('../../../models/userModel');
const NFT = require('../../../models/nftModel');
const nftRoutes = require('../../../routes/nftRoutes');

describe('NFT Routes - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nfts', nftRoutes);
    
    // Error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful auth mock
    const decodedToken = { uid: 'firebase-uid-123' };
    admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
    User.findOne.mockResolvedValue(mockUser);
  });

  describe('Authentication on all routes', () => {
    test('GET /api/nfts/user-data should require authentication', async () => {
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/api/nfts/user-data')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('POST /api/nfts/wallet should require authentication', async () => {
      const response = await request(app)
        .post('/api/nfts/wallet')
        .send({ walletAddress: '0xabc' });

      expect(response.status).toBe(401);
    });

    test('POST /api/nfts/mint should require authentication', async () => {
      const response = await request(app)
        .post('/api/nfts/mint')
        .send({ nftId: 1 });

      expect(response.status).toBe(401);
    });

    test('GET /api/nfts/all should require authentication', async () => {
      const response = await request(app)
        .get('/api/nfts/all');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/nfts/user-data', () => {
    test('should return user NFT data successfully', async () => {
      const userWithNFTs = {
        ...mockUser,
        mintedNfts: [
          { nftId: 1, blockExplorerUrl: 'https://explorer.com/tx/1' }
        ]
      };

      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(userWithNFTs)
      });

      const response = await request(app)
        .get('/api/nfts/user-data')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userXP');
      expect(response.body.data).toHaveProperty('walletAddress');
      expect(response.body.data).toHaveProperty('walletConnected');
      expect(response.body.data).toHaveProperty('mintedNfts');
    });

    test('should handle user with no wallet', async () => {
      const userNoWallet = {
        ...mockUser,
        walletAddress: null,
        mintedNfts: []
      };

      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(userNoWallet)
      });

      const response = await request(app)
        .get('/api/nfts/user-data')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.data.walletConnected).toBe(false);
    });

    test('should return 404 when user not found', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/api/nfts/user-data')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/nfts/wallet', () => {
    test('should save wallet address successfully', async () => {
      const updatedUser = {
        ...mockUser,
        walletAddress: '0xnewwallet123'
      };

      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/nfts/wallet')
        .set('Authorization', 'Bearer valid-token')
        .send({ walletAddress: '0xnewwallet123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.walletAddress).toBe('0xnewwallet123');
    });

    test('should return 400 when wallet address is missing', async () => {
      const response = await request(app)
        .post('/api/nfts/wallet')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 404 when user not found', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/nfts/wallet')
        .set('Authorization', 'Bearer valid-token')
        .send({ walletAddress: '0xabc' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/nfts/mint', () => {
    test('should mint NFT successfully', async () => {
      const userWithXP = {
        ...mockUser,
        xp: 500,
        mintedNfts: [],
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(userWithXP);
      NFT.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/nfts/mint')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nftId: '1',
          transactionHash: '0xtxhash',
          blockExplorerUrl: 'https://explorer.com/tx/1',
          contractAddress: '0xcontract',
          tokenId: '1'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 400 when nftId is missing', async () => {
      const response = await request(app)
        .post('/api/nfts/mint')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(400);
    });

    test('should return 400 when user has insufficient XP', async () => {
      const userLowXP = {
        ...mockUser,
        xp: 50 // Less than required 100
      };

      User.findById.mockResolvedValue(userLowXP);

      const response = await request(app)
        .post('/api/nfts/mint')
        .set('Authorization', 'Bearer valid-token')
        .send({ nftId: '1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Not enough XP');
    });

    test('should return 400 when NFT already minted', async () => {
      User.findById.mockResolvedValue(mockUser);
      NFT.findOne.mockResolvedValue({ _id: 'existing-nft', nftId: 1 });

      const response = await request(app)
        .post('/api/nfts/mint')
        .set('Authorization', 'Bearer valid-token')
        .send({ nftId: '1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already minted');
    });

    test('should return 404 when NFT metadata not found', async () => {
      User.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/nfts/mint')
        .set('Authorization', 'Bearer valid-token')
        .send({ nftId: '999' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('NFT not found');
    });
  });

  describe('GET /api/nfts/all', () => {
    test('should return all available NFTs', async () => {
      const response = await request(app)
        .get('/api/nfts/all')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nfts');
      expect(Array.isArray(response.body.data.nfts)).toBe(true);
    });

    test('should include NFT details in response', async () => {
      const response = await request(app)
        .get('/api/nfts/all')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      const nfts = response.body.data.nfts;
      expect(nfts[0]).toHaveProperty('id');
      expect(nfts[0]).toHaveProperty('title');
      expect(nfts[0]).toHaveProperty('xpRequired');
    });
  });
});
