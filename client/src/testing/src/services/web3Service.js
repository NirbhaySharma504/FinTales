// web3Service.js
import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // Request account access if needed
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.warn('No Ethereum browser detected. You can check out MetaMask!');
}

export const getAccounts = async () => {
    const accounts = await web3.eth.getAccounts();
    return accounts;
};

export const getNetworkId = async () => {
    const networkId = await web3.eth.net.getId();
    return networkId;
};

export const sendTransaction = async (transactionObject) => {
    const transactionHash = await web3.eth.sendTransaction(transactionObject);
    return transactionHash;
};

export const getBalance = async (address) => {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
};