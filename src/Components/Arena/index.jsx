import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData, transformCharacterDataBoss } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../../Components/LoadingIndicator';

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({ characterNFT, setCharacterNFT }) => {
  
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [otherPlayers, setOtherPlayers] = useState([]);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Firing good vibes...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('Fire good vibes Txn:', attackTxn);
        setAttackState('hit');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error firing good vibes:', error);
      setAttackState('');
    }
  };

  const runHealAction = async () => {
    try {
      if (gameContract) {
        console.log('Sending healing vibes...');
        const healTxn = await gameContract.healAnotherPlayer();
        await healTxn.wait();
        console.log('Healed another player Txn:', healTxn);
      }
    } catch (error) {
      console.error('Error trying to heal:', error);
    }
  };
  
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

useEffect(() => {
  const fetchBoss = async () => {
    const bossTxn = await gameContract.getBigBoss();
    console.log('Boss', bossTxn);
    setBoss(transformCharacterDataBoss(bossTxn))
  };

  const onAttackComplete = (newBossHp, newPlayerHp) => {
    const bossHp = newBossHp.toNumber();
    const playerHp = newPlayerHp.toNumber();
    console.log(`GoodVibesFiringComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

    setBoss((prevState) => {
      return { ...prevState, hp: bossHp};
    });
    setCharacterNFT((prevState) => {
      return { ...prevState, hp: playerHp };
    })
  };

  const getOtherplayers = async () => {
      try {
        console.log('Getting other players');

        const otherPlayersTxn = await gameContract.getAllOtherPlayers();
        console.log('otherPlayersTxn:', otherPlayersTxn);

        const otherPlayers = otherPlayersTxn.map((characterData) => 
        transformCharacterData(characterData)
      );

      setOtherPlayers(otherPlayers);
    } catch (error) {
      console.error('Something went wrong fetching other players:', error);
    }
  }

  const updateOtherplayers = async () => {
      try {
        console.log('Getting other players');

        const otherPlayersTxn = await gameContract.getAllOtherPlayers();
        console.log('otherPlayersTxn:', otherPlayersTxn);

        let newOtherPlayers = otherPlayersTxn.map((characterData) => 
        transformCharacterData(characterData)
      );
        console.log(otherPlayers)
      setOtherPlayers(prevState => newOtherPlayers);
    } catch (error) {
      console.error('Something went wrong fetching other players:', error);
    }
  }


    if (gameContract) {
    fetchBoss();
    getOtherplayers();
    gameContract.on('AttackComplete', onAttackComplete);
    gameContract.on('PlayerHealed', updateOtherplayers); 
  }

  return () => {
    if (gameContract) {
      gameContract.off('AttackComplete', onAttackComplete);
      gameContract.off('PlayerHealed', updateOtherplayers);  
    }
  }
}, [gameContract]);

const renderOtherPlayers = () => 
  otherPlayers.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
      <div className="stats-container1">
        <p>Continent: {character.continent}</p>
      </div>
      <div className="stats-container2">
        <p>Health pts: {character.hp}, Positive Vibes: {character.attackDamage}, Healing pts: {character.healingPoints} </p>
      </div>
    </div>
  ));


  return (
    <div className="arena-container">

    {/* Add your toast HTML right here */}
    {boss && characterNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`💥 ${boss.name} was hit by good vibes for ${characterNFT.attackDamage}!`}</div>
      </div>
    )}

    {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <h2>🔥 {boss.name} 🔥</h2>
          <div className="image-content">
            <img src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
            {`💥 Fire good vibes at ${boss.name}`}
          </button>
          <button className="cta-Healbutton" onClick={runHealAction}>
            {`🚑 Heal one of your fellow players`}
          </button>
        </div>
        {/* Add this right under your attack button */}
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Firing good vibes ❤️ 🌻</p>
        </div>
        )}
      </div>
    )}

    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Good Vibe Shot Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}
    <h2 className="OtherPlayers-heading">Other players</h2>
    <div className="character-grid">{renderOtherPlayers()}</div>
  </div>
  );
};

export default Arena;