import Everpay from "everpay";
import { ethers } from "ethers";
import axios from "axios";
import { AR_EP_TAG, ARK_NFT_POOL } from "./constants.js";
import { getSnapshot } from "./calc.js";
const everpay = new Everpay.default();

import dotenv from "dotenv";
dotenv.config();

export async function distributeRewards() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth.llamarpc.com"
    );
    const signer = new ethers.Wallet(process.env.DISTRIBUTOR_PK, provider);
    const everpay = new Everpay.default({
      account: "0x862A810f6AB82f66ff730D09AC923B00B9C70a60",
      chainType: "ethereum",
      ethConnectedSigner: signer,
    });
    const usersList = (await getSnapshot())?.balances;

    for (const user of usersList) {
      const tx = await everpay.transfer({
        tag: AR_EP_TAG,
        amount: Number(user.ar_amount).toFixed(6),
        to: user.acc_id,
        data: {
          ans_reward_usr: user.acc_id,
          ar_amount: Number(user.ar_amount).toFixed(6),
        },
      });

      console.log(tx);
      console.log(`\ndistributed rewards for ${user.acc_id}\n\n\n`);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function distributeArkRewards() {
  try {
    const options = {
      method: "GET",
      url: `https://deep-index.moralis.io/api/v2/nft/0xB1Cdb97DDc2b05Ad9BE7BE17eaBBa3a0f42453fA/owners?chain=eth&format=decimal&media_items=false`,
      headers: {
        accept: "application/json",
        "X-API-Key": process.env.MORALIS_API_KEY,
      },
    };
        const provider = new ethers.providers.JsonRpcProvider(
      "https://eth.llamarpc.com"
    );

    const signer = new ethers.Wallet(process.env.DISTRIBUTOR_PK, provider);
    const everpay = new Everpay.default({
      account: "0x862A810f6AB82f66ff730D09AC923B00B9C70a60",
      chainType: "ethereum",
      ethConnectedSigner: signer,
    });

    const res = await axios.request(options);

    for (const domain of res?.data?.result) {
      delete domain.metadata;
    }

    const owners = res?.data?.result.map((token) => token.owner_of);
    console.log(owners);
    console.log(ARK_NFT_POOL / owners.length)
    for (const user of owners) {
    	console.log(user)
      const tx = await everpay.transfer({
        tag: AR_EP_TAG,
        amount: (ARK_NFT_POOL / owners.length).toFixed(6),
        to: user,
        data: {
          ans_reward_usr: user,
          ar_amount: ARK_NFT_POOL / owners.length,
        },
      });

      console.log(tx);
      console.log(`\ndistributed rewards for ${user}\n\n\n`);
    }
  } catch (error) {
    console.log(error);
    return [];
  }
}
