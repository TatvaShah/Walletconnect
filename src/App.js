import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import Web3Connect from './Web3Connect'
import { useState, useEffect } from 'react'
import axios from 'axios'
const contractAddress = '0xC3B4C4eF3fE02aD91cB57efda593ed07A9278cc0';
const walletAddress = '0x93467f0F9a09b5478B0E2ECdA979045dda53750b';
const chains = [bsc, bscTestnet]
const projectId = 'a6418a1e28c8c7ec2ef9fb805e53b33b'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)
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
      <WagmiConfig config={wagmiConfig}>
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

      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default App;