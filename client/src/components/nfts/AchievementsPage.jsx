import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../../contexts/AuthContext';
import NFTCard from './NFTCard';
import nftService from '../../services/nftService';
import { isMetaMaskInstalled, connectToMetaMask, getCurrentAccount, addAccountChangeListener } from '../../services/walletService';
import '../../styles/Achievements.css';
import placeholderNfts from '../../utils/nftData';
const AchievementsPage = () => {
  const { userProfile } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [userNFTData, setUserNFTData] = useState({
    userXP: 0,
    walletAddress: '',
    walletConnected: false,
    mintedNfts: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      try {
        // 2) now this returns an array
        const all = await nftService.getAllNFTs();
        setNfts(Array.isArray(all) ? all : []);
      } catch {
        setNfts([]);
      }
    };
    fetch();
  }, []);
  // Check MetaMask installation on component mount
  useEffect(() => {
    setMetaMaskInstalled(isMetaMaskInstalled());
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountChange = async (account) => {
      if (account) {
        await handleWalletConnection(account);
      } else {
        handleDisconnect();
      }
    };

    addAccountChangeListener(handleAccountChange);
  }, []);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const currentAccount = await getCurrentAccount();
          if (currentAccount) {
            await handleWalletConnection(currentAccount);
          }
        } catch (error) {
          console.error('Error checking existing wallet connection:', error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Find the useEffect that loads NFT data (around line 76)

// Load NFT data when profile or wallet changes
useEffect(() => {
    // Fetch user NFT data and all available NFTs
    const fetchData = async () => {
      setLoading(true);
      try {
        // Set initial XP from user profile
        setUserNFTData(prev => ({
          ...prev,
          userXP: userProfile?.xp || 0
        }));
        
        // Get user NFT data
        const nftDataRes = await nftService.getUserNFTData();
        console.log('User NFT data response:', nftDataRes);
        
        // Update NFT data from backend
        setUserNFTData(prev => ({
          ...prev,
          userXP: nftDataRes.data?.userXP || userProfile?.xp || 0,
          mintedNfts: nftDataRes.data?.mintedNfts || {}
        }));
        
        // Get all available NFTs (this now returns an array directly)
        const nftsArray = await nftService.getAllNFTs();
        console.log('NFTs array:', nftsArray);
        
        // Set available NFTs (make sure it's an array)
        setNfts(Array.isArray(nftsArray) ? nftsArray : []);
        
        // If API returns empty array, use placeholder data
        if (!nftsArray || nftsArray.length === 0) {
        console.log('Using placeholder NFT data instead');
        setNfts(placeholderNfts);
        } else {
        setNfts(nftsArray);
    }
      } catch (err) {
        console.error('Error loading NFT data:', err);
        setError('Failed to load NFT data. Please try again.');
        // Initialize with empty array on error
        setNfts(placeholderNfts);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [userProfile, userNFTData.walletAddress]);
  
  // Remove any duplicate useEffect hooks that also fetch NFTs
  // There appears to be one around line 29-42 that should be removed

  // Handle MetaMask connection
  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install it to connect your wallet.');
      return;
    }

    setConnectingWallet(true);
    setError(null);

    try {
      const account = await connectToMetaMask();
      await handleWalletConnection(account);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet.');
    } finally {
      setConnectingWallet(false);
    }
  };

  // Handle wallet connection success
  const handleWalletConnection = async (account) => {
    if (!account) return;

    try {
      // Save wallet address to backend
      const response = await nftService.saveWalletAddress(account);
      
      setUserNFTData(prev => ({
        ...prev,
        walletAddress: account,
        walletConnected: true
      }));
      
      // Load local minted NFTs
      const localMintedNFTs = nftService.getLocalMintedNFTs(account);
      if (Object.keys(localMintedNFTs).length > 0) {
        setUserNFTData(prev => ({
          ...prev,
          mintedNfts: { ...prev.mintedNfts, ...localMintedNFTs }
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error saving wallet address:', err);
      setError(err.message || 'Failed to save wallet address.');
      return false;
    }
  };

  // Handle wallet disconnect
  const handleDisconnect = () => {
    setUserNFTData(prev => ({
      ...prev,
      walletAddress: '',
      walletConnected: false
    }));
  };

  // Handle NFT mint success
  const handleMintSuccess = (nftId, blockExplorerUrl) => {
    // Update state with new minted NFT
    setUserNFTData(prev => ({
      ...prev,
      mintedNfts: {
        ...prev.mintedNfts,
        [nftId]: blockExplorerUrl
      }
    }));
    
    // Also save to local storage (like in the minter project)
    if (userNFTData.walletAddress) {
      nftService.saveLocalMintedNFT(
        userNFTData.walletAddress,
        nftId,
        blockExplorerUrl
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <Typography variant="h4" component="h1" className="section-title">
          <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          My Achievements
        </Typography>
        <p className="achievements-description">
          Complete lessons and courses to earn XP, then unlock and mint NFT achievements!
        </p>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
          Your XP: {userNFTData.userXP}
        </Typography>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <AccountBalanceWalletIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Connect Wallet
        </Typography>

        {!metaMaskInstalled ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            MetaMask is not installed. Please install the{' '}
            <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
              MetaMask browser extension
            </a>{' '}
            to mint NFTs.
          </Alert>
        ) : !userNFTData.walletConnected ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnectWallet}
            disabled={connectingWallet}
            startIcon={<AccountBalanceWalletIcon />}
            className="wallet-button"
          >
            {connectingWallet ? <CircularProgress size={24} /> : 'Connect MetaMask'}
          </Button>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              MetaMask Connected: {userNFTData.walletAddress.substring(0, 6)}...
              {userNFTData.walletAddress.substring(userNFTData.walletAddress.length - 4)}
            </Alert>
            <Button
              variant="outlined"
              onClick={handleDisconnect}
              className="wallet-button"
            >
              Disconnect
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />


<div className="achievements-section">
  <h2 className="section-title">Available Achievements</h2>
  
  {nfts.length === 0 ? (
    <Alert severity="info" sx={{ textAlign: 'center', mt: 2 }}>
      No achievements available at the moment. Complete more lessons to unlock achievements!
    </Alert>
  ) : (
    <div className="nft-grid">
      {nfts.map(nft => (
        <div key={nft.id} className="nft-card-wrapper">
          <NFTCard
            nft={nft}
            userXP={userNFTData.userXP}
            isMinted={!!userNFTData.mintedNfts[nft.id]}
            walletConnected={userNFTData.walletConnected}
            onMintSuccess={handleMintSuccess}
            blockExplorerLink={userNFTData.mintedNfts[nft.id] || null}
            nftsLocked={!userNFTData.walletConnected}
          />
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
};

export default AchievementsPage;