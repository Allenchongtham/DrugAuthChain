const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[4]; // use account #4 to avoid address collision with security scanners
  const DrugAuth = await hre.ethers.getContractFactory("DrugAuth", deployer);
  const drugAuth = await DrugAuth.deploy();
  await drugAuth.waitForDeployment();

  const address = await drugAuth.getAddress();
  console.log(`\n✅ DrugAuth deployed to: ${address}\n`);

  // Save address for mint.js
  fs.writeFileSync("./deployed-address.txt", address);
  console.log("📄 Contract address saved to deployed-address.txt");

  // Auto-update frontend .env so the UI always points at the right contract
  fs.writeFileSync("./client/.env.local", `VITE_CONTRACT_ADDRESS=${address}\n`);
  console.log("📄 Frontend contract address updated in client/.env.local");
  console.log("\nNext step: Run `npm run mint` to register test medicines and generate QR codes.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
