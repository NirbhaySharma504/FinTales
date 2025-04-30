import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mintNFT } from '../../services/web3Service'; // You'll need to create this
import nftService from '../../services/nftService';

const NFTCard = ({ nft, userXP, isMinted, walletConnected, onMintSuccess, blockExplorerLink }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState(null);
  const [mintError, setMintError] = useState(null);
  
  // Check if NFT is unlocked based on XP
  const isUnlocked = userXP >= nft.xpRequired;
  const canMint = isUnlocked && walletConnected && !isMinted;

  // Handle mint button click
  const handleMint = async () => {
    if (!canMint || isMinting) return;
    
    setIsMinting(true);
    setMintStatus("Preparing to mint NFT...");
    setMintError(null);
    
    try {
      // Download image - in a production app, you'd handle this differently
      const imageResponse = await fetch(nft.imageSrc);
      const blob = await imageResponse.blob();
      
      // Convert blob to File
      const file = new File([blob], `${nft.title}.png`, { type: blob.type });

      setMintStatus("Minting NFT...");
      
      // In a real implementation, you'd connect to a blockchain service
      // This is a simplified example
      const mintResponse = await mintNFT({
        name: nft.title,
        description: nft.description
      }, file);

      // Save the minting info in your backend
      await nftService.mintNFT(nft.id, {
        transactionHash: mintResponse.transactionHash,
        blockExplorerUrl: mintResponse.blockExplorerUrl
      });
      
      setMintStatus("NFT minted successfully!");
      onMintSuccess(nft.id, mintResponse.blockExplorerUrl);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintError(`Failed to mint NFT: ${error.message || "Unknown error"}`);
      setMintStatus(null);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card 
      sx={{
        maxWidth: 280,
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)'
        },
        opacity: isUnlocked ? 1 : 0.8
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="150"
          image={nft.imageSrc}
          alt={nft.title}
          sx={{ filter: isUnlocked ? 'none' : 'grayscale(70%)' }}
        />
        
        {!isUnlocked && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <LockIcon sx={{ color: 'white', fontSize: 36 }} />
            <Typography variant="body2" color="white" sx={{ mt: 1 }}>
              {nft.xpRequired} XP required
            </Typography>
          </Box>
        )}
        
        {isMinted && (
          <Chip 
            label="MINTED" 
            color="success"
            icon={<CheckCircleIcon />}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              fontWeight: 'bold'
            }} 
          />
        )}
      </Box>
      
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {nft.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {nft.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Chip label={`XP: ${nft.xpRequired}`} color="primary" size="small" />
          
          {isUnlocked && !isMinted && (
            <Button
              variant="contained"
              color="primary"
              disabled={!canMint || isMinting}
              onClick={handleMint}
              size="small"
            >
              {isMinting ? <CircularProgress size={24} /> : 'Mint NFT'}
            </Button>
          )}
          
          {isMinted && blockExplorerLink && (
            <Button
              size="small"
              endIcon={<OpenInNewIcon />}
              href={blockExplorerLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </Button>
          )}
        </Box>
        
        {mintStatus && (
          <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
            {mintStatus}
          </Alert>
        )}
        
        {mintError && (
          <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }}>
            {mintError}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NFTCard;