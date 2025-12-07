import React from 'react';
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }))
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => ({})) }))
vi.mock('firebase/storage', () => ({ getStorage: vi.fn(() => ({})) }))

describe('App Component', () => {
  test('renders the main layout', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const navbarElement = screen.getByRole('navigation');
    expect(navbarElement).toBeInTheDocument();

    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const homeElement = screen.getByText(/welcome to fintales/i);
    expect(homeElement).toBeInTheDocument();
  });
});