# 🤖 Solana twitter sniper BOT

Twitter Solana Token Sniper Bot monitors a specific x account and detect token CA when they tweet new token CA.
<br>
And purchases token with the sol amount you defined.


# 👀 Usage
1. Clone the repository

    ```
    git clone https://github.com/AmanDiAngkasa/Solana-twitter-sniper-BOT.git
    cd Solana-twitter-sniper-BOT
    ```
2. Install dependencies

    ```
    npm install
    ```
3. Configure the environment variables

    Rename the .env.example file to .env and set main keypair's secret key, and others.

    format .env
    ```
    PRIVATE_KEY = your_base58_private_key...
    RPC_ENDPOINT = https://api.mainnet-beta.solana.com

    RPC_WEBSOCKET_ENDPOINT= wss://api.mainnet-beta.solana.com


    BUY_AMOUNT = 0.001  ( change with the amount you want to buy )
    JITO_MODE=true
    JITO_FEE=0.001
    SLIPPAGE = 10

    TWITTER_TOKEN = your bearer token
    TARGET_ID = 'elonmusk'
    TWITTER_APP_KEY = your consumer key
    TWITTER_APP_SECRET = your Consumer Key Secret
    TWITTER_ACCESS_TOKEN = your Access Token
    TWITTER_ACCESS_SECRET = your Access Token Secret

    ```

4. Run the bot

    ```
    npm start
    ```

## 💰 Support Me with Cryptocurrency

| Network | Wallet Address |
|---------|---------------|
| **EVM** | `0xFfb40F047f7BA0c3fdE14f4aeDd52b2dc50ea909` |
| **SOL** | `9np5Ureem2xGxvwKp6C3QhFjPNTntHGFpwLPVtgworMy` |
