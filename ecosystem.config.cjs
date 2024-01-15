module.exports = {
  apps: [{
    name: "testnet-miner",
    script: "./index.js",
    instances: 3,
    exec_mode: 'cluster'
  }]
}