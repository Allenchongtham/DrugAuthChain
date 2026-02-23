const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const DrugAuth = await hre.ethers.getContractFactory("DrugAuth");
  const drugAuth = await DrugAuth.deploy();
  await drugAuth.waitForDeployment();

  const address = await drugAuth.getAddress();
  console.log(`\n✅ DrugAuth deployed to: ${address}\n`);

  // Save address for mint.js and frontend
  fs.writeFileSync("./deployed-address.txt", address);
  console.log("📄 Contract address saved to deployed-address.txt");
  console.log("\nNext step: Run `npm run mint` to register test medicines and generate QR codes.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
