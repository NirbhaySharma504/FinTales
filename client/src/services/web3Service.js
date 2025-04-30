import { checkAndSwitchNetwork } from './walletService';
const VERBWIRE_API_KEY = import.meta.env.VITE_VERBWIRE_API_KEY;
const VERBWIRE_API_URL = import.meta.env.VITE_VERBWIRE_API_URL || 'https://api.verbwire.com/v1';
// Mock implementation of web3 service for NFT minting
export const mintNFT = async (metadata, file) => {
  try {
    console.log("Starting NFT minting process...");

    const form = new FormData();
    form.append('allowPlatformToOperateToken', 'true');
    form.append('chain', 'sepolia');
    form.append('name', metadata.name);
    form.append('description', metadata.description);
    
    // Attach the image file
    form.append('filePath', file);

    // // Optional: Add attributes if provided
    // if (metadata.itattributes) {
    //   form.append('attributes', JSON.stringify(metadata.attributes));
    // }

    // Get the connected wallet address from MetaMask
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error("No connected wallet found");
    }

    form.append('recipientAddress', accounts[0]);

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'X-API-Key': VERBWIRE_API_KEY
      },
      body: form
    };

    console.log("Sending request to Verbwire API with file upload...");

    const response = await fetch('https://api.verbwire.com/v1/nft/mint/quickMintFromFile', options);
    const data = await response.json();

    console.log("Verbwire API response:", data);

    if (!response.ok) {
      console.error("Error details:", data);
      throw new Error(data.message || "Failed to mint NFT");
    }

    return data;
  } catch (error) {
    console.error("Error in mintNFT:", error);
    throw error;
  }
};

// Function to get NFTs owned by a user
export const getUserNFTs = async (walletAddress, chain = 'sepolia') => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': VERBWIRE_API_KEY
      }
    };

    const response = await fetch(
      `https://api.verbwire.com/v1/nft/data/owned?walletAddress=${walletAddress}&chain=${chain}`,
      options
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user NFTs");
    }

    return data.nfts || [];
  } catch (error) {
    console.error("Error in getUserNFTs:", error);
    throw error;
  }
};

export default {
  mintNFT
};