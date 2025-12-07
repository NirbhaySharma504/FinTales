import React from 'react';
import './home.scss';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <h1>Welcome to FinTales</h1>
            <p>Your journey into the world of NFTs and personalized experiences starts here.</p>
            <div className="features">
                <h2>Features</h2>
                <ul>
                    <li>Explore unique NFTs</li>
                    <li>Manage your preferences</li>
                    <li>Engage with a vibrant community</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;