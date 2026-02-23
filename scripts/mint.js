require("dotenv").config();
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Minimal ABI — only what mint.js needs
const ABI = [
  "function registerMedicine(string calldata uuid) external",
];

async function main() {
  // Read deployed contract address
  if (!fs.existsSync("./deployed-address.txt")) {
    console.error("❌ deployed-address.txt not found. Run `npm run deploy` first.");
    process.exit(1);
  }
  const contractAddress = fs.readFileSync("./deployed-address.txt", "utf8").trim();
  console.log(`📋 Using contract at: ${contractAddress}\n`);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Use first Hardhat account
  const signer = await provider.getSigner(0);
  console.log(`🔑 Minting from: ${await signer.getAddress()}\n`);

  const contract = new ethers.Contract(contractAddress, ABI, signer);

  // Create output folder
  const outDir = "./test_qrs";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // Generate 5 UUIDs, register on-chain, produce QR PNGs
  const uuids = Array.from({ length: 5 }, () => uuidv4());
  const results = [];

  for (let i = 0; i < uuids.length; i++) {
    const uuid = uuids[i];
    process.stdout.write(`[${i + 1}/5] Registering ${uuid} ... `);

    const tx = await contract.registerMedicine(uuid);
    await tx.wait();
    process.stdout.write(`✅ on-chain\n`);

    const qrPath = path.join(outDir, `qr_${i + 1}.png`);
    await QRCode.toFile(qrPath, uuid, { width: 300 });
    console.log(`       💾 QR saved → ${qrPath}`);

    results.push({ index: i + 1, uuid, qrPath });
  }

  // Save a summary JSON for reference
  fs.writeFileSync("./test_qrs/manifest.json", JSON.stringify(results, null, 2));

  console.log("\n🎉 Done! 5 medicines registered and QR codes generated.");
  console.log(`📁 Open the ${outDir}/ folder to find your QR images.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
