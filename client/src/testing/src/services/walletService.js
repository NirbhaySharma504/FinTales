// walletService.js
import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // Request account access
} else {
    console.warn('Please install MetaMask!');
}

export const getAccount = async () => {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
};

export const getBalance = async (address) => {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
};

export const sendTransaction = async (to, amount) => {
    const accounts = await web3.eth.getAccounts();
    const transactionParameters = {
        to,
        from: accounts[0],
        value: web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
    };

    return await web3.eth.sendTransaction(transactionParameters);
};