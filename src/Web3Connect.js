import React, { useEffect, useState } from 'react'
import { Web3Button } from '@web3modal/react'
import { useAccount, useContractWrite, useToken } from 'wagmi'
import contractAbi from './contract-abi'
import { ethers } from 'ethers'
import axios from 'axios'
import Image from './image'
import BigNumber from 'bignumber.js'
const contractAddress = '0xC3B4C4eF3fE02aD91cB57efda593ed07A9278cc0';
const walletAddress = '0x93467f0F9a09b5478B0E2ECdA979045dda53750b';


const Web3Connect = ({
    amount
}) => {
    console.log(amount, typeof amount)
    const { isConnected } = useAccount()
    const [loader, setLoader] = useState(false);

    const tokenDecimals = new BigNumber(9);
    const tokenAmountToTransfer = new BigNumber(amount);
    const transferVal = tokenAmountToTransfer.multipliedBy(new BigNumber(10).pow(tokenDecimals));
    const { isLoading, write, data, isSuccess, isError, error } = useContractWrite({ address: contractAddress, abi: contractAbi, functionName: 'transfer', args: [walletAddress, transferVal] });
    const handleOnTransaction = () => {
        if (!isLoading) {
            setLoader(true);
            write()
        }
    }

    useEffect(() => {
        if (isSuccess) {
            const transactionHash = data?.hash;
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(transactionHash);
            }

            setLoader(false);
        }
    }, [isSuccess])
   
    useEffect(() => {
        if (isError) {
            const errorMessage = error.message.split('Contract Call:');
            if (errorMessage.length > 0) {
                alert(errorMessage[0].trimEnd())
            } else {
                alert("Something went wrong!")
            }
            setLoader(false);
        }
    }, [isError])

    useEffect(() => {
        if (isConnected && !isLoading && amount) {
            setLoader(true);
            setTimeout(() => {
                handleOnTransaction()
            }, 2000)
        }
    }, [isConnected, isLoading,amount])

    return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', flex: 1, marginTop: 20, gap: 20 }}>
            <img src={Image.EVDC_LOGO}></img>
            <Web3Button icon={'show'} balance='show' label='Connect Wallet' />
            {
                isConnected && <button disabled={loader} className='btn-class-2' onClick={handleOnTransaction} ><p className='btn-txt'>{loader ? `Loading...` : `Perform Transaction`}</p></button>
            }
        </div>

    )
}

export default Web3Connect;