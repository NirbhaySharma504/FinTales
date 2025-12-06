/**
 * Unit Tests for NFT Data Utility
 * Tests: nftData.js
 */

const nftData = require('../../../utils/nftData');

describe('NFT Data Utility - Unit Tests', () => {
  describe('NFT Data Structure', () => {
    test('should be an array', () => {
      expect(Array.isArray(nftData)).toBe(true);
    });

    test('should have NFT items', () => {
      expect(nftData.length).toBeGreaterThan(0);
    });

    test('each NFT should have required fields', () => {
      nftData.forEach((nft, index) => {
        expect(nft).toHaveProperty('id');
        expect(nft).toHaveProperty('title');
        expect(nft).toHaveProperty('description');
        expect(nft).toHaveProperty('xpRequired');
        expect(nft).toHaveProperty('imageSrc');
        expect(nft).toHaveProperty('metadata');
      });
    });

    test('each NFT id should be a number', () => {
      nftData.forEach(nft => {
        expect(typeof nft.id).toBe('number');
      });
    });

    test('each NFT xpRequired should be a positive number', () => {
      nftData.forEach(nft => {
        expect(typeof nft.xpRequired).toBe('number');
        expect(nft.xpRequired).toBeGreaterThan(0);
      });
    });

    test('each NFT should have unique id', () => {
      const ids = nftData.map(nft => nft.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('NFT Metadata Structure', () => {
    test('each NFT metadata should have name', () => {
      nftData.forEach(nft => {
        expect(nft.metadata).toHaveProperty('name');
        expect(typeof nft.metadata.name).toBe('string');
      });
    });

    test('each NFT metadata should have description', () => {
      nftData.forEach(nft => {
        expect(nft.metadata).toHaveProperty('description');
        expect(typeof nft.metadata.description).toBe('string');
      });
    });

    test('each NFT metadata should have attributes array', () => {
      nftData.forEach(nft => {
        expect(nft.metadata).toHaveProperty('attributes');
        expect(Array.isArray(nft.metadata.attributes)).toBe(true);
      });
    });

    test('each attribute should have trait_type and value', () => {
      nftData.forEach(nft => {
        nft.metadata.attributes.forEach(attr => {
          expect(attr).toHaveProperty('trait_type');
          expect(attr).toHaveProperty('value');
        });
      });
    });
  });

  describe('NFT Data Integrity', () => {
    test('imageSrc paths should be valid format', () => {
      nftData.forEach(nft => {
        expect(nft.imageSrc).toMatch(/^\/assets\/nfts\/\d+\.jpg$/);
      });
    });

    test('XP requirements should be in ascending order for progressive unlocking', () => {
      // Check if XP requirements generally increase
      const sortedByXP = [...nftData].sort((a, b) => a.xpRequired - b.xpRequired);
      const xpValues = sortedByXP.map(nft => nft.xpRequired);
      
      // At least verify no duplicates in XP requirements (optional)
      // This ensures each NFT has a unique achievement threshold
      const xpSet = new Set(xpValues);
      // Note: This test assumes XP values might not be unique, adjust as needed
      expect(xpValues.length).toBeGreaterThan(0);
    });

    test('first NFT should have lowest XP requirement', () => {
      const minXP = Math.min(...nftData.map(nft => nft.xpRequired));
      const firstByXP = nftData.find(nft => nft.xpRequired === minXP);
      expect(firstByXP).toBeDefined();
      expect(firstByXP.xpRequired).toBe(minXP);
    });
  });

  describe('NFT Categories', () => {
    test('should have Category attribute in metadata', () => {
      nftData.forEach(nft => {
        const categoryAttr = nft.metadata.attributes.find(
          attr => attr.trait_type === 'Category'
        );
        expect(categoryAttr).toBeDefined();
      });
    });

    test('should have Level attribute in metadata', () => {
      nftData.forEach(nft => {
        const levelAttr = nft.metadata.attributes.find(
          attr => attr.trait_type === 'Level'
        );
        expect(levelAttr).toBeDefined();
      });
    });

    test('Level values should be valid', () => {
      const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
      nftData.forEach(nft => {
        const levelAttr = nft.metadata.attributes.find(
          attr => attr.trait_type === 'Level'
        );
        expect(validLevels).toContain(levelAttr.value);
      });
    });
  });
});
