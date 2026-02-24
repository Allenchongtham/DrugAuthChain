import { useState, useRef } from "react";
import { ethers } from "ethers";
import jsQR from "jsqr";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("VITE_CONTRACT_ADDRESS is not set. Run `npm run deploy` from the project root, then restart the Vite dev server.");
}

const ABI = [
  "function verifyAndBurn(string calldata uuid) external",
  "function isRegistered(string calldata uuid) external view returns (bool)",
];

const STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  SCANNING: "scanning",
  PENDING: "pending",
  AUTHENTIC: "authentic",
  FAKE: "fake",
  ERROR: "error",
};

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Wallet connection ───────────────────────────────────────────────────
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not detected! Install MetaMask and add the Localhost 8545 network.");
      return;
    }
    setStatus(STATUS.CONNECTING);
    try {
      // Force MetaMask to switch to Hardhat Local (chain ID 31337 = 0x7A69)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }],
        });
      } catch (switchErr) {
        // Chain not added yet — add it automatically
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x7A69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            }],
          });
        } else {
          throw switchErr;
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setWalletAddress(addr);
      setStatus(STATUS.IDLE);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage("Wallet connection rejected.");
    }
  }

  // ── QR decode from uploaded image ──────────────────────────────────────
  function decodeQR(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resolve(code.data);
        } else {
          reject(new Error("No QR code found in the image."));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = url;
    });
  }

  // ── Main scan + verify + burn flow ─────────────────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-uploaded for the "burned" test
    e.target.value = "";

    setStatus(STATUS.SCANNING);
    setMessage("Reading QR code...");
    setTxHash("");

    let uuid;
    try {
      uuid = await decodeQR(file);
      setMessage(`QR decoded: ${uuid}`);
    } catch (err) {
      setStatus(STATUS.FAKE);
      setMessage("Could not read QR code — treated as FAKE.");
      return;
    }

    if (!walletAddress) {
      setStatus(STATUS.ERROR);
      setMessage("Connect your wallet first, then scan again.");
      return;
    }

    setStatus(STATUS.PENDING);
    setMessage("Confirm the transaction in MetaMask...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.verifyAndBurn(uuid);
      setMessage("Transaction sent — waiting for confirmation...");
      await tx.wait();

      setTxHash(tx.hash);
      setStatus(STATUS.AUTHENTIC);
      setMessage("AUTHENTIC — Medicine verified and burned. This QR is now invalid.");
    } catch (err) {
      // Contract revert = fake or already used
      setStatus(STATUS.FAKE);
      const reason = err?.reason || err?.message || "Transaction reverted";
      if (reason.toLowerCase().includes("already") || reason.toLowerCase().includes("fake")) {
        setMessage("FAKE or ALREADY USED — Do not consume this medicine!");
      } else {
        setMessage(`FAKE / Error: ${reason}`);
      }
    }
  }

  // ── Result screen colors ────────────────────────────────────────────────
  const resultBg = {
    [STATUS.AUTHENTIC]: "#14532d",  // deep green
    [STATUS.FAKE]: "#7f1d1d",       // deep red
    [STATUS.PENDING]: "#1e3a5f",    // blue (waiting)
    [STATUS.SCANNING]: "#1c1c1c",
    [STATUS.IDLE]: "#1c1c1c",
    [STATUS.CONNECTING]: "#1c1c1c",
    [STATUS.ERROR]: "#3b1515",
  };

  const resultIcon = {
    [STATUS.AUTHENTIC]: "✅",
    [STATUS.FAKE]: "❌",
    [STATUS.PENDING]: "⏳",
    [STATUS.SCANNING]: "🔍",
    [STATUS.IDLE]: "💊",
    [STATUS.CONNECTING]: "🔌",
    [STATUS.ERROR]: "⚠️",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
          💊 DrugAuthChain
        </h1>
        <p style={{ color: "#888", marginTop: "0.4rem" }}>Scan once. Trust forever. Protect lives.</p>
      </div>

      {/* Missing contract address warning */}
      {!CONTRACT_ADDRESS && (
        <div style={{ background: "#7f1d1d", border: "1px solid #ef4444", borderRadius: 8, padding: "1rem 1.5rem", marginBottom: "1.5rem", maxWidth: 500, textAlign: "center" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>Contract address not configured</p>
          <p style={{ color: "#fca5a5", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Run <code style={{ background: "#450a0a", padding: "0.15rem 0.4rem", borderRadius: 4 }}>npm run deploy</code> from the project root, then restart this dev server.
          </p>
        </div>
      )}

      {/* Wallet */}
      <div style={{ marginBottom: "1.5rem" }}>
        {walletAddress ? (
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: "0.85rem", color: "#6ee7b7" }}>
            🟢 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} connected
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={status === STATUS.CONNECTING}
            style={btnStyle("#2563eb")}
          >
            {status === STATUS.CONNECTING ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={!walletAddress || status === STATUS.PENDING || status === STATUS.SCANNING}
        style={btnStyle(walletAddress ? "#7c3aed" : "#3a3a3a", !walletAddress)}
      >
        📷 Scan QR Code (Upload Image)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {!walletAddress && (
        <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Connect wallet to enable scanning
        </p>
      )}

      {/* Hidden canvas for QR decoding */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Result Panel */}
      {status !== STATUS.IDLE && (
        <div
          style={{
            marginTop: "2rem",
            width: "100%",
            maxWidth: 500,
            borderRadius: 16,
            padding: "2.5rem",
            background: resultBg[status] || "#1c1c1c",
            border: `2px solid ${status === STATUS.AUTHENTIC ? "#22c55e" : status === STATUS.FAKE ? "#ef4444" : "#333"}`,
            textAlign: "center",
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{resultIcon[status]}</div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: status === STATUS.AUTHENTIC ? "#4ade80" : status === STATUS.FAKE ? "#f87171" : "#e2e8f0",
              marginBottom: "0.75rem",
            }}
          >
            {status === STATUS.AUTHENTIC && "AUTHENTIC"}
            {status === STATUS.FAKE && "FAKE / USED"}
            {status === STATUS.PENDING && "VERIFYING..."}
            {status === STATUS.SCANNING && "READING..."}
            {status === STATUS.ERROR && "ERROR"}
          </div>
          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>{message}</p>
          {txHash && (
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#94a3b8", wordBreak: "break-all" }}>
              Tx: {txHash}
            </p>
          )}
        </div>
      )}

      {/* Reset button after result */}
      {(status === STATUS.AUTHENTIC || status === STATUS.FAKE || status === STATUS.ERROR) && (
        <button
          onClick={() => { setStatus(STATUS.IDLE); setMessage(""); setTxHash(""); }}
          style={{ ...btnStyle("#374151"), marginTop: "1rem" }}
        >
          Scan Another
        </button>
      )}

      {/* Footer */}
      <p style={{ marginTop: "auto", paddingTop: "3rem", color: "#4a4a4a", fontSize: "0.75rem" }}>
        ALGAERITHM — DrugAuthChain MVP · Localhost Hardhat Network
      </p>
    </div>
  );
}

function btnStyle(bg, disabled = false) {
  return {
    background: disabled ? "#2a2a2a" : bg,
    color: disabled ? "#555" : "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "opacity 0.2s",
  };
}
