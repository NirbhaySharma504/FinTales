import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { mintNFT } from '../../services/web3Service';
import nftService from '../../services/nftService';
import '../../styles/Achievements.css';

const NFTCard = ({ nft, userXP, isMinted, walletConnected, onMintSuccess, blockExplorerLink, nftsLocked }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState(null);
  const [mintError, setMintError] = useState(null);
  
  // Add local state to track minting status
  const [localMinted, setLocalMinted] = useState(isMinted);
  const [localExplorerLink, setLocalExplorerLink] = useState(blockExplorerLink);
  
  // Synchronize with prop changes
  useEffect(() => {
    setLocalMinted(isMinted);
    setLocalExplorerLink(blockExplorerLink);
  }, [isMinted, blockExplorerLink]);
  
  const isUnlocked = userXP >= nft.xpRequired && !nftsLocked;
  const canMint = isUnlocked && walletConnected && !localMinted;

  const handleMint = async () => {
    if (!canMint || isMinting) return;
    
    setIsMinting(true);
    setMintStatus("Initiating minting process...");
    setMintError(null);
    
    try {
      const response = await fetch(nft.imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `${nft.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
      
      setMintStatus("Minting NFT on the blockchain...");
      
      const mintResponse = await mintNFT({
        name: nft.title,
        description: nft.description,
        attributes: nft.metadata?.attributes || []
      }, file);

      // Save the minting info in backend
      await nftService.mintNFT(nft.id, {
        transactionHash: mintResponse.transactionHash,
        blockExplorerUrl: mintResponse.blockExplorerUrl,
        contractAddress: mintResponse.contractAddress,
        tokenId: mintResponse.tokenId
      });
      
      // Update local state immediately
      setLocalMinted(true);
      setLocalExplorerLink(mintResponse.blockExplorerUrl);
      setMintStatus("NFT minted successfully!");
      
      // Also update parent state
      onMintSuccess(nft.id, mintResponse.blockExplorerUrl);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintError(error.message || "Unknown error occurred during minting");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className={`nft-card ${isUnlocked ? (localMinted ? 'minted' : 'unlocked') : 'locked'}`}>
      <div className="nft-image-container">
        <img 
          src={nft.imageSrc} 
          alt={nft.title} 
          className={`nft-image ${
            !isUnlocked ? 'locked-image' : 
            !localMinted ? 'greyscale-image' : ''
          }`} 
        />
        {!isUnlocked && (
          <div className="lock-overlay">
            <span className="lock-icon">🔒</span>
            <span className="xp-required">{nft.xpRequired} XP required</span>
          </div>
        )}
      </div>
      
      <div className="nft-content">
        <h3 className="nft-title">{nft.title}</h3>
        <p className="nft-description">{nft.description}</p>
        
        <div className="nft-footer">
          <div className="xp-badge">
            XP: {nft.xpRequired}
          </div>
          
          {isUnlocked && !localMinted && (
            <button 
              className={`mint-button ${canMint ? 'active' : 'disabled'}`}
              onClick={handleMint}
              disabled={!canMint || isMinting}
            >
              {isMinting ? <CircularProgress size={16} color="inherit" /> : 'Mint NFT'}
            </button>
          )}

          {localMinted && (
            <span className="minted-text">Minted</span>
          )}

          {!isUnlocked && (
            <span className="locked-text">Locked</span>
          )}
        </div>
        
        {mintStatus && <p className="mint-status">{mintStatus}</p>}
        {mintError && <p className="mint-error">{mintError}</p>}
      </div>
    </div>
  );
};

export default NFTCard;