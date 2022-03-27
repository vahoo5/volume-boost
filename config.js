'use strict'
const ethers = require('ethers');
const settings = require('./user/settings.json');
const uniswap2 = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'.toLowerCase(); // v2
const uniswap_abi = '[{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}]';
const private_key = settings['PRIVATE_KEY'];
const token_address = settings['TOKEN_ADDRESS'];
const period = settings['AVG_TIME_BETWEEN_TRADES_SECONDS'];
const provider = settings['PROVIDER'];

const min_eth = parseFloat(settings['MIN_AMOUNT_ETH']);

const max_eth = parseFloat(settings['MAX_AMOUNT_ETH']);

const max_gas_price = ethers.utils.parseUnits(String(settings['MAX_GASPRICE_GWEI']), 9);

const wallet = new ethers.Wallet(private_key);

if (!(private_key && min_eth && max_eth && token_address && period && provider && token_address)) {
  throw 'Error in settings!'
}

module.exports = {
  provider,
  uniswap2,
  uniswap_abi,
  token_address,
  min_eth,
  wallet,
  period,
  max_eth,
  max_gas_price
}