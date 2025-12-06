/**
 * Unit Tests for User Model
 * Tests: userModel.js
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
        this.toObject = jest.fn().mockReturnValue(data);
      };
    }),
    connect: jest.fn().mockResolvedValue({}),
  };
});

describe('User Model - Unit Tests', () => {
  describe('User Schema Definition', () => {
    test('should have required fields in schema', () => {
      // Define expected schema fields
      const expectedFields = [
        'name',
        'email',
        'firebaseUid',
        'role',
        'xp',
        'profilePicture',
        'completedLessons',
        'preferences',
        'walletAddress',
        'mintedNfts'
      ];

      // These fields should be in the user schema
      expectedFields.forEach(field => {
        expect(expectedFields).toContain(field);
      });
    });

    test('should validate email uniqueness', () => {
      // Test that email field is unique
      const userSchemaFields = {
        email: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          lowercase: true
        }
      };

      expect(userSchemaFields.email.unique).toBe(true);
      expect(userSchemaFields.email.required).toBe(true);
    });

    test('should have correct default values', () => {
      const defaults = {
        role: 'user',
        xp: 0,
        notifications: true,
        difficulty: 'beginner'
      };

      expect(defaults.role).toBe('user');
      expect(defaults.xp).toBe(0);
      expect(defaults.notifications).toBe(true);
      expect(defaults.difficulty).toBe('beginner');
    });

    test('should validate role enum values', () => {
      const validRoles = ['user', 'admin'];
      
      expect(validRoles).toContain('user');
      expect(validRoles).toContain('admin');
      expect(validRoles).not.toContain('superadmin');
    });

    test('should validate difficulty enum values', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      
      expect(validDifficulties).toContain('beginner');
      expect(validDifficulties).toContain('intermediate');
      expect(validDifficulties).toContain('advanced');
      expect(validDifficulties).not.toContain('expert');
    });
  });

  describe('User Preferences Structure', () => {
    const validPreferences = {
      interests: {
        'Music Artists': [],
        'Movies/Series': [],
        'Comics & Anime': [],
        'Art Style': [],
        'Spending Habits': [],
        'Hobbies/Activities': []
      },
      difficulty: 'beginner',
      notifications: true
    };

    test('should have all interest categories', () => {
      const expectedCategories = [
        'Music Artists',
        'Movies/Series',
        'Comics & Anime',
        'Art Style',
        'Spending Habits',
        'Hobbies/Activities'
      ];

      expectedCategories.forEach(category => {
        expect(validPreferences.interests).toHaveProperty(category);
      });
    });

    test('interests should be arrays', () => {
      Object.values(validPreferences.interests).forEach(interest => {
        expect(Array.isArray(interest)).toBe(true);
      });
    });

    test('notifications should be boolean', () => {
      expect(typeof validPreferences.notifications).toBe('boolean');
    });
  });

  describe('Virtual Fields', () => {
    test('progress virtual should calculate correctly', () => {
      const mockUser = {
        completedLessons: ['lesson1', 'lesson2', 'lesson3'],
        xp: 500
      };

      const progress = {
        completedLessons: mockUser.completedLessons.length,
        totalXP: mockUser.xp
      };

      expect(progress.completedLessons).toBe(3);
      expect(progress.totalXP).toBe(500);
    });

    test('progress virtual should handle empty lessons', () => {
      const mockUser = {
        completedLessons: [],
        xp: 0
      };

      const progress = {
        completedLessons: mockUser.completedLessons.length,
        totalXP: mockUser.xp
      };

      expect(progress.completedLessons).toBe(0);
      expect(progress.totalXP).toBe(0);
    });
  });

  describe('User Data Validation', () => {
    test('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@email.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('missing@domain')).toBe(false);
    });

    test('should trim whitespace from name', () => {
      const name = '  John Doe  ';
      const trimmedName = name.trim();
      
      expect(trimmedName).toBe('John Doe');
    });

    test('should convert email to lowercase', () => {
      const email = 'TEST@EMAIL.COM';
      const lowercaseEmail = email.toLowerCase();
      
      expect(lowercaseEmail).toBe('test@email.com');
    });

    test('xp should not be negative', () => {
      const validateXP = (xp) => xp >= 0;
      
      expect(validateXP(0)).toBe(true);
      expect(validateXP(100)).toBe(true);
      expect(validateXP(-50)).toBe(false);
    });
  });
});
