import React from 'react';
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import the actual components you're testing
import InterestForm from '../../src/components/auth/InterestForm';
import Login from '../../src/components/auth/Login';
import LogoutButton from '../../src/components/auth/LogoutButton';
import PreferencesForm from '../../src/components/auth/PreferencesForm';
import Register from '../../src/components/auth/Register';
import Home from '../../src/components/home/Home';
import Footer from '../../src/components/layout/Footer';
import Layout from '../../src/components/layout/Layout';
import Navbar from '../../src/components/layout/Navbar';
import AchievementsPage from '../../src/components/nfts/AchievementsPage';
import NFTCard from '../../src/components/nfts/NFTCard';
import PreferencesPage from '../../src/components/preferences/PreferencesPage';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }))
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => ({})) }))
vi.mock('firebase/storage', () => ({ getStorage: vi.fn(() => ({})) }))

// Mock the entire AuthContext module
vi.mock('../../src/contexts/AuthContext', () => {
    const React = require('react');
    const mockContext = React.createContext({
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
    });
    return {
        AuthContext: mockContext,
        AuthProvider: ({ children }) => React.createElement(mockContext.Provider, { 
            value: {
                user: null,
                login: vi.fn(),
                logout: vi.fn(),
                register: vi.fn(),
            }
        }, children),
    };
});

describe('Component Tests', () => {
    test('renders InterestForm component', () => {
        render(<InterestForm />);
        expect(screen.getByRole('heading', { name: /select your interests/i })).toBeInTheDocument();
    });

    test('renders Login component', () => {
        render(<Login />);
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    test('renders LogoutButton component', () => {
        render(<LogoutButton />);
        expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    test('renders PreferencesForm component', () => {
        render(<PreferencesForm />);
        expect(screen.getByRole('heading', { name: /user preferences/i })).toBeInTheDocument();
    });

    test('renders Register component', () => {
        render(<Register />);
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    test('renders Home component', () => {
        render(<Home />);
        expect(screen.getByText(/welcome to fintales/i)).toBeInTheDocument();
    });

    test('renders Footer component', () => {
        render(<Footer />);
        expect(screen.getByText(/fintales/i)).toBeInTheDocument();
    });

    test('renders Layout component', () => {
        render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        );
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('renders Navbar component', () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );
        expect(screen.getByText(/fintales/i)).toBeInTheDocument();
    });

    test('renders AchievementsPage component', () => {
        render(<AchievementsPage />);
        expect(screen.getByText(/achievements/i)).toBeInTheDocument();
    });

    test('renders NFTCard component', () => {
        const mockNFT = {
            image: 'test.jpg',
            title: 'Test NFT',
            description: 'Test Description'
        };
        render(<NFTCard nft={mockNFT} />);
        expect(screen.getByText(/test nft/i)).toBeInTheDocument();
    });

    test('renders PreferencesPage component', () => {
        render(<PreferencesPage />);
        expect(screen.getByRole('heading', { name: /user preferences/i, level: 1 })).toBeInTheDocument();
    });
});