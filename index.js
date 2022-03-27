// ssh -f -N -L 9001:localhost:8546 root@168.119.72.213
// node main.js
'use strict'
const ethers = require('ethers');
const fs = require('fs');
const { exit } = require('process');
const config = require('./config');

let nonce = -1;
let web3 = config.provider.startsWith("ws") ? new ethers.providers.WebSocketProvider(config.provider) : new ethers.providers.JsonRpcProvider(config.provider);
let account = config.wallet.connect(web3);
const uniswap_contract = new ethers.Contract(config.uniswap2, config.uniswap_abi, account);
let weth;
let balance;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const update_nonce = async () => {
  nonce = await web3.getTransactionCount(config.wallet.address);
}

function get_amount() {
  return (Math.random() * (config.max_eth - config.min_eth) + config.min_eth).toFixed(10);
}

const get_tx = async (buy, amount_ETH, amount_token = null) => {
  const to = account.address;
  let tx, min_amount, path;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
  if (buy){
    path = [weth, config.token_address];
    if (!amount_token){
      amount_token = (await uniswap_contract.getAmountsOut(amount_ETH, path))[1];
    }
    
    min_amount = amount_token.mul(ethers.BigNumber.from('70')).div(ethers.BigNumber.from('100'));
    tx = await uniswap_contract.populateTransaction.swapExactETHForTokensSupportingFeeOnTransferTokens(
      min_amount,
      path,
      to,
      deadline,
      { value: amount_ETH}
    );
  } else {
    path = [config.token_address, weth];
    if (!amount_token){
      amount_token = (await uniswap_contract.getAmountsIn(amount_ETH, path))[0];
    }
    min_amount = amount_ETH.mul(ethers.BigNumber.from('70')).div(ethers.BigNumber.from('100'));
    tx = await uniswap_contract.populateTransaction.swapExactTokensForETHSupportingFeeOnTransferTokens(
      amount_token,
      min_amount,
      path,
      to,
      deadline
    );
  }
  return {tx:tx, amount_token:amount_token};
}

const send_tx = async (tx, gasPrice, maxPriorityFeePerGas) => {
  tx["maxPriorityFeePerGas"] = maxPriorityFeePerGas;
  tx["gasPrice"] = gasPrice;
  tx["nonce"] = nonce;
  await account.sendTransaction(tx);
  nonce += 1;
  console.log('Sent');
}

const boost_volume = async () => {
  const amount_ETH = ethers.utils.parseUnits(String(get_amount()), 18);
  let buy = Math.round(Math.random(2)) == 0 ? true : false;
  buy = false;
  let result = await get_tx(buy, amount_ETH);
  let result1 = await get_tx(!buy, amount_ETH, result['amount_token']);
  const fee_data = await web3.getFeeData();
  await send_tx(result['tx'], fee_data["maxPriorityFeePerGas"].add(ethers.BigNumber.from("1")));
  await send_tx(result1['tx'], fee_data["maxPriorityFeePerGas"]);
}

const main = async () => {
  console.log('Starting...');
  

  weth = await uniswap_contract.WETH();
  nonce = await web3.getTransactionCount(config.wallet.address);

  balance = await web3.getBalance(config.wallet.address);
  if (config.min_eth > config.max_eth){
    console.log("Error: min > max");
    exit(1);
  }
  if (balance.lte(ethers.utils.parseUnits(String(config.min_eth)))) {
    console.log("Error: ETH balance lower than min buy");
    exit(1);
  }
  console.log('ETH balance:', parseFloat(ethers.utils.formatEther(String(balance))).toFixed(3));
  console.log('Token address:', config.token_address);
  console.log('Min trade amount ETH:', config.min_eth);
  console.log('Max trade amount ETH:', config.max_eth);
  
  await boost_volume();
  web3.on("block", async (blockNumber) => {
    const fee_data = await web3.getFeeData();
    update_nonce();
  });
}

main();