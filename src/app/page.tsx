"use client";
import { useState, useEffect, useCallback } from "react";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";
import { Sdk } from "@circles-sdk/sdk";
import { Button, Typography, Spin, Alert, Space, Card, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const chainConfig = {
  circlesRpcUrl: "https://chiado-rpc.aboutcircles.com",
  pathfinderUrl: "https://chiado-pathfinder.aboutcircles.com",
  profileServiceUrl: "https://chiado-pathfinder.aboutcircles.com/profiles/",
  v1HubAddress: "0xdbf22d4e8962db3b2f1d9ff55be728a887e47710",
  v2HubAddress: "0xb80feeDfEce647dDc709777D5094fACD157BA001",
  migrationAddress: "0x12E815963A0b910288C7256CAD0d345c8F5db08E",
  nameRegistryAddress: "0x24b3fDCdD9fef844fB3094ef43c0A6Ac23a6dF9E",
  baseGroupMintPolicy: "0xE35c66531aF28660a1CdfA3dd0b1C1C0245D2F67",
};

export default function Home() {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [circlesAddress, setCirclesAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [circlesBalance, setCirclesBalance] = useState<string | null>(null);
  const [mintableAmount, setMintableAmount] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const initSdk = useCallback(async () => {
    try {
      const adapter = new BrowserProviderContractRunner();
      await adapter.init();

      const address = await adapter.address;
      const sdk = new Sdk(chainConfig, adapter);

      setSdk(sdk);
      setCirclesAddress(address);
      setIsConnected(true);
    } catch (error) {
      setError("Failed to initialize SDK.");
    }
  }, []);

  const fetchBalanceAndMintable = async () => {
    if (!sdk || !circlesAddress) return;

    try {
      const balance = await sdk.data.getTotalBalance(circlesAddress, true);
      setCirclesBalance(balance);

      const avatar = await sdk.getAvatar(circlesAddress);
      const availableToMint = await avatar.getMintableAmount();
      setMintableAmount(availableToMint.toString());

      setProfileCreated(true);
    } catch (err) {
      setError("Failed to fetch Circles data.");
    }
  };

  const createProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!sdk) throw new Error("SDK not initialized.");

      const avatar = await sdk.registerHuman();

      setProfileCreated(true);
      await fetchBalanceAndMintable();
    } catch (err) {
      setError("Failed to create Circles profile.");
    } finally {
      setLoading(false);
    }
  };

  const mintCircles = async () => {
    setIsMinting(true);
    setError(null);

    try {
      if (!sdk || !circlesAddress) throw new Error("SDK or address not initialized.");

      const avatar = await sdk.getAvatar(circlesAddress);
      await avatar.personalMint();

      await fetchBalanceAndMintable();
    } catch (err) {
      setError("Failed to mint Circles tokens.");
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      initSdk();
    }
  }, [isConnected, initSdk]);

  useEffect(() => {
    if (isConnected && sdk) {
      fetchBalanceAndMintable();
    }
  }, [isConnected, sdk]);

  return (
    <div style={{ padding: "24px", maxWidth: "500px", margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Connection Status */}
        {!isConnected ? (
          <Card style={{ textAlign: "center" }}>
            <Spin indicator={antIcon} tip="Connecting to MetaMask..." />
          </Card>
        ) : (
          <Alert
            message="Wallet Connected"
            description={`Address: ${circlesAddress}`}
            type="success"
            showIcon
          />
        )}

        {/* Profile Creation */}
        {!profileCreated && (
          <Card>
            <Button
              type="primary"
              onClick={createProfile}
              disabled={loading}
              block
              size="large"
            >
              {loading ? <Spin indicator={antIcon} /> : "Create Circles Profile"}
            </Button>
          </Card>
        )}

        {/* Balance Section */}
        {circlesBalance && (
          <Card>
            <Title level={4}>Your Circles Balance</Title>
            <Text>{circlesBalance} CRC</Text>
          </Card>
        )}

        {/* Minting Section */}
        {mintableAmount && (
          <Card>
            <Title level={4}>Available to Mint</Title>
            <Text>{mintableAmount} CRC</Text>
            <Divider />
            <Button
              type="primary"
              onClick={mintCircles}
              disabled={isMinting || mintableAmount === "0"}
              block
            >
              {isMinting ? <Spin indicator={antIcon} /> : "Mint Circles Tokens"}
            </Button>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert message="Error" description={error} type="error" showIcon />
        )}
      </Space>
    </div>
  );
}
