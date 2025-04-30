// Service to interact with MetaMask wallet

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return window.ethereum && window.ethereum.isMetaMask;
};

// Connect to MetaMask
export const connectToMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

// Get current account
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error("Error getting current account:", error);
    throw error;
  }
};

// Add listeners for account changes
export const addAccountChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', accounts => {
      callback(accounts[0] || null);
    });
  }
};

// Listen for network changes
export const addNetworkChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', chainId => {
      callback(chainId);
    });
  }
};

// Check network and switch if needed (to Mumbai testnet)
export const checkAndSwitchNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Mumbai chain ID is 0x13881
    if (chainId !== '0x13881') {
      try {
        // Try to switch to Mumbai
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Mumbai',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
                  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network:", addError);
            throw addError;
          }
        } else {
          console.error("Failed to switch network:", switchError);
          throw switchError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking network:", error);
    throw error;
  }
};