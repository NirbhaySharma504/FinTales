import React from 'react';
import './NFTCard.css'; // Assuming you have a CSS file for styling

const NFTCard = ({ nft }) => {
    return (
        <div className="nft-card">
            <img src={nft.image} alt={nft.title} className="nft-image" />
            <div className="nft-details">
                <h3 className="nft-title">{nft.title}</h3>
                <p className="nft-description">{nft.description}</p>
                <span className="nft-price">{nft.price} ETH</span>
            </div>
        </div>
    );
};

export default NFTCard;