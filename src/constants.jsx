const CONTRACT_ADDRESS = '0x2D39D508C5b6075029c9e0b9Efd3E2EEdA9487A9';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    continent: characterData.continent,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    healingPoints: characterData.healingPoints.toNumber()
  };
};

const transformCharacterDataBoss = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformCharacterDataBoss };