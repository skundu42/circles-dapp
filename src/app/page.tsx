"use client";
import { useState, useEffect, useCallback } from "react";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";
import { Sdk } from "@circles-sdk/sdk";
import { Card, Button, Typography, Spin, Alert, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Home() {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adapter, setAdapter] = useState<BrowserProviderContractRunner | null>(null);
  const [circlesProvider, setCirclesProvider] = useState<any>(null);
  const [circlesAddress, setCirclesAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [circlesBalance, setCirclesBalance] = useState<string | null>(null);
  const [mintableAmount, setMintableAmount] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const chainConfig = {
    circlesRpcUrl: "https://chiado-rpc.aboutcircles.com",
    pathfinderUrl: "https://chiado-pathfinder.aboutcircles.com",
    v2PathfinderUrl: "https://chiado-pathfinder.aboutcircles.com/pathfinder/",
    profileServiceUrl: "https://chiado-pathfinder.aboutcircles.com/profiles/",
    v1HubAddress: "0xdbf22d4e8962db3b2f1d9ff55be728a887e47710",
    v2HubAddress: "0xb80feeDfEce647dDc709777D5094fACD157BA001",
    migrationAddress: "0x12E815963A0b910288C7256CAD0d345c8F5db08E",
    nameRegistryAddress: "0x24b3fDCdD9fef844fB3094ef43c0A6Ac23a6dF9E",
    baseGroupMintPolicy: "0xE35c66531aF28660a1CdfA3dd0b1C1C0245D2F67",
  };

  const initSdk = useCallback(async () => {
    try {
      const adapter = new BrowserProviderContractRunner();
      await adapter.init();
      setAdapter(adapter);

      const provider = adapter.provider;
      setCirclesProvider(provider);

      const address = await adapter.address;
      setCirclesAddress(address);

      const sdk = new Sdk(chainConfig, adapter);
      setSdk(sdk);
      setIsConnected(true);
    } catch (error) {
      console.error("Error initializing SDK:", error);
      setError("Failed to initialize SDK.");
    }
  }, []);

  const fetchBalanceAndMintable = async () => {
    if (!sdk || !circlesAddress) {
      return;
    }

    try {
      const balance = await sdk.data.getTotalBalance(circlesAddress, true);
      setCirclesBalance(balance);

      // Fetch available mintable amount for the user
      const avatar = await sdk.getAvatar(circlesAddress);
      const availableToMint = await avatar.getMintableAmount();
      setMintableAmount(availableToMint.toString());

      setProfileCreated(true); // Assume profile exists if mintable amount is fetched
    } catch (err) {
      console.error("Error fetching Circles balance or mintable amount:", err);
      setError("Failed to fetch Circles data.");
    }
  };

  const createProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!sdk) {
        throw new Error("SDK not initialized.");
      }

      const avatar = await sdk.registerHuman();
      console.log("Avatar created:", avatar);

      setProfileCreated(true);
      await fetchBalanceAndMintable(); // Fetch balance and mintable amount after creating the profile
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err.message || "Failed to create Circles profile.");
    }
    setLoading(false);
  };

  const mintCircles = async () => {
    setIsMinting(true);
    setError(null);

    try {
      if (!sdk || !circlesAddress) {
        throw new Error("SDK or address not initialized.");
      }

      const avatar = await sdk.getAvatar(circlesAddress);
      await avatar.personalMint(); // Mint available CRC tokens
      console.log("Successfully minted Circles tokens");

      await fetchBalanceAndMintable(); // Update the balance and mintable amount after minting
    } catch (err: any) {
      console.error("Error minting Circles tokens:", err);
      setError(err.message || "Failed to mint Circles tokens.");
    }
    setIsMinting(false);
  };

  useEffect(() => {
    if (!isConnected) {
      initSdk();
    }
  }, [isConnected, initSdk]);

  useEffect(() => {
    if (isConnected && sdk) {
      fetchBalanceAndMintable(); // Fetch balance and mintable amount when connected
    }
  }, [isConnected, sdk]);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title="Connect Wallet" bordered>
          {!isConnected ? (
            <Spin indicator={antIcon} tip="Connecting to MetaMask..." />
          ) : (
            <Text type="secondary">Wallet connected: {circlesAddress}</Text>
          )}
        </Card>

        <Card title="Create Circles Profile" bordered>
          {profileCreated ? (
            <Alert
              message="Profile already created!"
              description="Your Circles profile has been created."
              type="info"
              showIcon
            />
          ) : (
            <Button
              type="primary"
              onClick={createProfile}
              disabled={loading || profileCreated}
            >
              {loading ? <Spin indicator={antIcon} /> : "Create New Circles Profile"}
            </Button>
          )}
        </Card>

        <Card title="Circles Balance" bordered>
          {circlesBalance ? (
            <Title level={4}>Your Circles Balance: {circlesBalance} CRC</Title>
          ) : (
            <Text type="secondary">No balance available. Create a profile first.</Text>
          )}
        </Card>

        <Card title="Mint Circles Tokens" bordered>
          {mintableAmount && (
            <Space direction="vertical">
              <Text>Available to Mint: {mintableAmount} CRC</Text>
              <Button
                type="primary"
                onClick={mintCircles}
                disabled={isMinting || mintableAmount === "0"}
              >
                {isMinting ? <Spin indicator={antIcon} /> : "Mint Circles Tokens"}
              </Button>
            </Space>
          )}
        </Card>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: "24px" }}
          />
        )}
      </Space>
    </div>
  );
}
