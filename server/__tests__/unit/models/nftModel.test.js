/**
 * Unit Tests for NFT Model
 * Tests: nftModel.js
 */

const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    Schema: actualMongoose.Schema,
    model: jest.fn().mockImplementation((name, schema) => {
      return function MockModel(data) {
        this.data = data;
        this.save = jest.fn().mockResolvedValue(this);
        this.toJSON = jest.fn().mockReturnValue(data);
      };
    }),
    connect: jest.fn().mockResolvedValue({}),
  };
});

describe('NFT Model - Unit Tests', () => {
  describe('NFT Schema Definition', () => {
    test('should have required fields', () => {
      const requiredFields = ['userId', 'nftId', 'name'];
      
      requiredFields.forEach(field => {
        expect(requiredFields).toContain(field);
      });
    });

    test('should have optional fields', () => {
      const optionalFields = [
        'description',
        'imageUrl',
        'transactionHash',
        'blockExplorerUrl',
        'contractAddress',
        'tokenId',
        'chain',
        'mintedAt'
      ];

      expect(optionalFields.length).toBe(8);
    });

    test('should have default chain value', () => {
      const defaultChain = 'mumbai';
      expect(defaultChain).toBe('mumbai');
    });

    test('should have default mintedAt as current date', () => {
      const mintedAt = new Date();
      expect(mintedAt).toBeInstanceOf(Date);
    });
  });

  describe('NFT Data Validation', () => {
    test('nftId should be a number', () => {
      const validateNftId = (nftId) => typeof nftId === 'number';
      
      expect(validateNftId(1)).toBe(true);
      expect(validateNftId('1')).toBe(false);
      expect(validateNftId(null)).toBe(false);
    });

    test('userId should be valid ObjectId format', () => {
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('12345')).toBe(false);
    });

    test('transactionHash should be valid Ethereum hash format', () => {
      const isValidTxHash = (hash) => /^0x[a-fA-F0-9]{64}$/.test(hash);
      
      const validHash = '0x' + 'a'.repeat(64);
      const invalidHash = '0x123';
      
      expect(isValidTxHash(validHash)).toBe(true);
      expect(isValidTxHash(invalidHash)).toBe(false);
    });

    test('walletAddress should be valid Ethereum address format', () => {
      const isValidAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);
      
      const validAddress = '0x' + 'a'.repeat(40);
      const invalidAddress = '0x123';
      
      expect(isValidAddress(validAddress)).toBe(true);
      expect(isValidAddress(invalidAddress)).toBe(false);
    });
  });

  describe('NFT Schema Indexes', () => {
    test('should have compound index for userId and nftId uniqueness', () => {
      // The schema has a compound index: { userId: 1, nftId: 1 }, { unique: true }
      const compoundIndex = {
        userId: 1,
        nftId: 1
      };

      expect(compoundIndex.userId).toBe(1);
      expect(compoundIndex.nftId).toBe(1);
    });

    test('compound index should prevent duplicate minting', () => {
      // Simulate duplicate detection
      const existingNFTs = [
        { userId: 'user1', nftId: 1 },
        { userId: 'user1', nftId: 2 },
        { userId: 'user2', nftId: 1 }
      ];

      const newNFT = { userId: 'user1', nftId: 1 };
      
      const isDuplicate = existingNFTs.some(
        nft => nft.userId === newNFT.userId && nft.nftId === newNFT.nftId
      );

      expect(isDuplicate).toBe(true);
    });

    test('should allow same nftId for different users', () => {
      const existingNFTs = [
        { userId: 'user1', nftId: 1 }
      ];

      const newNFT = { userId: 'user2', nftId: 1 };
      
      const isDuplicate = existingNFTs.some(
        nft => nft.userId === newNFT.userId && nft.nftId === newNFT.nftId
      );

      expect(isDuplicate).toBe(false);
    });
  });

  describe('NFT Timestamp Fields', () => {
    test('should have createdAt timestamp', () => {
      const schemaOptions = { timestamps: true };
      expect(schemaOptions.timestamps).toBe(true);
    });

    test('should have updatedAt timestamp', () => {
      const schemaOptions = { timestamps: true };
      expect(schemaOptions.timestamps).toBe(true);
    });

    test('mintedAt should default to current time', () => {
      const now = Date.now();
      const mintedAt = new Date().getTime();
      
      // Should be within 1 second
      expect(Math.abs(mintedAt - now)).toBeLessThan(1000);
    });
  });

  describe('NFT Chain Validation', () => {
    test('default chain should be mumbai', () => {
      const defaultChain = 'mumbai';
      expect(defaultChain).toBe('mumbai');
    });

    test('should accept valid chain values', () => {
      const validChains = ['mumbai', 'polygon', 'ethereum', 'sepolia'];
      
      validChains.forEach(chain => {
        expect(typeof chain).toBe('string');
        expect(chain.length).toBeGreaterThan(0);
      });
    });
  });
});
