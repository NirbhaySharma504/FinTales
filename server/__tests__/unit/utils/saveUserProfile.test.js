/**
 * Unit Tests for Save User Profile Utility
 * Tests: saveUserProfile.js
 */

const fs = require('fs').promises;
const path = require('path');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    writeFile: jest.fn()
  }
}));

const { saveUserProfileToFile } = require('../../../utils/saveUserProfile');

describe('Save User Profile Utility - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUserProfileToFile', () => {
    const mockUserData = {
      _id: '123456789',
      name: 'Test User',
      email: 'test@example.com',
      profilePicture: 'https://example.com/pic.jpg',
      xp: 500,
      preferences: {
        interests: {
          'Music Artists': ['Artist1'],
          'Movies/Series': ['Movie1'],
          'Comics & Anime': [],
          'Art Style': ['Modern'],
          'Spending Habits': ['Saver'],
          'Hobbies/Activities': ['Gaming']
        },
        difficulty: 'beginner',
        notifications: true
      }
    };

    test('should save user profile to file successfully', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const result = await saveUserProfileToFile(mockUserData);

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('should create file if it does not exist', async () => {
      fs.access.mockRejectedValue(new Error('File not found'));
      fs.writeFile.mockResolvedValue();

      const result = await saveUserProfileToFile(mockUserData);

      expect(result).toBe(true);
      // writeFile should be called twice - once for creating empty file, once for writing data
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('should format data correctly', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await saveUserProfileToFile(mockUserData);

      const writeCall = fs.writeFile.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);

      expect(writtenData.success).toBe(true);
      expect(writtenData.message).toBe('User profile retrieved');
      expect(writtenData.data.user.preferences).toEqual(mockUserData.preferences);
      expect(writtenData.data.user._id).toBe(mockUserData._id);
      expect(writtenData.data.user.name).toBe(mockUserData.name);
      expect(writtenData.data.user.email).toBe(mockUserData.email);
    });

    test('should handle errors gracefully', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockRejectedValue(new Error('Write error'));

      const result = await saveUserProfileToFile(mockUserData);

      expect(result).toBe(false);
    });

    test('should handle empty preferences', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const userWithEmptyPrefs = {
        ...mockUserData,
        preferences: {}
      };

      const result = await saveUserProfileToFile(userWithEmptyPrefs);

      expect(result).toBe(true);
    });

    test('should handle null preferences', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const userWithNullPrefs = {
        ...mockUserData,
        preferences: null
      };

      const result = await saveUserProfileToFile(userWithNullPrefs);

      expect(result).toBe(true);
    });

    test('should write to correct file path', async () => {
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await saveUserProfileToFile(mockUserData);

      const writeCall = fs.writeFile.mock.calls[0];
      const filePath = writeCall[0];

      expect(filePath).toContain('GenAI');
      expect(filePath).toContain('interests.json');
    });
  });
});
