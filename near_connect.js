import dotenv from 'dotenv';
import nearAPI from 'near-api-js';

dotenv.config();

const { keyStores, KeyPair, connect } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();
const keyPair = KeyPair.fromString(process.env.PRIVATE_KEY);
await myKeyStore.setKey('testnet', process.env.ACCOUNT, keyPair);

const testnetConfig = {
networkId: "testnet",
keyStore: myKeyStore, // first create a key store
nodeUrl: "https://rpc.testnet.near.org",
walletUrl: "https://testnet.mynearwallet.com/",
helperUrl: "https://helper.testnet.near.org",
explorerUrl: "https://explorer.testnet.near.org",
};

export const near = await connect(testnetConfig);