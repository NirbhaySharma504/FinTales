import api from './api';

export const nftService = {
    // 1) Return the raw array, not the enclosing object
    getAllNFTs: async () => {
        try {
          const response = await api.get('/nfts/all');
          console.log('NFT API response:', response.data);
          
          // Extract the NFTs array from the response
          const nftsArray = response.data?.data?.nfts || [];
          
          // Ensure it's an array
          return Array.isArray(nftsArray) ? nftsArray : [];
        } catch (error) {
          console.error('Error fetching all NFTs:', error);
          return []; // Return empty array on error
        }
      },
  // Get user NFT data (XP, wallet connection status, minted NFTs)
  getUserNFTData: async () => {
    try {
      const response = await api.get('/nfts/user-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      throw error.response?.data || error;
    }
  },
  
  // Save user's wallet address
  saveWalletAddress: async (walletAddress) => {
    try {
      const response = await api.post('/nfts/wallet', { walletAddress });
      return response.data;
    } catch (error) {
      console.error('Error saving wallet address:', error);
      throw error.response?.data || error;
    }
  },
  
  // Mint an NFT
  mintNFT: async (nftId, transactionData) => {
    try {
      const response = await api.post('/nfts/mint', {
        nftId,
        ...transactionData
      });
      return response.data;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error.response?.data || error;
    }
  },
  
  // Get all available NFTs
  getAllNFTs: async () => {
    try {
      // Make the API request and store the full response
      const response = await api.get('/nfts/all');
      
      // Log the entire response object
      console.log('Raw API response:', response);
      
      // Log the structure of the data with JSON.stringify to see the exact format
      console.log('NFT data structure:', JSON.stringify(response.data, null, 2));
      
      // Log what we're expecting to find based on API naming
      console.log('Looking for nfts array at:', response.data?.data?.nfts);
      
      // Extract the NFTs array using optional chaining
      const nftsArray = response.data?.data?.nfts || [];
      
      // Log what we extracted
      console.log('Extracted nfts array:', nftsArray);
      console.log('Is array?', Array.isArray(nftsArray));
      
      // Ensure we return an array
      return Array.isArray(nftsArray) ? nftsArray : [];
    } catch (error) {
      console.error('Error fetching all NFTs:', error);
      return [];
    }
  },
  
  // Get local storage minted NFTs for a wallet
  getLocalMintedNFTs: (walletAddress) => {
    if (!walletAddress) return {};
    try {
      return JSON.parse(localStorage.getItem(walletAddress) || '{}');
    } catch (e) {
      console.error('Error parsing local NFTs:', e);
      return {};
    }
  },
  
  // Save local storage minted NFT for a wallet
  saveLocalMintedNFT: (walletAddress, nftId, blockExplorerLink) => {
    if (!walletAddress) return;
    try {
      const current = JSON.parse(localStorage.getItem(walletAddress) || '{}');
      current[nftId] = blockExplorerLink;
      localStorage.setItem(walletAddress, JSON.stringify(current));
    } catch (e) {
      console.error('Error saving local NFT:', e);
    }
  }
};

export default nftService;