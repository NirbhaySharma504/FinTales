import React from 'react';
import './home.scss';

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to FinTales</h1>
            <p>Your journey into the world of NFTs and digital storytelling begins here.</p>
            <div className="features">
                <h2>Features</h2>
                <ul>
                    <li>Explore NFTs</li>
                    <li>Create and share stories</li>
                    <li>Manage your preferences</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;