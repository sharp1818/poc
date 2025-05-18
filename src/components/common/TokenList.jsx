import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import tokenABI from "../assets/abi/nyxcipher.json";

const TOKENS = [
  {
    name: "NYX",
    address: "0x72A009348c3f92E08e9e037069dBf00A6c2dd97c",
    abi: tokenABI,
  },
];

const TokenList = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    if (!isConnected || !address) {
      setTokenData([]);
      return;
    }

    const fetchData = async () => {
      const results = await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const [balance, owner] = await Promise.all([
              publicClient.readContract({
                address: token.address,
                abi: token.abi,
                functionName: 'balanceOf',
                args: [address],
              }),
              publicClient.readContract({
                address: token.address,
                abi: token.abi,
                functionName: 'getOwner',
              }),
            ]);

            return {
              name: token.name,
              address: token.address,
              balance: formatEther(balance),
              owner,
            };
          } catch (error) {
            console.error(`Error fetching data for token ${token.name}:`, error);
            return {
              name: token.name,
              address: token.address,
              balance: 'Error',
              owner: 'Error',
            };
          }
        })
      );
      setTokenData(results);
    };

    fetchData();
  }, [isConnected, address, publicClient]);

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-300">Please connect your wallet to view your tokens.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Your Tokens</h2>
      <div className="space-y-4">
        {tokenData.map((token) => (
          <div key={token.address} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white">{token.name}</h3>
            <p className="text-gray-300">Balance: {token.balance}</p>
            <p className="text-gray-300">Owner: {token.owner}</p>
            <p className="text-gray-300">Token Address: {token.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenList;