import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import axios from 'axios';
import cron from 'node-cron';
import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { BUY_AMOUNT, JITO_MODE, PRIVATE_KEY, RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT, TARGET_ID, TWITTER_ACCESS_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_APP_KEY, TWITTER_APP_SECRET, TWITTER_TOKEN } from './constants';
import { getBuyTxWithJupiter } from './utils/swapOnlyAmm';
import { executeJitoTx } from './executor/jito';
import base58 = require('bs58');
import { execute } from './executor/legacy';

dotenv.config();
const seen = new Set();
const seenTokens = new Set();
const { getProxy } = require('./keys');

export const mainKp = Keypair.fromSecretKey(base58.decode(PRIVATE_KEY))
const jitoCommitment: Commitment = "confirmed"

const solanaConnection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT, commitment: "confirmed"
})

const client = new TwitterApi({
    appKey: TWITTER_APP_KEY,
    appSecret: TWITTER_APP_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
});

const getUserId = async (user_id: string) => {
    try {
        const res = await client.v2.userByUsername(user_id)
        return res.data.id
    } catch (error) {
        console.error("Fetching userId error => ", error)
    }
}


const main = async (target_id: string) => {
    try {
        await getProxy();
        const query = `from:${target_id} (ca OR CA OR "contract address") -is:retweet`;

        console.log("🚀 ~ main ~ query:", query)
        const response = await axios.get(
            "https://api.twitter.com/2/tweets/search/recent",
            {
                headers: {
                    Authorization: `Bearer ${TWITTER_TOKEN}`,
                },
                params: {
                    query: query,
                    max_results: 10
                },
            }
        );

        const tweets = response.data.data || [];
        for (let i = 0; i < tweets.length; i++) {
            const element = tweets[i];

            if (seen.has(element.id)) continue;
            seen.add(element.id);

            if (element.text.indexOf("RT @") > -1) continue;

            const text = element.text;

            const regex = /\bca[:;\s]+([1-9A-HJ-NP-Za-km-z]{32,44})/i;
            const match = text.match(regex);

            if (match) {
                const tokenAddress = match[1];
                if (seenTokens.has(tokenAddress)) continue;
                seenTokens.add(tokenAddress);
                console.log("New Token Detected:", tokenAddress);

                try {
                    const tokenPubkey = new PublicKey(tokenAddress);
                    const tx = await getBuyTxWithJupiter(
                        mainKp,
                        tokenPubkey,
                        BUY_AMOUNT
                    );

                    if (!tx) return;

                    const latestBlockhash = await solanaConnection.getLatestBlockhash();
                    if (JITO_MODE) {
                        await executeJitoTx(
                            [tx],
                            mainKp,
                            "confirmed"
                        );
                    } else {
                        await execute(
                            tx,
                            latestBlockhash,
                            true
                        );
                    }

                    console.log("✅ Buy success:", tokenAddress);
                } catch (err) {
                    console.error("❌ Buy failed:", err);
                }
            }
        }

        // Check rate limit headers and wait if necessary
        //@ts-ignore
        const remaining = response.headers['x-rate-limit-remaining'];
        const reset = response.headers['x-rate-limit-reset'];

        if (Number(remaining) === 0) {
            const waitTime = reset * 1000 - Date.now();
            console.log(`Rate limit reached. Waiting ${waitTime / 1000}s`);
            await new Promise(res => setTimeout(res, waitTime));
        }
//**         if (rateLimit && rateLimit.remaining === 0) {
//**            const waitTime = rateLimit.reset * 1000 - Date.now();
//**            console.log(`Rate limit reached. Waiting for ${waitTime / 1000} seconds`);
//**            await new Promise((resolve) => setTimeout(resolve, waitTime));
//**        } 
    } catch (error) {
        console.error("Error fetching tweets:", error);
    }
};

cron.schedule("*/1 * * * *", async () => {
    console.log("Calling every 1 minutes!");
    await main(TARGET_ID);
});