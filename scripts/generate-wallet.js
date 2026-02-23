const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("\n🔐 New Deployer Wallet Generated");
console.log("================================");
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log(`Mnemonic:    ${wallet.mnemonic.phrase}`);
console.log("\n⚠️  Save the private key — you will NOT see it again.");
console.log("📋 Copy the address → fund it from the Amoy faucet.\n");
