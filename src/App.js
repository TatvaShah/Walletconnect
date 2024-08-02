import Web3Connect from "./Web3Connect";
import { useState, useEffect } from "react";
import axios from "axios";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const contractAddress = "0x93749e69560efe1ad6661903e47df538492c50a4";
const chains = [bsc, bscTestnet];
const projectId = "c1c90419ca0aeebdd454ed9c43d57657";

const config = getDefaultConfig({
  appName: "EVDC",
  projectId,
  chains,
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function App() {
  const searchParams = new URLSearchParams(document.location.search);
  const amount = searchParams.get("amount");
  const [tokenData, setTokenData] = useState(false);
  const fetchTokenPrice = async () => {
    try {
      // const tokenAddress = contractAddress // Replace '0x...' with the address of the token you want to retrieve
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd`
      );
      const priceInUSD = response?.data[contractAddress.toLowerCase()]?.usd;
      if (priceInUSD && typeof priceInUSD === "number") {
        setTokenData(priceInUSD);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  useEffect(() => {
    fetchTokenPrice();
  }, []);

  const calculatePrice = () => {
    if (tokenData) {
      const amountInNumber = Number(amount);
      const evdcToPurchase = (amountInNumber / tokenData).toString();
      console.log(evdcToPurchase, "logm!");
      return evdcToPurchase;
    }
  };
  return (
    <>
      <Web3ModalProvider>
        {amount && tokenData ? (
          <Web3Connect amount={tokenData ? calculatePrice(amount) : false} />
        ) : !amount ? (
          <div className="something-went-wrong">
            <p>something went wrong!</p>
          </div>
        ) : (
          <div className="something-went-wrong">
            <p>please wait</p>
          </div>
        )}
      </Web3ModalProvider>
    </>
  );
}

export default App;
