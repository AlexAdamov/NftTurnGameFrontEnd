import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const[currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Action that runs on component load
  const checkIfWalletIsConnected = async () => {
    
    try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      setIsLoading(false);
      return;
    } else {
      console.log('We have the ethereum object', ethereum);

      // Check if we are authorized to access the user's wallet by requestion access to // account
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      // User can have multiple authorized accounts, we grab the first one

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    }
  } catch (error) {
      console.log(error)
  }
  setIsLoading(false);
  };


  // If user has connected to your app **AND** does not have a character NFT - **Show SelectCharacter Component**
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }  
    if (!currentAccount) {
      return (
         <div className="connect-wallet-container">
        <img
          src="https://i.gifer.com/20SZ.gif"
          alt="Hippie Simpson Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT= {setCharacterNFT} />;
    }

  };


  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get Metamask');
        return;
      }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    console.log('Connected', accounts[0]);
    setCurrentAccount(accounts[0]);
  } catch(error) {
    console.log(error);
  }
};

  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch(error) {
      console.log(error)
    }
  } 

  useEffect(() => {
    setIsLoading(true);
    checkNetwork();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const characterNFT = await gameContract.checkifUserHasNFT();
      if (characterNFT.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(characterNFT));
        setIsLoading(false);
      } else {
        console.log('No character NFT found')
      }
    };

    // We conly want to run the following if we have a connected wallet
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Win over the Negativos </p>
          <p className="sub-text">A Negativo spreads doubt and negativity around but doesn't know better. <br></br> Fire good vibes to convert him to a Positivo. </p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
        <a className="pic-credits" href="http://www.freepik.com">Characters designed by macrovector / Freepik</a>
      </div>
    </div>
  );
};

export default App;
