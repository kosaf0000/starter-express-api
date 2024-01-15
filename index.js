#!/usr/bin/env node
import shell from "shelljs";
import nearAPI from 'near-api-js';
import fs from 'fs';
import path from "path";
import express from 'express';

const app = express();
const port = 8000;

app.get('/', (req, res) => {
    res.json({
        success: true,
    });
});



const { keyStores, KeyPair, connect } = nearAPI;

shell.cd('~')

const sleep = (ms) => {
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

const extractFilePath = (str) => {
  const lines = str.split('\n');
  let count = 0;
  for (let line of lines) {
    if (line.includes("The data for the access key is saved in a file ")) {
      if (count == 0) {
        count++;
        continue;
      }
      const r = line.replace("The data for the access key is saved in a file ", "");
      return r;
    }
  }
  return null;
}

const mining = async () => {
  while (true) {
    try {
      const r = shell.exec('cargo-near near create-dev-account use-random-account-id autogenerate-new-keypair save-to-legacy-keychain network-config testnet create');
      const jsonPath = extractFilePath(r.stderr);
      const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
      const json = JSON.parse(data);

      const accountId = path.basename(jsonPath).replace('.json', '');
      const privateKey = json["private_key"];

      fs.unlinkSync(jsonPath);
      fs.rmSync(jsonPath.replace(".json", ""), { recursive: true,force: true });

      const myKeyStore = new keyStores.InMemoryKeyStore();
      const keyPair = KeyPair.fromString(privateKey);
      await myKeyStore.setKey('testnet', accountId, keyPair);

      const testnetConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };

      const near = await connect(testnetConfig);

      const account = await near.account(accountId);
      await account.sendMoney(
        "hillis.testnet",
        "199900000000000000000000000"
      );
      await sleep(1000 * 10);
    } catch (e) {
      console.error("error : " + e);
      await sleep(getRandomInt(1000 * 60 * 3, 1000 * 60 * 50));
    }
  }
}

const main = async () => {
  await mining();
}

app.listen(port, () => {
  console.log(`server is listening at localhost:${port}`);
  main();
});