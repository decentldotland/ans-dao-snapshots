import {
  SNAPSHOT_TXID,
  ARSEED_GATEWAY_URL,
  LP_ADDRESS_EXCLUDED,
  REWARD_POOL_SIZE,
} from "./constants.js";
import axios from "axios";

export async function getSnapshot() {
  try {
    const req = (await axios.get(`${ARSEED_GATEWAY_URL}/${SNAPSHOT_TXID}`))
      ?.data;
    const excludedIndex = req.findIndex(
      (user) => user.acc_id == LP_ADDRESS_EXCLUDED
    );

    req.splice(excludedIndex, 1);

    const totalAns = req
      .map((user) => Number(user.balance) * 1e-18)
      .reduce((a, b) => a + b, 0);

    for (const user of req) {
      const computedBalance = Number(user.balance) * 1e-18;
      user.computed_balance = computedBalance;
      user.share_percentage = (computedBalance * 100) / totalAns;
      user.ar_amount = String((user.share_percentage / 100) * REWARD_POOL_SIZE);
    }

    const totalPercentage = req
      .map((user) => user.share_percentage)
      .reduce((a, b) => a + b, 0);

    console.log(JSON.stringify({
      balances: req,
      total_ans: totalAns,
      total_percentage: totalPercentage,
    }));

    return {
      balances: req,
      total_ans: totalAns,
    };
  } catch (error) {
    console.log(error);
    return [];
  }
}
