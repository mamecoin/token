const mameCoin = artifacts.require('mameCoin');

module.exports = (deployer) => {
  deployer.deploy(mameCoin);
};