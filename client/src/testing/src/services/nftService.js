import axios from 'axios';

const API_BASE_URL = 'https://api.example.com/nfts'; // Replace with your actual API base URL

export const fetchNFTs = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
};

export const createNFT = async (nftData) => {
    try {
        const response = await axios.post(API_BASE_URL, nftData);
        return response.data;
    } catch (error) {
        console.error('Error creating NFT:', error);
        throw error;
    }
};

export const updateNFT = async (nftId, nftData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${nftId}`, nftData);
        return response.data;
    } catch (error) {
        console.error('Error updating NFT:', error);
        throw error;
    }
};

export const deleteNFT = async (nftId) => {
    try {
        await axios.delete(`${API_BASE_URL}/${nftId}`);
    } catch (error) {
        console.error('Error deleting NFT:', error);
        throw error;
    }
};