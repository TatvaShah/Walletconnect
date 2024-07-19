import { bsc, bscTestnet } from 'wagmi/chains'
import Web3Connect from './Web3Connect'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const contractAddress = '0x93749e69560efe1ad6661903e47df538492c50a4';
const chains = [bsc, bscTestnet]
const projectId = 'a6418a1e28c8c7ec2ef9fb805e53b33b'

const queryClient = new QueryClient();
const metadata = {
  name: 'Evdc',
  description: 'Evdc Network',
  url: 'https://evdc.network', // origin must match your domain & subdomain
  icons: ['https://evdc.network/cdn/shop/files/EVDC-01_26edacf5-f039-4b95-8e61-0396beba5b32.png']
}
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

function App() {
  const searchParams = new URLSearchParams(document.location.search)
  const amount = searchParams.get('amount');
  const [tokenData, setTokenData] = useState(false);
  const fetchTokenPrice = async () => {
    try {
      // const tokenAddress = contractAddress // Replace '0x...' with the address of the token you want to retrieve
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd`
      );
      const priceInUSD = response?.data[contractAddress.toLowerCase()]?.usd;
      if (priceInUSD && typeof priceInUSD === 'number') {
        setTokenData(priceInUSD)
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    }
  };


  useEffect(() => {
    fetchTokenPrice()
  }, [])

  const calculatePrice = () => {
    if (tokenData) {
      const amountInNumber = Number(amount);
      const evdcToPurchase = (amountInNumber / tokenData).toString();
      console.log(evdcToPurchase, "logm!")
      return evdcToPurchase;
    }

  }
  return (
    <>
      <Web3ModalProvider>
        {
          amount && tokenData ?
            <Web3Connect amount={tokenData ? calculatePrice(amount) : false} /> :
            !amount ? 
            <div className='something-went-wrong'>
              <p>something went wrong!</p>
            </div> :
              <div className='something-went-wrong'>
              <p>please wait</p>
            </div>

        }

      </Web3ModalProvider>
    </>
  )
}

export default App;