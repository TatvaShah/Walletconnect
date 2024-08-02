import React, { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useToken,
  useWalletClient,
  useDisconnect,
} from "wagmi";
import contractAbi from "./contract-abi";
import Image from "./image";
import BN from "bignumber.js";
import Modal from "react-modal";
import { WalletButton } from "@rainbow-me/rainbowkit";

const contractAddress = "0x93749e69560efe1ad6661903e47df538492c50a4";
const walletAddress = "0x93467f0F9a09b5478B0E2ECdA979045dda53750b";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const Web3Connect = ({ amount }) => {
  console.log(amount, typeof amount);
  const { disconnect: disconnectWallet } = useDisconnect();
  const { isConnected, address: connectedWalletAddress } = useAccount();
  const { data: walletData } = useWalletClient();
  const { data: balanceData } = useBalance({
    address: walletData?.account?.address,
    token: contractAddress,
    watch: true,
  });
  const [loader, setLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const tokenDecimals = new BN(9);
  const tokenAmountToTransfer = new BN(Math.ceil(Number(amount)));
  const calculatedTransferValue = tokenAmountToTransfer.multipliedBy(
    new BN(10).pow(tokenDecimals)
  );
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const handleOnTransaction = () => {
    if (!isPending) {
      setShowModal(false);
      setLoader(true);
      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "transfer",
        args: [walletAddress, calculatedTransferValue],
      });
    }
  };
  const OnCancelTransaction = () => {
    setLoader(false);
    setShowModal(false);
  };

  useEffect(() => {
    if (hash) {
      const transactionHash = hash;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            error: false,
            hash: transactionHash,
            amount: Number(Number(amount).toFixed(2)),
          })
        );
      }

      setLoader(false);
    }
  }, [hash]);

  useEffect(() => {
    if (error) {
      console.log(error, "error");
      const errorMessage = error.message.split("Contract Call:");
      if (errorMessage.length > 0) {
        let errorMessageToShow = errorMessage[0];
        if (
          errorMessageToShow.toLowerCase()?.includes("subtraction overflow")
        ) {
          errorMessageToShow = `Your EVDC balance is insufficient. EVDC tokens needed : ${Number(
            amount
          ).toFixed(2)} Your EVDC balance : ${Number(
            balanceData?.formatted
          ).toFixed(2)}`;
        } else {
          errorMessageToShow = `Something went wrong!`;
        }
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              error: true,
              message: errorMessageToShow,
            })
          );
        } else {
          alert(errorMessageToShow);
        }
      } else {
        alert("Something went wrong!");
      }
      setLoader(false);
    }
  }, [error]);

  useEffect(() => {
    if (isConnected && !isPending && amount) {
      setLoader(true);
      setTimeout(() => {
        setShowModal(true);
        // handleOnTransaction()
      }, 2000);
    }
  }, [isConnected, isPending, amount]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        marginTop: 20,
        gap: 20,
      }}
    >
      {
        <Modal style={customStyles} isOpen={showModal}>
          <h2>Confirmation</h2>
          <p>
            Are you sure you want to proceed with the transaction of EVDC token{" "}
            {Number(amount).toFixed(2)}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <button className="btn-class-2" onClick={handleOnTransaction}>
              <p className="btn-txt">{`Perform Transaction`}</p>
            </button>
            <button className="btn-class-3" onClick={OnCancelTransaction}>
              <p className="btn-txt">{`Cancel`}</p>
            </button>
          </div>
        </Modal>
      }
      <img src={Image.EVDC_LOGO}></img>
      {!isConnected ? (
        <WalletButton.Custom wallet="walletconnect">
          {({ ready, connect }) => {
            return (
              <button
                disabled={loader}
                className="btn-class-2"
                onClick={connect}
              >
                <p className="btn-txt">Connect Wallet</p>
              </button>
            );
          }}
        </WalletButton.Custom>
      ) : (
        <>
          <p style={{marginLeft: 10}}>Wallet Address: {connectedWalletAddress}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <button
              disabled={loader}
              className="btn-class-2"
              onClick={disconnectWallet}
            >
              <p className="btn-txt">Disconnect</p>
            </button>
            <button
              disabled={loader}
              className="btn-class-2"
              onClick={handleOnTransaction}
            >
              <p className="btn-txt">
                {loader ? `Loading...` : `Perform Transaction`}
              </p>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Web3Connect;
